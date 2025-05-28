from pydantic import BaseModel, EmailStr, validator
import re

class SignupModel(BaseModel):
    username: str
    password: str
    email: EmailStr
    country: str

    @validator('username')
    def validate_username(cls, v):    # cls similar to self
        v = v.strip()
        if not v:
            raise ValueError("Username cannot be empty.")
        if len(v) < 5 or len(v) > 15:
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
        if len(v) > 40:
            raise ValueError("Email is too long.")
        return v

    @validator('country')
    def validate_country(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Country name cannot be empty.")
        if len(v) < 2 or len(v) > 20:
            raise ValueError("Country name is too short or long.")
        if not all(char.isalpha() or char.isspace() for char in v):
            raise ValueError("Country must only contain letters and spaces.")
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