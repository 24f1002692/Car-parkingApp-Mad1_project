from flask import Blueprint, render_template, request, jsonify, make_response
from db import db

from controllers.middlewares.check_authorisation import check_authorisation
from models.user_model.user import User



profile_bp = Blueprint('user-profile', __name__, url_prefix='/TruLotParking/role/userDashboard')

@profile_bp.route('/my-profile')
def myProfile():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': json_res.get('message')}), 400

    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'message': 'user id is missing'}), 400
            
            user = User.query.filter_by(user_id=user_id, deleteUser=False).first()
            if not user:
                return jsonify({'success': False, 'message': 'user with this id do not exist'}), 400
            
            user_data = {
                'name': user.name,
                'email': user.email,
                'image': user.image,
                'gender': user.gender,
                'address': user.address_detail.address,
                'restrictUser': user.restrictUser
            }
            
            phone_list = list({reservation.phone for reservation in user.reserved_spot_detail})        # get unique phone for the user, stored them in set {} and then convert set to list. 
            
            return jsonify({'success': True, 'user': user_data, 'phone_list': phone_list}), 200
        else:
            return jsonify({'success': False, 'message': 'Unauthorised User'}), 400
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500
    

