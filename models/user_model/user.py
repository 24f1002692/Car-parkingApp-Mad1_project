from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy (linked to Flask later in app.py)
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(40), nullable=False, unique=True)
    country = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(20), default='user')

# Add other models (Course, Student, etc.) here...