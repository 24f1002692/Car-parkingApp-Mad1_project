from flask import Blueprint, render_template

landing_bp = Blueprint('TruLot Parking', __name__, url_prefix='')

@landing_bp.route('/TruLotParking')
def TruLotParking():
    return render_template('/components/landing/landing-sections/landing_section_1.html')
