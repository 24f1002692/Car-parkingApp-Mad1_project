from flask import Blueprint, render_template, request, jsonify, make_response
from db import db

from controllers.form.generators import decode_jwt
from models.user_model.user import User




registered_user_bp = Blueprint('user-details', __name__, url_prefix='/TruLotParking/role/adminDashboard')

@registered_user_bp.route('/registered-users')
def registered_users():
    token = request.cookies.get('token')
    if not token:
        return render_template('/components/error_page.html', error='Unauthorized User / Admin (token missing)'), 401
    
    decoded = decode_jwt(token)
    if not decoded:
        return render_template('/components/error_page.html', error='Unauthorized: Invalid or expired token'), 401
    
    email_In_Token = decoded.get('email')

    try:
        user = User.query.filter_by(email=email_In_Token).first()

        if user and user.role =='admin':
            PER_PAGE = 32
            page = request.args.get("page", 1, type=int)

            pagination = User.query.filter_by(deleteUser=False, role='user').paginate(page=page, per_page=PER_PAGE, error_out=False)

            users = [
                {
                    "user_id": u.user_id,
                    "name": u.name,
                    "email": u.email,
                    "image": u.image,
                    "gender": u.gender,
                    "address" : u.address_detail.address,
                    "latitude": u.address_detail.latitude if u.address_detail else None,
                    "longitude": u.address_detail.longitude if u.address_detail else None,
                    "restrictUser": u.restrictUser
                } for u in pagination.items
            ]
            return render_template('/admin/links/registeredUsers.html', registered_users=users, pagination=pagination)
        else:
            return render_template('/components/error_page.html', error='Unauthorized User / Admin'), 401            

    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 401


@registered_user_bp.route('/restrict-user/<int:user_id>', methods=['POST'])
def restrict_user(user_id):
    if not user_id:
        return jsonify({'success': False, 'message': 'User Id is missing'}), 400
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404

        user.restrictUser = True
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


@registered_user_bp.route('/unrestrict-user/<int:user_id>', methods=['POST'])
def unrestrict_user(user_id):
    if not user_id:
        return jsonify({'success': False, 'message': 'User Id is missing'}), 400
    
    try:
        user = User.query.get(user_id)

        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        user.restrictUser=False
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


