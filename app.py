import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask

from models.user_model.user import db
from models.user_model.init_userDb import init_user_db  # Import the init_db func


# controllers
from controllers.form.signup_route import signup_bp
from controllers.form.login_route import login_bp, otpForm_bp, role_bp
from controllers.landingPage.landing_route import landing_bp


app = Flask(__name__)
app.secret_key = 'Jerry_IITM_987148'

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




if __name__ == '__main__':
    init_user_db()
    app.run(debug=True)