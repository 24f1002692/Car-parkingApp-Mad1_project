import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask

from db import db
from models.init_Db import init_user_db  # Import the init_db func


# controllers
from controllers.form.signup_route import signup_bp
from controllers.form.login_route import login_bp, otpForm_bp, role_bp
from controllers.landingPage.landing_route import landing_bp
from controllers.admin.createLot import lot_bp


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


if __name__ == '__main__':
    init_user_db()
    app.run(debug=True)