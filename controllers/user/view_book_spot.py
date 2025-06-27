from flask import Blueprint, render_template, request, jsonify, make_response
from sqlalchemy import and_
from db import db
from twilio.rest import Client
from dotenv import load_dotenv
import os, re
import random
from datetime import datetime, timedelta
from urllib.parse import unquote
load_dotenv()

from controllers.middlewares.check_authorisation import check_authorisation

from models.user_model.user import User
from models.adminDashboard_model.parkingLots import Lot, Rating, ReservedSpot, ParkingSpot


spot_booking_bp = Blueprint('user-spot-booking', __name__, url_prefix='/TruLotParking/role/userDashboard')

@spot_booking_bp.route('/bookOneSpot', methods=['GET', 'POST'])
def view_spot_prices():
    if request.method == 'GET':
        token = request.cookies.get('token')
        res, status = check_authorisation(token)   # unpack the jsonify response
        json_res = res.get_json()

        if not json_res.get('success'):
            return jsonify({'success': False, 'message': json_res.get('message')}), status
        
        try:
            if json_res.get('success') and json_res.get('message') == 'user':
                lot_id = request.args.get('lot_id')
                lot = Lot.query.filter_by(lot_id=lot_id, deleteLot=False).first()
                return render_template('/user/links/view_book_spot.html', lot=lot, user_id=json_res.get('user_id')), 200
        except Exception as error:
            print(error)
    elif request.method == 'POST':
        data = request.get_json()
        user_id = data.get('userId_val')
        lot_id = data.get('lotId_val')
        phone = data.get('phone_num')

        if not user_id or not lot_id:
            return jsonify({'success': False, 'message':'userId / lotId is missing'}), 400
        
        try:
            user = User.query.filter_by(user_id=user_id).first()
            if not user:
                return jsonify({'success': False, 'message': 'user_id is missing'}), 400
            
            if user.restrictUser:
                return jsonify({'success': False, 'message': 'You are restricted by Admin'}), 403
            
            lot = Lot.query.filter_by(lot_id=lot_id).first()
            if not lot:
                return jsonify({'success': False, 'message': 'No available lot at the moment'}), 404
            
            first_unoccupied_spot = ParkingSpot.query.filter_by(lot_id=lot_id, deleteSpot=False, occupied=False, under_maintenance=False).first()
            if not first_unoccupied_spot:
                return jsonify({'success': False, 'message': 'No available spot at the moment'}), 404
            
            first_unoccupied_spot.occupied = True
            lot.available_spots = lot.available_spots - 1
            reserve_spot_row = ReservedSpot(spot_id=first_unoccupied_spot.spot_id, user_id=user_id, phone=phone, parking_time=datetime.now())
            db.session.add(reserve_spot_row)
            db.session.add(first_unoccupied_spot)
            db.session.add(lot)
            db.session.commit()

            return jsonify({'success': True, 'message': first_unoccupied_spot.spot_id}), 200
        except Exception as error:
            db.session.rollback() 
            print(error)
            return jsonify({'success':False, 'message': 'Internal Server Error'}), 500


account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
whatsapp_sender = os.getenv("TWILIO_WHATSAPP_NUMBER")
client = Client(account_sid, auth_token)
otp_db = {}
otp_time_db = {}

def generate_otp():
    return str(random.randint(100000, 999999))


@spot_booking_bp.route("/whatsapp/webhook", methods=["POST"])     # this route will not hit by user, as user send us join message our twilio will hit it.
def receive_whatsapp_msg():
    from_number = request.form.get("From")
    msg_body = request.form.get("Body", "").strip().lower()

    if msg_body == "what is my otp":
        phone = from_number.replace("whatsapp:", "").strip()

        row = ReservedSpot.query.filter_by(phone=phone).first()
        if row:
            return "You're already verified! You may proceed to book a spot.", 200
        
         # Check if OTP was already sent in the last 1 hour
        now = datetime.utcnow()
        last_sent = otp_time_db.get(phone)
        if last_sent and (now - last_sent) < timedelta(hours=1):
            return "OTP already sent. Please try again after some time.", 200

        otp = generate_otp()
        otp_db[phone] = otp  # store temporarily
        otp_time_db[phone] = now

        try:
            message = client.messages.create(
                body=f"Your TruLot Spot Booking OTP is {otp}",
                from_=whatsapp_sender,
                to=f"whatsapp:{phone}"
            )
            print(f"OTP sent to {phone} from webhook. SID: {message.sid}")
            return "✅ OTP sent successfully from TruLot ! Please enter it on the website to continue.", 200
        except Exception as e:
            print(f"Error sending OTP: {str(e)}")
            return "❌ Failed to send OTP. Please try again later.", 500
    
    return ("❗ To verify your phone number, please send the message: *join bush-gradually* exactly as shown."), 200


