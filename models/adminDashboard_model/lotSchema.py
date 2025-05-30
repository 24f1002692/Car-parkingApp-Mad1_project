from pydantic import BaseModel, validator
from typing import Optional

class lotModel(BaseModel):
    lot_name: str
    description: str
    price_per_hr: Optional[int] = None
    capacity: Optional[int] = None
    rating: Optional[int] = None
    location: str
    state: str
    country: str

    @validator('lot_name')
    def validate_lot_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Lotname cannot be empty')
        if(len(v) < 7):
            raise ValueError('Name for the lot is too short')
        if(len(v) > 50):
            raise ValueError('Name of the lot is too long')
        
        return v
        
    @validator('description')
    def validate_description(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Description cannot be empty')
        if(len(v) < 50):
            raise ValueError('Description for the lot is too short.')
        if(len(v) > 500):
            raise ValueError('Description for the lot is too long.')
        
        return v
        
    @validator('price_per_hr')
    def validate_price(cls, v):
        if v is not None and not (99 <= v <= 999):
            raise ValueError('Price of parking cost should be between 99 - 999.')
        
        return v
        

    @validator('capacity')
    def validate_capacity(cls, v):
        if v is not None and not (10 <= v <= 50):           # if v is None then default value will be assigned.
            raise ValueError('Capacity must be between 10 and 50 if provided.')
        
        return v
    

    @validator('rating')
    def validate_rating(cls, v):
        if v is not None and not(1 <= v <= 5):
            raise ValueError('Rating must be between 1-5.')
        
        return v
    
    @validator('location')
    def validate_location(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('location Cannot be empty')
        if not(10 <= len(v) < 200):
            raise ValueError('location is too short or too long.')
        
        return v
    
    @validator('state')
    def validate_state(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('state cannot be empty')
        if not(1 <= len(v) <= 40):
            raise ValueError('state name is too long or too short')
        
        return v
        
    @validator('country')
    def validate_country(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('country cannot be empty')
        if not(1 <= len(v) <= 40):
            raise ValueError('country name is too long or too short.')
    
        return v
        
        


        