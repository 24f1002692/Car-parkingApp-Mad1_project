import os

def init_user_db():
    from app import app  
    from models.user_model.user import db, User  
    
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
            print('here bete ', User.query.filter_by(role='admin').all())