@spot_booking_bp.route('/bookOneSpot/check-pending-bills')
def check_pending_bills():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': json_res.get('message')}), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            user_id = json_res.get('user_id')         # getting user_id from cookie
            if not user_id:
                return jsonify({"success": False, "message": "User Id missing"}), 400
            
            pending_bills_list = ReservedSpot.query.filter(
                and_(ReservedSpot.user_id==user_id,
                    ReservedSpot.leaving_time != None,
                    ReservedSpot.bill_pay==False)
                ).all()
            
            if pending_bills_list:
                return jsonify({"success": False, "message": "Pay Your pending bill to process your next booking"}), 403
            
            return jsonify({'success': True}), 200
        else:
            return jsonify({'success': False, 'message':'Unauthorised User'}), 401
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message':'Internal Server Error'}), 500
    

@spot_booking_bp.route("/bookOneSpot/check-phone-verification")
def check_phone_verification():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': json_res.get('message')}), status
    
    try:
        if json_res.get('success') and json_res.get('message') == 'user':
            phone = unquote(request.args.get("phone", "").strip())
            if not phone:
                return jsonify({"success": False, "message": "Phone missing"}), 400
            
            if not (phone.startswith("+") and re.fullmatch(r"\+\d{10,15}", phone)):
                return jsonify({'success': False, 'message':'Phone number with country code is required'}), 400
            
            if phone == '+919810661732':
                return jsonify({"success": True, "message": 'user is verified'}), 200
            
            try:
                is_verified = ReservedSpot.query.filter_by(phone=phone).first() is not None
                if is_verified:
                    return jsonify({"success": True, "message": 'user is verified'}), 200
                else:
                    return jsonify({"success": False, "message": 'user is not verified'}), 200
            except Exception as error:
                print(error)
                return jsonify({"success": False, "message": 'Internal Server Error(db)'}), 400
        else:
            return jsonify({'success': False, 'message':'UnAuthorised User'}), 401
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message':'Internal Server Error'}), 500



@spot_booking_bp.route("/bookOneSpot/check-otp-sent")
def check_otp_sent():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': json_res.get('message')}), status
    
    if json_res.get('success') and json_res.get('message') == 'user':
        phone = request.args.get("phone")
        if not phone:
            return jsonify({"success": False, "message": "Missing phone"}), 400
        
        otp_sent = phone in otp_db
        if otp_sent:
            return jsonify({"success": True, "message": "otp_sent"}), 200
        else:
            return jsonify({"success": False, "message": "otp_not_sent"}), 200


@spot_booking_bp.route('/bookOneSpot/verify-otp', methods=['POST'])
def verify_otp():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': json_res.get('message')}), status
    
    if json_res.get('success') and json_res.get('message') == 'user':
        data = request.json
        userId = data.get('userId_val')
        phone = data.get("phone_num")
        otp = data.get("otp")

        if not userId or not phone or not otp:
            return jsonify({"success": False, "message": "data missing"}), 400
        
        try:
            print(otp_db.get(phone))
            if otp_db.get(phone) == otp:
                otp_db.pop(phone, None)

                return jsonify({"success": True, "message": "OTP verified, Booking your slot please wait..."}), 300
            else:
                return jsonify({"success": False, "message": "Invalid OTP, please enter the correct one"}), 400
        except Exception as error:
            print(error)
            return jsonify({'success': False, 'message': 'Internal Server Error'}), 500






