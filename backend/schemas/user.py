from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str

    model_config = {
    "from_attributes": True
    }

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str