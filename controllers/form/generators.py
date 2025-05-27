import jwt
import os
import datetime

SECRET_KEY = os.getenv('JWT_SECRET')

def generate_jwt(email):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    payload = {
        'email': email,
        'exp': int(expiration_time.timestamp())  
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')