import re, os, random, time

from flask import Blueprint, render_template, request, jsonify, make_response, redirect, url_for, flash, session
import sib_api_v3_sdk

from db import db
from redisClient import redis_client
from models.user_model.user import User, EmailVerification, Address
from models.user_model.userSchema import SignupModel

from controllers.form.generators import generate_jwt, decode_jwt
from controllers.middlewares.validate_form import validate_form
from controllers.middlewares.validate_phone import validate_phoneNumber
from controllers.middlewares.validate_address import geocode_opencage
from controllers.admin.generateImages import generate_random_user_image_url


# signup blueprint
signup_bp = Blueprint('signup', __name__, url_prefix='/TruLotParking')
otpForm_bp = Blueprint('OtpForm', __name__, url_prefix='/signup/emailVerification')



# Set up api-key
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = os.getenv('BREVO-API-KEY')

# api_instance(email_sender)
email_sender = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))



# routes
@signup_bp.route('/signup/creatingUser')
def signup_form():
    form_data = session.pop('form_data', {})       # removes from session when a fresh request came.
    return render_template('/form/signup_form.html', form_data=form_data)


@signup_bp.route('/role/newUserDashboard')
def userDashboard():
    token = request.cookies.get('token')
    if not token:
        return render_template('/components/error_page.html', error='Unauthorized User / Admin'), 401

    decoded = decode_jwt(token)
    if not decoded:
        return render_template('/components/error_page.html', error='Invalid User / Admin request (token missing or invalid)'), 401

    username = decoded.get('username', 'Guest')
    return render_template('/user/user_page.html', username=username)


@signup_bp.route('/role/userDashboard', methods=['POST'])
@validate_form(SignupModel)
def signup_form_submit():
    validated_data = request.validated_data
    username = validated_data.username
    password = validated_data.password
    email = validated_data.email
    phone = validated_data.phone
    address = validated_data.address
    gender = validated_data.gender

    print(validated_data)
    
    phone = '+91'+phone

    session['form_data'] = {
        'username': username,
        'email': email,
        'phone': validated_data.phone,
        'address': address
    }

    res = validate_phoneNumber(phone)
    if not res:
        return jsonify({'success':False, 'error':'invalid phone number'}), 400
    
    res = geocode_opencage(address)
    if not res:
        return jsonify({'success': False, 'error':'More precise location needed'}), 400
    
    if not res.get('success'):
        return jsonify({'success': False, 'error':'Location seems invalid'}), 400
    
    if res.get('confidence') < 7:
        return jsonify({'success': False, 'error':'More precise location needed'}), 400
    
    components = res.get('components', {})
    image = generate_random_user_image_url(gender)
    
    try:
        user = User.query.filter_by(email=email).first()
        if user:
            return jsonify({'success':False, 'message':'User with this email already have an account, you can move to log in to your account'}), 409
        
        row = EmailVerification.query.filter_by(email=email).first()
        if not row or not row.isVerified:
            return jsonify({'success': False, 'error':'Email id is not Verified'}), 400
        
        try:
            address_obj = Address(address=address, road=components.get('road'), subLocality=components.get('suburb') or components.get('neighbourhood') or '', pincode=components.get('postcode'), latitude=res.get('latitude'), longitude=res.get('longitude'))
            db.session.add(address_obj)
            db.session.flush()
        except Exception as error:
            print(error)
            return render_template('/components/error_page.html', error='Internal Server Error (Database error)'), 401

        try:
            user = User(name = username, address_id = address_obj.address_id, password = password, email=email, phone=phone, image=image, gender=gender)
            db.session.add(user)
            db.session.commit()
        except Exception as error:
            print(error)
            return render_template('/components/error_page.html', error='Internal Server Error (Database error)'), 401
        
        session.pop('form_data', None)

        #sign a jwt token as cookie for user
        token = generate_jwt(email, username)
        response = make_response(redirect(url_for('signup.userDashboard')))
        response.set_cookie(
            'token', 
            token,
            httponly=True,   
            secure=True,       
            samesite='Strict'    
        )
        
        return response
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error (Database error)'), 401


@signup_bp.route('/signup/check_user_exists', methods=['POST'])
def check_user_exists():
    data = request.get_json()
    email = data.get('email')
    
    if not email or len(email) > 40 or not re.search(r'[@]', email):
        return jsonify({'error' : 'Invalid email, Must be within the length 40 and must have @ symbol'})

    try:
        user_email = User.query.filter_by(email = email).first()
        if user_email : 
            return jsonify({'user_exists' : True}), 200
        else :
            return jsonify({'user_exists' : False}), 200
    except Exception as error:
        print(error)
        return jsonify({'error':'Internal Server Error (Database error)'}), 401
    

