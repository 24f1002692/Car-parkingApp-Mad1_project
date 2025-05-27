import re

from flask import Blueprint, render_template, request, jsonify, make_response
from models.user_model.user import db, User
from controllers.form.generators import generate_jwt


# signup blueprint
signup_bp = Blueprint('signup', __name__, url_prefix='/TruLotParking')


# routes
@signup_bp.route('/signup/creatingUser')
def signup_form():
        return render_template('form/signup_form.html')

@signup_bp.route('/userDashboard', methods=['POST'])
def signup_form_submit():
    username = request.form.get('username').strip()   # use name attributes here
    password = request.form.get('password').strip()
    email = request.form.get('email').strip()
    country = request.form.get('country').strip()

    # Since, we used front-end validation, so usually users can't send empty data, but sometimes users can hit our url directly using softwares like postman etc.
    # So, we need server side validation also
    if not username or len(username) > 15:
        return jsonify({'error': 'Invalid username. Must be between 1 and 15 characters.'}), 400
    elif not password or len(password) > 15 or len(password) < 8 or not re.search(r'[A-Z]', password) or not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return jsonify({'error': 'Invalid password, password should have min 8 characters and max 15 characters, contain at least one uppercase letter, and one special character.'}), 400
    elif not email or len(email) > 40 or not re.search(r'[@]', email):
        return jsonify({'error' : 'Invalid email, Must be within the length 40 and must have @ symbol'})
                    
    # print(username + ' has set password => ' + password)
    try:
        user = User(name = username, password = password, email=email, country = country)
        db.session.add(user)
        db.session.commit()

        #sign a jwt token as cookie for user
        token = generate_jwt(email)
        response = make_response(render_template('/user/user_page.html'))
        response.set_cookie(
            'token', 
            token,
            httponly=True,   
            secure=True,       
            samesite='Strict'    
        )
        
        return response, 200
    except Exception as error:
        print(error)


@signup_bp.route('/signup/check_user_exists', methods=['POST'])
def check_user_exists():
    data = request.get_json()
    email = data.get('email')
    
    try:
        user_email = User.query.filter_by(email = email).first()
        if user_email : 
            return jsonify({'user_exists' : True}), 200
        else :
            return jsonify({'user_exists' : False}), 200
    except Exception as error:
        print(error)
