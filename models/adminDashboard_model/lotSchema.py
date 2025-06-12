from pydantic import BaseModel, validator
from typing import Optional

class lotModel(BaseModel):
    lot_name: str
    description: str
    price_per_hr: Optional[int] = None
    capacity: Optional[int] = None
    rating: Optional[int] = None
    timing: str
    location: str
    state: str
    country: str

    @validator('lot_name')
    def validate_lot_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Lotname cannot be empty')
        if(len(v) < 10):
            raise ValueError('Name for the lot is too short')
        if(len(v) > 40):
            raise ValueError('Name of the lot is too long')
        
        return v
        
    @validator('description')
    def validate_description(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Description cannot be empty')
        if(len(v) < 50):
            raise ValueError('Description for the lot is too short.')
        if(len(v) > 210):
            raise ValueError('Description for the lot is too long.')
        
        return v
        
    @validator('price_per_hr')
    def validate_price(cls, v):
        if v is not None and not (99 <= v <= 299):
            raise ValueError('Price of parking cost should be between 99 - 299.')
        
        return v
        

    @validator('capacity')
    def validate_capacity(cls, v):
        if v is not None and not (80 <= v <= 400):           # if v is None then default value will be assigned.
            raise ValueError('Capacity must be between 80 and 400 if provided.')
        
        return v
    
    
    @validator('location')
    def validate_location(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('location Cannot be empty')
        if not(10 <= len(v) < 150):
            raise ValueError('location is too short or too long.')
        
        return v
    
    @validator('state')
    def validate_state(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('state cannot be empty')
        if not(4 <= len(v) <= 40):
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
    

    @validator('timing')
    def validate_timing(cls, v):
        v = v.strip()
        if not v:
            raise ValueError('Timings of parking lot is required')
        
        if (len(v) > 80):
            raise ValueError('Timing Field is very long')
        
        if len(v) < 18:
            raise ValueError('Timing should include time and days')
        
        return v
        
        


        