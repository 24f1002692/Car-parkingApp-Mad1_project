from flask import Blueprint, render_template, request, jsonify, make_response
from sqlalchemy import and_
from db import db

from datetime import datetime

from controllers.middlewares.check_authorisation import check_authorisation

from models.user_model.user import User
from models.adminDashboard_model.parkingLots import Lot, Rating, ReservedSpot, ParkingSpot


def format_datetime(iso_string):
    if not iso_string:
        return 'N/A'
    try:
        dt = datetime.strptime(iso_string, '%Y-%m-%d %H:%M:%S.%f')
        return dt.strftime('%d-%m-%Y, %I:%M %p')  # e.g., 26-06-2025, 01:49 AM
    except ValueError:
        return 'Invalid date'
    

def calculate_bill(parking_time, leaving_time, price_per_hr):
    duration = leaving_time - parking_time
    total_hours = duration.total_seconds() / 3600       # includes fractional hours
    base_bill = round(total_hours * price_per_hr, 2)
    gst = base_bill * 0.18
    return (base_bill, gst)


reserved_spot_bp = Blueprint('user-reserved-spots', __name__, url_prefix='/TruLotParking/role/userDashboard')
admin_view_reservation_bp = Blueprint('view-reserved-spots', __name__, url_prefix='/TruLotParking/role/adminDashboard')


@reserved_spot_bp.route('/my-active-reservations')
def reserved_spots():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return render_template('/components/error_page.html', error='Unauthorized: Invalid or expired token'), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')     # getting user_id from cookie
            page = request.args.get('page', 1, type=int)
            PER_PAGE = 20

            pagination = ReservedSpot.query.filter_by(user_id=user_id, leaving_time=None).paginate(page=page, per_page=PER_PAGE, error_out=False)
            formatted_reserved_spots = [
                {
                    'spot': spot,
                    'parking_time': format_datetime(str(spot.parking_time))
                }
                for spot in pagination.items
            ]
            return render_template('/user/links/my_active_reservations.html', formatted_reserved_spots=formatted_reserved_spots, pagination=pagination, message='No Active Reservations currently' if not formatted_reserved_spots else None), 200
            
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 500
    

@reserved_spot_bp.route('/my-active-reservations/releaseSpot')
def releaseSpot():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return render_template('/components/error_page.html', error='Unauthorized: Invalid or expired token'), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            reserved_spot_id = request.args.get('reserved_spotId')
            if not reserved_spot_id:
                return jsonify({'success': False, 'message':'reserve spot id of reserved spot is missing'}), 400

            reserved_row = ReservedSpot.query.filter_by(reserved_spot_id=reserved_spot_id).first()
            reserved_row.leaving_time = datetime.now()
            reserved_row.spot_detail.occupied = False
            reserved_row.spot_detail.lot_detail.available_spots += 1 

            db.session.add(reserved_row)
            db.session.commit()
            return jsonify({'success': True, 'message':'Spot is release successfully, Redirecting to your billing desk !', 'path':'/TruLotParking/role/userDashboard/my-active-reservations/billing-desk', 'reserved_spot_id':reserved_row.reserved_spot_id}), 200
        else:
            return render_template('/components/error_page.html', error='UnAuthorised User'), 403
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 500
    

