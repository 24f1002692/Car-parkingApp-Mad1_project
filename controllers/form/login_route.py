import re, random
import os, time
import sib_api_v3_sdk

from db import db
from redisClient import redis_client_2
from flask import Blueprint, render_template, request, jsonify, flash, session, redirect, url_for, make_response

from models.user_model.user import User, PasswordResetToken
from models.adminDashboard_model.parkingLots import Lot
from models.user_model.userSchema import LoginModel

from controllers.form.generators import generate_jwt, decode_jwt, generate_jwt_email
from controllers.middlewares.validate_form import validate_form


# Set up api-key
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = os.getenv('BREVO-API-KEY')

# api_instance(email_sender)
email_sender = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))


role_bp = Blueprint('role', __name__, url_prefix='/TruLotParking/role')
login_bp = Blueprint('login', __name__, url_prefix='/TruLotParking')



@role_bp.route('/adminDashboard')
def adminDashboard():
    token = request.cookies.get('token')
    if not token:
        return render_template('/components/error_page.html', error='Unauthorized User / Admin'), 401

    decoded = decode_jwt(token)
    if not decoded:
        return render_template('/components/error_page.html', error='Invalid User / Admin request (token missing or invalid)'), 401

    username = decoded.get('username', 'Guest')
    lots = Lot.query.filter_by(deleteLot=False).all()
    return render_template('/admin/adminPage.html', username=username, lots=lots)

@role_bp.route('/userDashboard')
def userDashboard():
    token = request.cookies.get('token')
    if not token:
        return render_template('/components/error_page.html', error='Unauthorized User / Admin'), 401

    decoded = decode_jwt(token)
    if not decoded:
        return render_template('/components/error_page.html', error='Invalid User / Admin request (token missing or invalid)'), 401
        
    username = decoded.get('username', 'Guest')
    return render_template('/user/user_page.html', username=username)


@login_bp.route('/loginUser')
def login_form():
    return render_template('/form/login_form.html')


@login_bp.route('/yourDashboard', methods=['POST'])      # login.login_form_submit(used in login form) is equivalent to /yourDashboard, where login is blueprint name
@validate_form(LoginModel)
def login_form_submit():
    validated_data = request.validated_data
    email = validated_data.email
    password = validated_data.password
        
    try:
        user = User.query.filter_by(email=email, password=password).first()

        if user :
            token = generate_jwt(email, user.name)
            if user.role == 'admin':
                response = make_response(redirect(url_for('role.adminDashboard')))    # /role/adminDashboard
            elif user.role == 'user':
                response = make_response(redirect(url_for('role.userDashboard')))
            else:
                response = make_response('Invalid role', 403)

            response.set_cookie(
                'token',
                token,
                httponly=True,
                secure=True,     
                samesite='Strict'
            )
            return response
        else:
            flash('Username or Password is incorrect, Try again with correct credentials...')
            return render_template('/form/login_form.html', email = email, password = password)
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal server error (Database error)'), 500
    

@login_bp.route('/logout')
def logout():
    response = make_response(redirect(url_for('TruLotParking.TruLotParking')))
    response.set_cookie('token', '', expires=0)  
    return response


@login_bp.route('/reset/change-password', methods=['GET', 'POST'])    # here user will submit forms, so render templates is better to show error to users.
def reset_password_form():
    token = request.args.get('token')
    if request.method == 'POST':
        try:
            if not token:
                return render_template('/components/error_page.html', error='Unauthorized User'), 401
            
            token_record = PasswordResetToken.query.filter_by(token=token).first()
            if not token_record or token_record.used:
                return render_template('/components/error_page.html', error='This link has already been used or expired.'), 401

            decoded = decode_jwt(token)
            if not decoded:
                return render_template('/components/error_page.html', error='Link expired or invalid'), 401

            email = decoded.get('email')
            password = request.form.get('password')

            if not password:
                return jsonify({'success': False, 'error': 'Password is required'}), 400
            
            if len(password) < 5 or len(password) > 15:
                return jsonify({'success':False, 'error':'length of password must be between 5-15 string.'}), 400
            if not re.search(r"[A-Z]", password):
                return jsonify({'success':False, 'error':'password must include atleast one capital letter'}), 400
            if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
                return jsonify({'success':False, 'error':'password must include atleast one special letter'}), 400
                
            user = User.query.filter_by(email=email).first()
            if user and user.role == 'user':
                user.password = password
                token_record.used = True
                db.session.commit()
                return render_template('/form/changed_password.html', message='Password changed successfully'), 200

            return render_template('/components/error_page.html', error='Invalid user'), 401

        except Exception as error:
            print(error)
            return render_template('/components/error_page.html', error='Internal Server Error'), 500

    # GET method
    return render_template('/form/change_password.html', token=token)


@login_bp.route('/request-reset-password-form', methods=['GET', 'POST'])         # reset link can return json on all return (frontend fetch)
def resetPasswordForm():
    if request.method == 'POST':
        email = request.form.get('email')

        if not email:
            return jsonify({'success':False, 'message':'email field is required'}), 200
        
        if email :
            try:
                record = User.query.filter_by(email=email).first()
                if not record:
                    return jsonify({'success':False, 'message':'No Accounts exists with this email'}), 403
                
                if record.role != 'user':
                    return jsonify({'success': False, 'message': 'Password reset is only allowed for user accounts'}), 403
                
                reset_limit_key = email
                reset_max_requests = 3
                reset_limit_window = 3600

                current_count = redis_client_2.get(reset_limit_key)
                current_count = int(current_count) if current_count else 0

                if current_count > reset_max_requests:
                    return jsonify({'success': False, 'message': 'OTP request limit reached. Try again after few hours.'}), 429

                pipe = redis_client_2.pipeline()    # Increment request count 
                pipe.incr(reset_limit_key, 1)
                if current_count == 0:
                    pipe.expire(reset_limit_key, reset_limit_window)   # set expiry if first time request came from a particular email after cooldown
                pipe.execute()
                
                PasswordResetToken.query.filter_by(email=email, used=False).delete()   # remove old token if exists(destroy old tokens).
                token = generate_jwt_email(email)
                reset_token = PasswordResetToken(email=email, token=token)
                db.session.add(reset_token)
                db.session.commit()

                url = f'http://localhost:5000/TruLotParking/reset/change-password?token={token}'
                subject = "TruLot Reset Password link....."
                sender = {"name": "TruLot Parking App", "email": "shivamkumar987148@gmail.com"}
                to = [{"email": email}]
                html_content = f"""
                    <html><body>
                    <h1>ONE TIME PASSWORD RESET LINK</h1>
                    <p>Click the link below to reset your password:</p>
                    <a href="{url}">{url}</a>
                    </body></html>
                """

                emailToSend = sib_api_v3_sdk.SendSmtpEmail(
                    subject = subject,
                    sender = sender,
                    to = to,
                    html_content=html_content
                )

                email_sender.send_transac_email(emailToSend)
                return jsonify({'success' : True, 'message' : 'Link to reset password sent successfully to your email...'}), 200
            except Exception as e:
                print(e)
                return jsonify({'success': False, 'message':'Failed to send reset link, check your internet connection....'})
    return render_template('/form/resetPasswordForm.html'), 200




    
