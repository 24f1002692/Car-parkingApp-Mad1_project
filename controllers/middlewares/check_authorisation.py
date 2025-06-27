from flask import jsonify
from controllers.form.generators import decode_jwt
from models.user_model.user import User


def check_authorisation(token):
    if not token:
        return jsonify({'success': False, 'message':'Authorisation Token is Missing'}), 401

    decoded = decode_jwt(token)
    if not decoded:
        return jsonify({'success':False, 'message':'Could not decode the token, invalid token'}), 401

    email = decoded.get('email')
    if not email:
        return jsonify({'success': False, 'message': 'Email id is missing in the token'}), 401
    
    try:
        user = User.query.filter_by(email=email, restrictUser=False).first()
        if not user:
            return jsonify({'success': False, 'message': 'user with this email does not exist / user is restricted by admin'})
        return jsonify({'success': True, 'message': user.role, 'user_id': user.user_id}), 200
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message':'Internal Server Error'}), 500