from flask import Blueprint, render_template, request, jsonify, make_response
from db import db
from sqlalchemy import func

from controllers.middlewares.check_authorisation import check_authorisation

from models.user_model.user import User
from models.adminDashboard_model.parkingLots import Lot, Rating



rating_bp = Blueprint('user-rating', __name__, url_prefix='/TruLotParking/role/userDashboard')

@rating_bp.route('/ratingLot', methods=['POST'])
def ratingLot():
    token = request.cookies.get('token')
    res, status = check_authorisation(token)   # unpack the jsonify response
    json_res = res.get_json()

    if not json_res.get('success'):
        return jsonify({'success': False, 'message': json_res.get('message')}), status

    try:
        if json_res.get('success') and json_res.get('message') == 'user':

            data = request.get_json()
            userId = data.get('userId')
            lotId = data.get('lotId')
            rating_value = data.get('rating_value')
            rating_description = data.get('rating_description')

            if not all([userId, lotId, rating_value, rating_description]):
                return jsonify({'success': False, 'message': 'Missing required fields'}), 400
            
            if not (1 <= rating_value <= 5):
                return jsonify({'success': False, 'message': 'Rating must be between 1 and 5'}), 400

            existing_rating = Rating.query.filter_by(user_id=userId, lot_id=lotId).first()
            if existing_rating:
                return jsonify({'success': False, 'message': 'You have already rated this parking lot.'}), 400
            
            
            rating_obj = Rating(lot_id=lotId, user_id=userId, rating_value=rating_value, rating_description=rating_description)
            db.session.add(rating_obj)
            db.session.flush()

            average_rating = db.session.query(func.avg(Rating.rating_value)).filter_by(lot_id=lotId).scalar()
            rounded_average_rating = round(average_rating, 1)

            lot = Lot.query.get(lotId)
            if lot:
                lot.rating = rounded_average_rating
                db.session.commit()
                return jsonify({'success': True, 'message': 'Rating submitted successfully'}), 200
            else:
                db.session.rollback()
                return jsonify({'success': False, 'message': 'Lot not found'}), 404
        else:
            return jsonify({'success': False, 'message': 'Only user can perform rating'}), 400
    except Exception as error:
        print(error)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 400
