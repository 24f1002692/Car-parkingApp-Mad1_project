import re, random
import os, time

from flask import Blueprint, render_template, request, jsonify, flash, session, redirect, url_for, make_response
import sib_api_v3_sdk

from models.user_model.user import User
from models.user_model.userSchema import LoginModel

from controllers.form.generators import generate_jwt
from controllers.form.formMiddleware import validate_form


# Set up api-key
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = os.getenv('BREVO-API-KEY')

# api_instance(email_sender)
email_sender = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))


role_bp = Blueprint('role', __name__, url_prefix='/role')
login_bp = Blueprint('login', __name__, url_prefix='/TruLotParking')
otpForm_bp = Blueprint('OtpForm', __name__, url_prefix='/otpForm')



@role_bp.route('/adminDashboard')
def adminDashboard():
    return render_template('/admin/admin_page.html')

@role_bp.route('/userDashboard')
def userDashboard():
    return render_template('/user/user_page.html')



@login_bp.route('/loginUser')
def login_form():
    return render_template('/form/login_form.html')


@login_bp.route('/yourDashboard', methods=['POST'])        # login.login_form_submit(used in login form) is equivalent to /yourDashboard
@validate_form(LoginModel)
def login_form_submit():
    validated_data = request.validated_data
    email = validated_data.email
    password = validated_data.password
        
    try:
        user = User.query.filter_by(email=email, password=password).first()

        if user :
            token = generate_jwt(email)
            if user.role == 'admin':
                response = make_response(redirect(url_for('role.adminDashboard')))
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
        return jsonify({'success': False, 'error': 'Internal Server Error'}), 500
        

@otpForm_bp.route('/requestOtp', methods=['GET', 'POST'])
def otpPage():
    if request.method == 'GET':
        return render_template('/form/requestOtpForm.html')
    elif request.method == 'POST':
        email = (request.get_json()).get('email')       # req.form.get() used to get form value, here we r sending fetch request from frontend

        if not email:
            return jsonify({'success': False, 'error': 'Email is required'}), 400
        
        if email :
            try:
                user = User.query.filter_by(email = email).first()
            
                if user : 
                    otp = random.randint(1000, 9999)     # 4-digit otp
                    session[email] = {
                        'otp': otp,
                        'timestamp': time.time()   # time of session creation.
                    }

                    subject = "TruLot Login OTP via Email..."
                    sender = {"name": "TruLot Parking App", "email": "shivamkumar987148@gmail.com"}
                    to = [{"email": email}]
                    html_content = f"<html><body><p>Your OTP is: {otp}, Don't share this OTP with anyone ! OTP is provided you to access your Dashboard....</p></body></html>"

                    emailToSend = sib_api_v3_sdk.SendSmtpEmail(
                        subject = subject,
                        sender = sender,
                        to = to,
                        html_content=html_content
                    )

                    try :
                        email_sender.send_transac_email(emailToSend)
                        return jsonify({'success' : True, 'message' : 'OTP sent successFully...'})
                    except Exception as e:
                        print(e)
                        return jsonify({'success' : False,  'error':'Failed to send OTP, check your internet connection....'})
                else :
                    return jsonify({'success': False, 'error': 'please signup first with this email id....'})
            except Exception as error:
                print(error)
                return jsonify({'success': False, 'error': 'Internal Server Error'}), 500


@otpForm_bp.route('/requestOtp/verifyOtp', methods=['POST'])       # otpForm.verifyOtp
def verifyOtp():
    data = request.get_json()          # req.form.get() used to get form value, here we r sending fetch request from frontend
    email = data.get('email')
    otp_entered = data.get('otp')

    if not isinstance(otp_entered, str) or not otp_entered.isdigit() or len(otp_entered) != 4:        # isdigit() ensures that string contains only numbers
        return jsonify({'success': False, 'error': 'Invalid OTP format'}), 400

    if not email :
        return jsonify({'success': False, 'error': 'Email and OTP are required'}), 400

    stored_otp_data = session.get(email)

    if stored_otp_data is None:
        return jsonify({'success': False, 'error': 'OTP has not been requested...'}), 400
    
    OTP_EXPIRY_SECONDS = 300
    if time.time() - stored_otp_data.get('timestamp', 0) > OTP_EXPIRY_SECONDS:
        session.pop(email, None)      # clear OTP if expired.
        return jsonify({'success': False, 'error': 'OTP has expired, please request a new one'}), 400


    if str(stored_otp_data.get('otp')) == str(otp_entered):
        try:
            session.pop(email, None)         # clear OTP, if verifiied...
            user = User.query.filter_by(email = email).first()

            if not user:
                return jsonify({'success': False, 'error': 'User not found'}), 404
            
            token = generate_jwt(email)
            if user.role == 'admin':
                redirect_url = url_for('role.adminDashboard')       # role is name of role blueprint and adminDashboard is func name
                print(redirect_url)
            else:
                redirect_url = url_for('role.userDashboard')

            response = make_response(jsonify({'success': True, 'url': redirect_url}))
            response.set_cookie(
                'token',
                token,
                httponly=True,
                secure=True,        
                samesite='Strict',
                max_age=86400       
            )
            return response
        except Exception as error:
            print(error)
            return jsonify({'success': False, 'error': 'Internal Server Error'}), 500
    else:
        return jsonify({'success': False, 'error': 'Incorrect OTP, Authentication Failed...'})

    

    
