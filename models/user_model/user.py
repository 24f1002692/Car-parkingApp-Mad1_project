from db import db
from datetime import datetime, UTC


class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(25), nullable=False)
    password = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    phone = db.Column(db.String(13), nullable=False)
    role = db.Column(db.String(20), default='user')
    reserved_spot_detail = db.relationship('ReservedSpot', back_populates='user_detail')   # one user can reserve many spots


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