@reserved_spot_bp.route('/my-active-reservations/billing-desk', methods=['GET', 'POST'])
def billingDesk():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return render_template('/components/error_page.html', error='Unauthorized: Invalid or expired token'), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            if request.method == 'GET':
                reserved_spot_id = request.args.get('reserved_spot_id')
                if not reserved_spot_id:
                    return jsonify({'success': False, 'message':'Spot id of reserved spot is missing'}), 400
                
                reserved_spot = ReservedSpot.query.filter_by(reserved_spot_id=reserved_spot_id).first()
                if not reserved_spot:
                    return jsonify({'success': False, 'message': 'Reserved spot not found'}), 404
                
                spot = reserved_spot.spot_detail
                lot = spot.lot_detail
                bill_amount, gst = calculate_bill(reserved_spot.parking_time, reserved_spot.leaving_time, lot.price_per_hr)

                formatted_reserved_spot = {
                    'reserved_spot': reserved_spot,
                    'parking_time': format_datetime(str(reserved_spot.parking_time)),
                    'leaving_time': format_datetime(str(reserved_spot.leaving_time)),
                }

                return render_template('/user/links/billing_desk.html', reserved_spot=formatted_reserved_spot, bill_amt = bill_amount, gst=gst)
            
            elif request.method == 'POST':
                data = request.get_json()
                reserved_spot_id = data.get('reserved_spot_id')
                if not reserved_spot_id:
                    return jsonify({'success': False, 'message':'Spot id of reserved spot is missing'}), 400
                
                reserved_spot = ReservedSpot.query.filter_by(reserved_spot_id=reserved_spot_id).first()
                if not reserved_spot:
                    return jsonify({'success': False, 'message': 'Reserved spot not found'}), 404
                
                reserved_spot.bill_pay = True
                db.session.commit()
                return jsonify({'success': True, 'message': 'Bill Paid Successfully, Redirecting to your dashboard', 'path':'/TruLotParking/role/userDashboard'}), 200
        else:
            return render_template('/components/error_page.html', error='UnAuthorised User'), 403
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 500


@reserved_spot_bp.route('/my-past-reservations')
def pastReservations():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return render_template('/components/error_page.html', error='Unauthorized: Invalid or expired token'), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')         # getting user_id from cookie
            page = request.args.get('page', 1, type=int)
            PER_PAGE = 30

            pagination = ReservedSpot.query.filter(              # filter_by not supports complex Sql expression (!= None)
                and_(
                    ReservedSpot.user_id == user_id,
                    ReservedSpot.parking_time != None,
                    ReservedSpot.leaving_time != None
                )
            ).order_by(ReservedSpot.leaving_time.desc()).paginate(page=page, per_page=PER_PAGE, error_out=False)

            formatted_past_reserved_spots = [
                {
                    'reserved_spot': spot,
                    'parking_time': format_datetime(str(spot.parking_time)),
                    'leaving_time': format_datetime(str(spot.leaving_time))
                }
                for spot in pagination.items
            ]
            return render_template('/user/links/past-reservations.html', formatted_past_reserved_spots=formatted_past_reserved_spots, pagination=pagination, message='No Reservations made currently' if not formatted_past_reserved_spots else None), 200
            
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 500

    
@reserved_spot_bp.route('/my-pending-bills')
def pendingBills():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return render_template('/components/error_page.html', error='Unauthorized: Invalid or expired token'), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')         # getting user_id from cookie
            pending_bills_list = ReservedSpot.query.filter(
                and_(ReservedSpot.user_id==user_id,
                    ReservedSpot.leaving_time != None,
                    ReservedSpot.bill_pay==False)
                ).all()

            formatted_bills = [
                {
                    'bill': bill,
                    'parking_time': format_datetime(str(bill.parking_time)),
                    'leaving_time': format_datetime(str(bill.leaving_time))
                }
                for bill in pending_bills_list
            ]
            return render_template('/user/links/pending-bills.html', pending_bills_list=formatted_bills, message='No Pending Bills !' if not pending_bills_list else None), 200
        else:
            return render_template('/components/error_page.html', error='Unauthorized User'), 403
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 500



@admin_view_reservation_bp.route('/active-reservations')
def activeReservations():
    token = request.cookies.get('token')
    res, status = check_authorisation(token) 
    json_res = res.get_json()

    if not json_res.get('success'):
        return render_template('/components/error_page.html', error='Unauthorized: Invalid or expired token'), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'admin':
            page = request.args.get('page', 1, type=int)
            PER_PAGE = 200

            pagination = ReservedSpot.query.filter_by(leaving_time=None).order_by(ReservedSpot.parking_time.desc()).paginate(page=page, per_page=PER_PAGE, error_out=False)   # all reserved spots
            formatted_reserved_spots = [
                {
                    'spot': reserved_spot,
                    'parking_time': format_datetime(str(reserved_spot.parking_time))
                }
                for reserved_spot in pagination.items
            ]

            return render_template('/admin/links/active-reservations.html', formatted_reserved_spots=formatted_reserved_spots, pagination=pagination, message='Not a single user made any reservation' if not formatted_reserved_spots else None), 200
        else:
            return render_template('/components/error_page.html', error='Unauthorised User'), 403
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 500