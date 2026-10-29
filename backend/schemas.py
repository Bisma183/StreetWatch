# describes the data sent between app and API.
#checks incoming data from mobile app before its saved in db 
#schemas.py is the security gate at the API door
#FastAPI uses Pydantic models for this: they describe the expected request data and automatically validate it.
# Your models describe database tables. Schemas describe what the API accepts and returns.


from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"