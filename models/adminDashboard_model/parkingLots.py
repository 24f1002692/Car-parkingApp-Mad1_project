import random
from db import db
from datetime import datetime

def random_rating():
    return round(random.uniform(3.0, 5.0), 1)

class GeographicalDetails(db.Model):
    __tablename__ = 'geographical_details'
    location_id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(200), nullable=False)        # location, state and country given by admin
    state = db.Column(db.String(30), nullable=False)
    country = db.Column(db.String(30), nullable=False)

    lot_detail = db.relationship('Lots', back_populates='geographical_detail')    # one-many relationship with lots (one location can have many lots).


class Lots(db.Model):
    __tablename__ = 'lots'
    lot_id = db.Column(db.Integer, primary_key=True)
    lot_name = db.Column(db.String(10), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    price_per_hr = db.Column(db.Integer, nullable=False, default=150)

    capacity = db.Column(db.Integer, nullable=False, default=30)       # if admin sets the max capacity => then i pass that to both capacity and available spots
    rating = db.Column(db.Float, default=random_rating, nullable=False)       # will give it a random rating while object creation in request handler 

    geographical_id = db.Column(db.Integer, db.ForeignKey('geographical_details.location_id'), nullable=False)     # foreign key (location_id is geographical_id)
    geographical_detail = db.relationship('GeographicalDetails', back_populates='lot_detail')      # relationship are used to access the attributes, many-one => many lots can have same geography

    spot_detail = db.relationship('ParkingSpots', back_populates='lot_detail')    # one-many relationship with spots

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ParkingSpots(db.Model):
    __tablename__ = 'parking_spots'
    spot_id = db.Column(db.Integer, primary_key=True)
    lot_id = db.Column(db.Integer, db.ForeignKey('lots.lot_id'), nullable=False)
    occupied = db.Column(db.Boolean, nullable=False)
    under_maintenance = db.Column(db.Boolean, nullable=False, default=False) 
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lot_detail = db.relationship('Lots', back_populates='spot_detail')    # many-one   (many spots can belong to one lot)
    reserved_spot_detail=db.relationship('ReservedSpots', back_populates='spot_detail')    # one-many => one parking spots has many reservation over the time


class ReservedSpots(db.Model):
    __tablename__ = 'reserved_parking_spots'
    reserved_spot_id = db.Column(db.Integer, primary_key=True)
    spot_id = db.Column(db.Integer, db.ForeignKey('parking_spots.spot_id'), nullable=False)
    parking_time = db.Column(db.DateTime , nullable=False)
    leaving_time = db.Column(db.DateTime, nullable=False)
    reserve_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    
    spot_detail = db.relationship('ParkingSpots', back_populates='reserved_spot_detail')    # many-one (many reservation of a spot can be done over the time)
    user_detail = db.relationship('User', back_populates='reserved_spot_details')       # many-one (many reservations can be done by one user)
   