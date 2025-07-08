import random
from db import db
from datetime import datetime


class GeographicalDetail(db.Model):
    __tablename__ = 'geographical_details'
    location_id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(120), nullable=False, unique=True)        # location, state and country given by admin
    state = db.Column(db.String(40), nullable=False)
    country = db.Column(db.String(40), nullable=False)

    lot_detail = db.relationship('Lot', back_populates='geographical_detail')    # one-many relationship with lots (one location can have many lots).


class Lot(db.Model):
    __tablename__ = 'lots'
    lot_id = db.Column(db.Integer, primary_key=True)
    geographical_id = db.Column(db.Integer, db.ForeignKey('geographical_details.location_id'), nullable=False)     # foreign key (location_id is geographical_id)
    lot_name = db.Column(db.String(40), nullable=False)
    description = db.Column(db.String(220), nullable=False)
    price_per_hr = db.Column(db.Integer, nullable=False, default=150)
    timing = db.Column(db.String(80), nullable=False)

    capacity = db.Column(db.Integer, nullable=False, default=250)       # if admin sets the max capacity => then i pass that to both capacity and available spots
    available_spots = db.Column(db.Integer, nullable=False, default=250)
    rating = db.Column(db.Float, nullable=False)       # will give it a random rating while object creation in request handler 
    image_url = db.Column(db.String(255), nullable=False)


    geographical_detail = db.relationship('GeographicalDetail', back_populates='lot_detail')      # relationship are used to access the attributes, many-one => many lots can have same geography
    spot_detail = db.relationship('ParkingSpot', back_populates='lot_detail')    # one-many relationship with spots, one lot willl have list of spots.
    ratings_detail = db.relationship('Rating', back_populates='lot_detail')  # one lot can have many ratings

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleteLot = db.Column(db.Boolean, default=False)


class ParkingSpot(db.Model):
    __tablename__ = 'parking_spots'
    spot_id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('lots.lot_id'), nullable=False)   # foreign key in spot match one spot to one lot.
    occupied = db.Column(db.Boolean, nullable=False, default=False)
    under_maintenance = db.Column(db.Boolean, nullable=False, default=False) 

    lot_detail = db.relationship('Lot', back_populates='spot_detail')    # many-one   (many spots can belong to one lot)
    reserved_spot_detail=db.relationship('ReservedSpot', back_populates='spot_detail')    # one-many => one parking spots has many reservation over the time

    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleteSpot = db.Column(db.Boolean, default=False)



class ReservedSpot(db.Model):
    __tablename__ = 'reserved_parking_spots'
    reserved_spot_id = db.Column(db.Integer, primary_key=True)
    spot_id = db.Column(db.Integer, db.ForeignKey('parking_spots.spot_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    parking_time = db.Column(db.DateTime , nullable=False)
    leaving_time = db.Column(db.DateTime, nullable=True)
    bill_pay = db.Column(db.Boolean, default=False)
    
    spot_detail = db.relationship('ParkingSpot', back_populates='reserved_spot_detail')    # many-one (many reservation of a spot can be done over the time)
    user_detail = db.relationship('User', back_populates='reserved_spot_detail')       # many-one (many reservations can be done by one user)


class Rating(db.Model):
    __tablename__ = 'ratings_table'
    rating_id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('lots.lot_id'), nullable=False)   
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    rating_value = db.Column(db.Float, nullable=False)       
    rating_description = db.Column(db.String, nullable=False)

    lot_detail = db.relationship('Lot', back_populates='ratings_detail')
    user_detail = db.relationship('User', back_populates='ratings_detail')

   