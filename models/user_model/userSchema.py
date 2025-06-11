from pydantic import BaseModel, EmailStr, validator
import re

class SignupModel(BaseModel):
    username: str
    password: str
    email: EmailStr
    phone: str
    address: str
    gender: str

    @validator('username')
    def validate_username(cls, v):    # cls similar to self
        v = v.strip()
        if not v:
            raise ValueError("Username cannot be empty.")
        if len(v) < 3 or len(v) > 25:
            raise ValueError("Username length should be 5-15 chars.")
        return v

    @validator('password')
    def validate_password(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Password cannot be empty.")
        if len(v) < 5 or len(v) > 15:
            raise ValueError("Password length should be 5-15 chars.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

    @validator('email')
    def validate_email(cls, v):
        if not v.strip():
            raise ValueError("Email cannot be empty.")
        if len(v) > 80:
            raise ValueError("Email is too long.")
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if not v.strip():
            raise ValueError("Phone number cannot be empty")
        if not re.fullmatch(r'^\d{10}$', v):
            raise ValueError("Phone number must contain only 10 digits")
        return v
    
    @validator('address')
    def validate_address(cls, v):
        if not v.strip():
            raise ValueError("Address cannot be empty")
        if len(v) > 300:
            raise ValueError("Address is too long")
        return v
    
    @validator('gender')
    def validate_gender(cls, v):
        if not v.strip():
            raise ValueError('gender is required')
        if v not in ['Male', 'Female']:
            raise ValueError("Please specify your gender")
        
        return v


class LoginModel(BaseModel):
    password: str
    email: EmailStr

    @validator('password')
    def validate_password(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Password cannot be empty.")
        if len(v) < 5 or len(v) > 15:
            raise ValueError("Password length should be 5-15 chars.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

    @validator('email')
    def validate_email(cls, v):
        if not v.strip():
            raise ValueError("Email cannot be empty.")
        if len(v) > 40:
            raise ValueError("Email is too long.")
        return v