@signup_bp.route('/signup/validate-phone', methods=['POST'])
def check_phoneNumber():
    data = request.get_json()
    phone = data.get('phone')
    
    if not phone or not re.search(r'\d{10}', phone):
        return jsonify({'error' : 'Invalid phone number'}), 400
    
    phone = '+91'+phone
    res = validate_phoneNumber(phone)
    if not res:
        return jsonify({'success':False, 'error':'invalid phone number'}), 400
    
    return jsonify({'success':True}), 200



@signup_bp.route('/signup/validate-address', methods=['POST'])
def check_address():
    data = request.get_json()
    address = data.get('address')
    print(address)
    
    if not address:
        return jsonify({'success':False, 'error' : 'address is required'}), 400
    
    if len(address) > 300:
        return jsonify({'success': False, 'error': 'Address is too long'}), 400
    
    res = geocode_opencage(address)
    if not res:
        return jsonify({'success':False, 'error':'More precised address needed'}), 400

    if not res.get('success'):
        return jsonify({'success':False, 'error':'Location seems invalid'}), 400
    
    if res.get('confidence') < 7:
        return jsonify({'success': False, 'error':'More precised address needed'}), 400
    
    components = res.get('components', {})
    country = components.get('country', '').lower()
    
    if country != 'india':
        return jsonify({'success': False, 'error': "location isn't lying in india"}), 400
    
    return jsonify({'success':True}), 200


# ---------------------------------------------------------------- REQUEST OTP AND VERIFY OTP ---------------------------------------------------

@otpForm_bp.route('/requestOtp', methods=['POST'])
def otpPage():
    email = (request.get_json()).get('email')      # req.form.get() used to get form value, here we r sending fetch request from frontend to validate the email.

    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    if email :
        try:
            record = EmailVerification.query.filter_by(email=email).first()
            if record and record.isVerified:
                return jsonify({'success':False, 'message':'Your Email is already Verified'}), 200
            
            otp_limit_key = email
            otp_max_requests = 3
            otp_limit_window = 3600

            current_count = redis_client.get(otp_limit_key)
            current_count = int(current_count) if current_count else 0

            if current_count > otp_max_requests:
                return jsonify({'success': False, 'message': 'OTP request limit reached. Try again after few hours.'}), 429

            pipe = redis_client.pipeline()    # Increment request count 
            pipe.incr(otp_limit_key, 1)
            if current_count == 0:
                pipe.expire(otp_limit_key, otp_limit_window)   # set expiry if first time request came from a particular email after cooldown
            pipe.execute()
            
            otp = random.randint(1000, 9999)     # 4-digit otp
            session[email] = {
                'otp': otp,
                'timestamp': time.time()   # time of session creation.
            }

            subject = "TruLot Email Verification....."
            sender = {"name": "TruLot Parking App", "email": "shivamkumar987148@gmail.com"}
            to = [{"email": email}]
            html_content = f"<html><body><p>Your OTP is: {otp}, Don't share this OTP with anyone ! OTP is provided you to verify your Email address....</p></body></html>"

            emailToSend = sib_api_v3_sdk.SendSmtpEmail(
                subject = subject,
                sender = sender,
                to = to,
                html_content=html_content
            )

            email_sender.send_transac_email(emailToSend)
            return jsonify({'success' : True, 'message' : 'OTP sent successFully...'})
        except Exception as e:
            print(e)
            return jsonify({'success': False, 'message':'Failed to send OTP, check your internet connection....'})
        


@otpForm_bp.route('/verifyOtp', methods=['POST'])
def verifyOtp():
    data = request.get_json()
    email = data.get('email')
    otp_entered = data.get('otp')

    if not email or not otp_entered:
        return jsonify({'success': False, 'error': 'Email and OTP are required'}), 400

    if not isinstance(otp_entered, str) or not otp_entered.isdigit() or len(otp_entered) != 4:
        return jsonify({'success': False, 'error': 'Invalid OTP format'}), 400

    stored_otp_data = session.get(email)
    if stored_otp_data is None:
        return jsonify({'success': False, 'error': 'OTP has not been requested yet...'}), 400

    OTP_EXPIRY_SECONDS = 500
    if time.time() - stored_otp_data.get('timestamp', 0) > OTP_EXPIRY_SECONDS:
        session.pop(email, None)
        return jsonify({'success': False, 'error': 'OTP has expired, please request a new one'}), 400

    if str(stored_otp_data.get('otp')) == str(otp_entered):
        record = EmailVerification.query.filter_by(email=email).first()
        if record:
            record.isVerified = True
        else:
            record = EmailVerification(email=email, isVerified=True)
            db.session.add(record)
        db.session.commit()

        session.pop(email, None)
        return jsonify({'success': True, 'message': 'OTP verified successfully'}), 200
    else:
        return jsonify({'success': False, 'error': 'Incorrect OTP, Authentication Failed...'}), 400
