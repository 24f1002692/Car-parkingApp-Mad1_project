import calendar
from collections import defaultdict

from flask import Blueprint, render_template, request, jsonify, make_response
from sqlalchemy import and_, func, extract, case
from db import db
from controllers.middlewares.check_authorisation import check_authorisation
from models.adminDashboard_model.parkingLots import Lot, Rating, ReservedSpot, ParkingSpot


summaryChart_bp = Blueprint('summary_chart', __name__, url_prefix='/TruLotParking/role/userDashboard')

@summaryChart_bp.route('/expenditures-summary')
def expenditures_summary_chart():
    try:
        token = request.cookies.get('token')
        res, status = check_authorisation(token)   # unpack the jsonify response
        json_res = res.get_json()

        if not json_res.get('success'):
            return render_template('/components/error_page.html', error='Unauthorised/ expired session'), status
        
        if json_res.get('success') and json_res.get('message') == 'user':
            return render_template('/user/links/summaryChart.html'), 200
        else:
            return render_template('/components/error_page.html', error='Invalid User Type'), 500
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 500


@summaryChart_bp.route('/monthly-spend/<int:year>')
def spend_monthly(year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorised/ expired session'}), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')     # getting user_id from cookie
            if not user_id:
                return jsonify({'success': False, 'message': 'Unauthorised User'}), 401


            reservations = ReservedSpot.query.filter(
                ReservedSpot.user_id == user_id,
                ReservedSpot.leaving_time.isnot(None),
                db.extract('year', ReservedSpot.parking_time) == year,
            ).all()

            if not reservations:
                return jsonify({'success': True, 'labels': [], 'data': []}), 200
            
            monthly_totals = defaultdict(float)
            for res in reservations:
                month = res.parking_time.month        # a month number
                monthly_totals[month] += res.bill_amount or 0.0
                
            labels = [calendar.month_name[m] for m in range(1, 13)]
            data = [monthly_totals.get(m, 0) for m in range(1, 13)]

            return jsonify({'success': True, 'labels': labels, 'data': data}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid User Type'}), 403
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


@summaryChart_bp.route('/spend/daily/<int:month>/<int:year>')
def spend_daily(month, year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorized/ expired session'}), status

    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'message': 'Unauthorised User'}), 401

            reservations = ReservedSpot.query.filter(
                ReservedSpot.user_id == user_id,
                ReservedSpot.leaving_time.isnot(None),
                db.extract('month', ReservedSpot.parking_time) == month,
                db.extract('year', ReservedSpot.parking_time) == year
            ).all()

            if not reservations:
                return jsonify({'success': True, 'labels': [], 'data': []}), 200

            day_totals = defaultdict(float)

            for res in reservations:
                day = res.parking_time.day
                day_totals[day] += res.bill_amount or 0.0

            num_days = calendar.monthrange(year, month)[1]     # calender.monthrange(year, month) => return a tuple (start_weekday, number_of_days) => extract no. of days of a given month
            labels = [str(day) for day in range(1, num_days + 1)]    # day-1, day-2, . . . . . .
            data = [day_totals.get(day, 0.0) for day in range(1, num_days + 1)]

            return jsonify({'success': True, 'labels': labels, 'data': data}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid User Type'}), 403
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


@summaryChart_bp.route('/lot-wise-spending/<int:year>')
def lotWise_spendings(year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorized/ expired session'}), status

    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'message': 'Unauthorised User'}), 401

            reserved_spots = ReservedSpot.query.filter_by(user_id=user_id, bill_pay=True) \
            .filter(ReservedSpot.leaving_time.isnot(None), ReservedSpot.bill_amount.isnot(None), extract('year', ReservedSpot.parking_time) == year) \
            .join(ParkingSpot, ReservedSpot.spot_detail) \
            .join(Lot, ParkingSpot.lot_detail) \
            .with_entities(
                Lot.lot_name,       
                func.sum(ReservedSpot.bill_amount).label('total_spent')          
            ) \
            .group_by(Lot.lot_name) \
            .order_by(func.sum(ReservedSpot.bill_amount).desc()) \
            .all()

            if not reserved_spots:
                return jsonify({'success': True, 'labels': [], 'data': []}), 200 

            labels = [r[0] for r in reserved_spots]    # r[0] is group_by(lotname)
            data = [r[1] for r in reserved_spots]         # r[1] is the amount spend in that lot

            return  jsonify({'success': True, 'labels': labels, 'data': data}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid User Type'}), 403
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500
    

@summaryChart_bp.route('/lot-wise-reservation-percentage/<int:year>')
def lotWise_reservation_percentage(year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorized/ expired session'}), status

    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'message': 'Unauthorised User'}), 401

            rows = ReservedSpot.query.filter_by(user_id=user_id) \
            .filter(extract('year', ReservedSpot.parking_time) == year) \
            .join(ParkingSpot, ReservedSpot.spot_detail) \
            .join(Lot, ParkingSpot.lot_detail) \
            .with_entities(
                Lot.lot_name,       
                func.count(ReservedSpot.reserved_spot_id).label('reservation_count')          
            ) \
            .group_by(Lot.lot_name) \
            .order_by(func.count(ReservedSpot.reserved_spot_id).desc()) \
            .all()

            if not rows:
                return jsonify({'success': True, 'labels': [], 'data': []}), 200 
            
            total = sum([r[1] for r in rows])    # total reservation made by user in the given year

            labels = [r[0] for r in rows]    # r[0] is group_by(lotname)
            data = [round((r[1] / total) * 100, 2) for r in rows]  # percentage of reservation made by user per lot

            return  jsonify({'success': True, 'labels': labels, 'data': data}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid User Type'}), 403
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500
    

@summaryChart_bp.route('/active-past-reservation-lotWise/<int:year>')
def active_past_reservation_user_summarychart(year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorised/ expired session'}), status

    try:
        if json_res.get('message') == 'user':
            user_id = json_res.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'message': 'Unauthorised User'}), 401

            result = ReservedSpot.query.filter_by(user_id=user_id) \
            .join(ParkingSpot, ReservedSpot.spot_detail) \
            .join(Lot, ParkingSpot.lot_detail) \
            .filter(extract('year', ReservedSpot.parking_time) == year) \
            .with_entities(
                Lot.lot_name,
                func.sum(case((ReservedSpot.leaving_time == None, 1), else_=0)).label('active_reservation_count'),
                func.sum(case((ReservedSpot.leaving_time != None, 1), else_=0)).label('past_reservation_count')
            ) \
            .group_by(Lot.lot_name) \
            .all()

            if not result:
                return jsonify({'success': True, 'lots': [], 'active_reservations': [], 'past_reservations': []}), 200
            
            lot_names = [row[0] for row in result]
            active_counts = [row[1] for row in result]
            past_counts = [row[2] for row in result]

            return jsonify({'success': True, 'lots': lot_names, 'active_reservations': active_counts, 'past_reservations': past_counts }), 200
        else: 
            return jsonify({'success': False, 'message': 'Invalid User Type'}), 403
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500