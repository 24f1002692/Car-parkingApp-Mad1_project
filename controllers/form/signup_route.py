import re

from flask import Blueprint, render_template, request, jsonify, make_response, redirect, url_for

from db import db
from models.user_model.user import User
from models.user_model.userSchema import SignupModel

from controllers.form.generators import generate_jwt, decode_jwt
from controllers.middlewares.validate_form import validate_form


# signup blueprint
signup_bp = Blueprint('signup', __name__, url_prefix='/TruLotParking')


# routes
@signup_bp.route('/signup/creatingUser')
def signup_form():
    return render_template('form/signup_form.html')


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
    country = validated_data.country


    try:
        user = User(name = username, password = password, email=email, country = country)
        db.session.add(user)
        db.session.commit()

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
