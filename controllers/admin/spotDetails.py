import random
from flask import Blueprint, render_template, request, jsonify, make_response
from db import db

from models.user_model.user import User
from models.adminDashboard_model.parkingLots import ParkingSpot, ReservedSpot
from controllers.form.generators import decode_jwt

from sqlalchemy.orm import joinedload


spot_bp = Blueprint('parkingSpot', __name__, url_prefix='/TruLotParking/role/adminDashboard/parking-lot-details')

@spot_bp.route('/spot')
def spot_details():
    print('here bete')
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
                
            
            latest_reservation = (
                db.session.query(ReservedSpot)
                .options(joinedload(ReservedSpot.user_detail))
                .filter_by(spot_id=spot.spot_id)
                .order_by(ReservedSpot.parking_time.desc())
                .first()
            )
            
            spot_data = {
                'spot_id': spot.spot_id,
                'status': 'Under Maintenance' if spot.under_maintenance else 'Occupied' if spot.occupied else 'Available',
                'Reserved_by': latest_reservation.user_detail.name if latest_reservation else None,
                'Reserved_user_email': latest_reservation.user_detail.email if latest_reservation else None,
                'Parking_time': latest_reservation.parking_time.isoformat() if latest_reservation else None,
                'leaving_time': latest_reservation.leaving_time.isoformat() if latest_reservation else None,            # if there is no latest reservation, that means spot has zero reservation since it is created.
                'lot_name' : spot.lot_detail.lot_name,
                'lot_location': spot.lot_detail.geographical_detail.location,
            }
            return jsonify({'success': True, 'spot':spot_data}), 200
        else:
            return jsonify({'success':False, 'message': 'Unauthorised User'}), 400
    except Exception as error:
        print(error)
        return jsonify({'success':False, 'message': 'Internal Server Error'}), 500
