import os
from dotenv import load_dotenv
load_dotenv()

from datetime import datetime, timedelta, UTC
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.events import EVENT_JOB_ERROR


from flask import Flask
from db import db

from models.user_model.user import User, EmailVerification
from models.init_Db import init_user_db  # Import the init_db func
from models.user_model.user import PasswordResetToken

# controllers
from controllers.form.signup_route import signup_bp, otpForm_bp
from controllers.form.login_route import login_bp, role_bp
from controllers.landingPage.landing_route import landing_bp
from controllers.admin.createLot import lot_bp
from controllers.admin.registered_users import registered_user_bp
from controllers.admin.spotDetails import spot_bp
from controllers.user.ratings import rating_bp
from controllers.user.view_book_spot import spot_booking_bp
from controllers.user.reservedSpots import reserved_spot_bp
from controllers.user.reservedSpots import admin_view_reservation_bp
from controllers.user.myProfile import profile_bp


app = Flask(__name__)
app.secret_key = os.getenv('APP_SECRET_KEY')      # used for session cookies

current_dir = os.path.abspath(os.path.dirname(__file__))      # app.py is in the directory parking_app, value of current_dir is path to the parking_app

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(current_dir,  os.getenv('DATABASE_NAME'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False   # imporves performance of sqlalchemy


# IMPORTANT : Bind db to Flask app
db.init_app(app)


#--------------------------------------------------------------------------------------------------------------------

# Routes
# registering blueprint to app

app.register_blueprint(landing_bp)

app.register_blueprint(signup_bp)
app.register_blueprint(login_bp)
app.register_blueprint(otpForm_bp)
app.register_blueprint(role_bp)
app.register_blueprint(lot_bp)
app.register_blueprint(registered_user_bp)
app.register_blueprint(spot_bp)
app.register_blueprint(rating_bp)
app.register_blueprint(spot_booking_bp)
app.register_blueprint(reserved_spot_bp)
app.register_blueprint(admin_view_reservation_bp)
app.register_blueprint(profile_bp)


# --------------------------------------------------------------------------------

def delete_expired_tokens():
    with app.app_context():
        expiry_threshold = datetime.now(UTC) - timedelta(minutes=10)
        expired_tokens = PasswordResetToken.query.filter(
            PasswordResetToken.created_at < expiry_threshold
        ).all()
        for token in expired_tokens:
            db.session.delete(token)
        db.session.commit()


def delete_verified_unregistered_emails():
    with app.app_context():
        verified_emails = EmailVerification.query.filter_by(isVerified=True).all()

        for record in verified_emails:
            user_exists = User.query.filter_by(email=record.email).first()
            
            if not user_exists:
                db.session.delete(record)    # Delete verified email without a user account

        db.session.commit()


scheduler = BackgroundScheduler(misfire_grace_time=300)
scheduler.add_job(func=delete_expired_tokens, trigger="interval", minutes=10)
scheduler.add_job(func=delete_verified_unregistered_emails, trigger='interval', minutes=360)
scheduler.start()

def scheduler_error_listener(event):
    print(f"Scheduler Error: {event}")

scheduler.add_listener(scheduler_error_listener, EVENT_JOB_ERROR)


if __name__ == '__main__':
    init_user_db()
    app.run(debug=True)