import calendar
from collections import defaultdict

from flask import Blueprint, render_template, request, jsonify, make_response
from sqlalchemy import and_, func, extract, case
from db import db
from controllers.middlewares.check_authorisation import check_authorisation
from models.adminDashboard_model.parkingLots import Lot, Rating, ReservedSpot, ParkingSpot


overViewChart_bp = Blueprint('overview_chart', __name__, url_prefix='/TruLotParking/role/adminDashboard')

@overViewChart_bp.route('/Quick-Overview')
def quick_overview():
    try:
        token = request.cookies.get('token')
        res, status = check_authorisation(token)   # unpack the jsonify response
        json_res = res.get_json()

        if not json_res.get('success'):
            return render_template('/components/error_page.html', error='Unauthorised/ expired session'), status
        
        if json_res.get('success') and json_res.get('message') == 'admin':
            return render_template('/admin/links/summaryChart.html'), 200
    except Exception as error:
        print(error)
        return render_template('/components/error_page.html', error='Internal Server Error'), 500
    

# --------------------------------------------------------------- Monthly & DayWise Earning --------------------------------------
@overViewChart_bp.route('/monthly-earning/<int:year>')
def monthly_earning(year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorised/ expired session'}), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'admin':
            reservations = ReservedSpot.query.filter(
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
    
@overViewChart_bp.route('/earning/daily/<int:month>/<int:year>')
def earn_daily(month, year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorized/ expired session'}), status

    try:
        if json_res.get('success') and json_res.get('message') == 'admin':
            reservations = ReservedSpot.query.filter(      # extracting all rows which are completed reservations and is of the given month and year
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
            labels = [str(day) for day in range(1, num_days + 1)]         # day-1, day-2, . . . . . .
            data = [day_totals.get(day, 0.0) for day in range(1, num_days + 1)]

            return jsonify({'success': True, 'labels': labels, 'data': data}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid User Type'}), 403
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


# ----------------------------------------------------------------- Day wise Progress between the completed reservations and the earning lot-wise -------------------
@overViewChart_bp.route('/relation_earning_and_booking/<int:year>')
def relation_earning_and_booking(year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorised/ expired session'}), status

    try:
        if json_res.get('message') == 'admin':
            reservations = ReservedSpot.query.filter(
                ReservedSpot.leaving_time.isnot(None),
                ReservedSpot.bill_pay.is_(True),
                db.extract('year', ReservedSpot.parking_time) == year
            ).all()

            if not reservations:
                return jsonify({'success': True, 'points': []}), 200

            daily_data = defaultdict(lambda: {"bookings": 0, "earnings": 0.0})   # lambda(dynamic) means here any date (date will be stored as key)
            for res in reservations:
                date_key = res.leaving_time.date()          # datetime.date object (YYYY-MM-DD)
                daily_data[date_key]["bookings"] += 1
                daily_data[date_key]["earnings"] += res.bill_amount or 0.0

            points = [
                {
                    "x": daily_data[day]["bookings"],                        
                    "y": round(daily_data[day]["earnings"], 2),            
                    "label": day.strftime("%b %d, %Y")                      
                }
                for day in sorted(daily_data)
            ]
            return jsonify({'success': True, 'points': points}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid User Type'}), 403
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


# -------------------------------------------------------------- Number of active and past reservation LotWise-----------------------
@overViewChart_bp.route('/active-past-reservation-lotWise/<int:year>')
def active_past_reservation_chart(year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorised/ expired session'}), status

    try:
        if json_res.get('message') == 'admin':
            result = ReservedSpot.query \
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


# ------------------------------------------------------------------ Lot Wise Earning In the given year ------------------------------------------
@overViewChart_bp.route('/lot-wise-earning-percentage/<int:year>')
def lotWise_earning(year):
    token = request.cookies.get('token')
    res, status = check_authorisation(token)
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': 'Unauthorized/ expired session'}), status

    try:
        if json_res.get('success') and json_res.get('message') == 'admin':
            earning_by_lot = ReservedSpot.query.filter_by(bill_pay=True) \
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

            if not earning_by_lot:
                return jsonify({'success': True, 'labels': [], 'data': []}), 200 
            
            total = sum([r[1] for r in earning_by_lot])  
            labels = [r[0] for r in earning_by_lot]           # r[0] is group_by(lotname)
            data = [round((r[1] / total) * 100, 2) for r in earning_by_lot]      # r[1] is the amount spend in that lot

            return  jsonify({'success': True, 'labels': labels, 'data': data}), 200
        else:
            return jsonify({'success': False, 'message': 'Invalid User Type'}), 200
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500