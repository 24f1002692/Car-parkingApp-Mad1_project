import os

def init_user_db():
    from app import app
    from db import db
    from models.user_model.user import User, EmailVerification, Address, PasswordResetToken
    from models.adminDashboard_model.parkingLots import Lot, GeographicalDetail, ParkingSpot, ReservedSpot
    
    with app.app_context():

        db.create_all()

        # Add admin user if not exists
        if not User.query.filter_by(role='admin').first():
            row = EmailVerification(email=os.getenv('EMAIL'), isVerified=True)
            db.session.add(row)
            db.session.flush()

            address = Address(address=os.getenv('ADDRESS'), pincode=os.getenv('PINCODE'))
            db.session.add(address)
            db.session.flush()
            
            admin = User(address_id=address.address_id, name=os.getenv('ADMIN_NAME'), password=os.getenv('PASSWORD'), email =os.getenv('EMAIL'), phone=os.getenv('PHONE'), gender=os.getenv('GENDER'), image='', role=os.getenv('ROLE'))
            db.session.add(admin)
            db.session.commit()
            print("Database initialized. Admin user created.")
        else:
            print("Database already initialized.") 
