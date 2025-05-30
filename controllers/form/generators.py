import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
import os
import datetime

SECRET_KEY = os.getenv('JWT_SECRET')

def generate_jwt(email, username):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    payload = {
        'email': email,
        'username':username,
        'exp': int(expiration_time.timestamp())  
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def decode_jwt(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload          # returns dict with 'email', 'username' and 'exp'
    except ExpiredSignatureError:
        print("Token has expired.")
        return None
    except InvalidTokenError:
        print("Invalid token.")
        return None