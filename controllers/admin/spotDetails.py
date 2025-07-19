import random
from flask import Blueprint, render_template, request, jsonify, make_response
from db import db

from models.user_model.user import User
from models.adminDashboard_model.parkingLots import ParkingSpot, ReservedSpot
from controllers.form.generators import decode_jwt


spot_bp = Blueprint('parkingSpot', __name__, url_prefix='/TruLotParking/role/adminDashboard/parking-lot-details')

@spot_bp.route('/spot')
def spot_details():
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
            spot_id = request.args.get('spot_id')
            if not spot_id:
                return jsonify({'success':False, 'message':'No Spot Exists'}), 404
            
            spot = ParkingSpot.query.filter_by(spot_id = spot_id, deleteSpot=False).first()
            if not spot:
                return jsonify({'success':False, 'message':'No Spot Exists'}), 404
                
            
            current_reservation = ReservedSpot.query.filter_by(spot_id=spot_id, leaving_time=None).first()

            spot_data = {
                'spot_id': spot.spot_id,
                'status': 'Under Maintenance' if spot.under_maintenance else 'Occupied' if spot.occupied else 'Available',
                'Reserved_by': current_reservation.user_detail.name if current_reservation and current_reservation.user_detail else None,
                'Reserved_user_email': current_reservation.user_detail.email if current_reservation and current_reservation.user_detail else None,
                'Parking_time': current_reservation.parking_time.isoformat() if current_reservation and current_reservation.parking_time else None,
                'lot_name': spot.lot_detail.lot_name if spot.lot_detail else None,
                'lot_location': spot.lot_detail.geographical_detail.location if spot.lot_detail and spot.lot_detail.geographical_detail else None,
            }
            return jsonify({'success': True, 'spot':spot_data}), 200
        else:
            return jsonify({'success':False, 'message': 'Unauthorised User'}), 400
    except Exception as error:
        print(error)
        return jsonify({'success':False, 'message': 'Internal Server Error'}), 500


@spot_bp.route('/put-spot-under-maintenance')
def under_maintenance():
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
            spot_id = request.args.get('spot_id')
            if not spot_id:
                return jsonify({'success':False, 'message':'No Spot Exists'}), 404
            
            spot = ParkingSpot.query.filter_by(spot_id=spot_id, deleteSpot=False).first()
            if not spot:
                return jsonify({'success':False, 'message':'No Spot Exists'}), 404
            
            if spot.occupied:
                return jsonify({'success': False, 'message': 'Spot is Occupied Currently, cannot put it under_maintenance'}), 400
            
            if not spot.under_maintenance:
                spot.under_maintenance = True
                db.session.add(spot)
                db.session.commit()

                return jsonify({'success': True, 'message':'The spot has been successfully marked as under maintenance'}), 200
            else:
                return jsonify({'success': True, 'message': 'Spot is already under maintenance'}), 200
        else:
                return jsonify({'success': False, 'message': 'Unauthorised User'}), 401
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message':'Internal Server Error'}), 200

            
@spot_bp.route('/remove-spot-under-maintenance')
def remove_under_maintenance():
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
            spot_id = request.args.get('spot_id')
            if not spot_id:
                return jsonify({'success':False, 'message':'No Spot Exists'}), 404
            
            spot = ParkingSpot.query.filter_by(spot_id=spot_id, deleteSpot=False).first()
            if not spot:
                return jsonify({'success':False, 'message':'No Spot Exists'}), 404
            
            if spot.under_maintenance:
                spot.under_maintenance = False
                db.session.add(spot)
                db.session.commit()

                return jsonify({'success': True, 'message':'The spot has been successfully marked as not under maintenance'}), 200
            else:
                return jsonify({'success': True, 'message': 'Spot is already not under maintenance'}), 200
        else:
                return jsonify({'success': False, 'message': 'Unauthorised User'}), 401
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message':'Internal Server Error'}), 200