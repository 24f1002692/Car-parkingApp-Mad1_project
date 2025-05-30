import os

def init_user_db():
    from app import app
    from db import db
    from models.user_model.user import User
    from models.adminDashboard_model.parkingLots import Lot, GeographicalDetail, ParkingSpot, ReservedSpot
    
    with app.app_context():

        db.create_all()

        # Add admin user if not exists
        if not User.query.filter_by(role='admin').first():
            admin = User(name=os.getenv('ADMIN_NAME'), password=os.getenv('PASSWORD'), email =os.getenv('EMAIL'), country =os.getenv('COUNTRY'), role=os.getenv('ROLE'))
            db.session.add(admin)
            db.session.commit()
            print("Database initialized. Admin user created.")
        else:
            print("Database already initialized.") 
