from db import db

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(40), nullable=False, unique=True)
    country = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(20), default='user')
    reserved_spot_details = db.relationship('ReservedSpots', back_populates='user_detail')
