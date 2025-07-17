from flask import Blueprint, render_template, request, jsonify, make_response
from db import db

from controllers.form.generators import decode_jwt
from models.user_model.user import User
from models.adminDashboard_model.parkingLots import ReservedSpot

from datetime import datetime



registered_user_bp = Blueprint('user-details', __name__, url_prefix='/TruLotParking/role/adminDashboard')

def format_datetime(iso_string):
    if not iso_string:
        return 'N/A'
    try:
        dt = datetime.strptime(iso_string, '%Y-%m-%d %H:%M:%S.%f')
        return dt.strftime('%d-%m-%Y, %I:%M %p')  # e.g., 26-06-2025, 01:49 AM
    except ValueError:
        return 'Invalid date'
    
def serialize_reservation(spot, include_leaving_time=False):
    data = {
        'reserved_spot_id': spot.spot_id,
        'parking_time': format_datetime(str(spot.parking_time)) if spot.parking_time else None,
        'phone': spot.phone
    }

    if include_leaving_time:
        data['leaving_time'] = format_datetime(str(spot.leaving_time)) if spot.leaving_time else None
    return data


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


@registered_user_bp.route('/registered-users/view-user')
def view_user():
    token = request.cookies.get('token')
    if not token:
        return jsonify({'success': False, 'msg': 'token is missing'}), 400
    
    decoded = decode_jwt(token)
    if not decoded:
        return jsonify({'success': False, 'msg': 'token is invalid / expired, please login again'}), 401
    email_In_Token = decoded.get('email')

    try:
        user = User.query.filter_by(email=email_In_Token).first()
        if user and user.role =='admin':
            user_id = request.args.get('user_id')   # get user_id from query string
            if not user_id:
                return jsonify({'success': False, 'msg': 'Missing user_id'}), 400
            
            user = User.query.filter_by(user_id=user_id).first()
            if not user:
                return jsonify({'success': False, 'msg': 'User not found'}), 404
            
            active_reservations = ReservedSpot.query.filter_by(user_id=user_id, leaving_time=None).order_by(ReservedSpot.parking_time.desc()).limit(50).all()
            past_reservations = ReservedSpot.query.filter(ReservedSpot.user_id == user_id,ReservedSpot.leaving_time != None).order_by(ReservedSpot.parking_time.desc()).limit(50).all()

            phone_list = list({spot.phone for spot in user.reserved_spot_detail})
            user_detail = {
                'name': user.name,
                'email': user.email,
                'phone': phone_list,
                'address': user.address_detail.address if user.address_detail else None,
                'isRestricted' : user.restrictUser,
                'image_url': user.image,
            }

            active_reservations_data = [serialize_reservation(spot) for spot in active_reservations]
            past_reservations_data = [serialize_reservation(spot, include_leaving_time=True) for spot in past_reservations]

            return jsonify({'success': True, 'user': user_detail, 'active_reservations': active_reservations_data, 'past_reservations': past_reservations_data}), 200
        else:
            return jsonify({'success': False, 'msg': 'Invalid User Type'}), 403
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'msg': 'Internal Server Error'}), 500
    
    
