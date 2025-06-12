from db import db
from datetime import datetime, UTC


class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    address_id = db.Column(db.Integer, db.ForeignKey('address.address_id'), nullable=False)
    name = db.Column(db.String(25), nullable=False)
    password = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    image = db.Column(db.String(255), nullable=False)
    gender = db.Column(db.String(6), nullable=False)
    role = db.Column(db.String(20), default='user')
    address_detail = db.relationship('Address', back_populates='user_detail')
    reserved_spot_detail = db.relationship('ReservedSpot', back_populates='user_detail')   # one user can reserve many spots


class Address(db.Model):
    __tablename__ = 'address'
    address_id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(300), nullable=False)
    pincode = db.Column(db.String(6), nullable=True)
    latitude = db.Column(db.String(50), nullable=True)
    longitude = db.Column(db.String(50), nullable=True)

    user_detail = db.relationship('User', back_populates='address_detail')



class EmailVerification(db.Model):
    __tablename__ = 'emailVerification'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), nullable=False, unique=True)
    isVerified = db.Column((db.Boolean), default=False, nullable=False)


class PasswordResetToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False)
    token = db.Column(db.Text, nullable=False, unique=True)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(
        db.DateTime(timezone=True), 
        default=lambda: datetime.now(UTC)
    )

