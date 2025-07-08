from flask import Blueprint, render_template

landing_bp = Blueprint('TruLotParking', __name__, url_prefix='')

@landing_bp.route('/TruLotParking')
def TruLotParking():
    return render_template('/components/landing/landingBase.html')
