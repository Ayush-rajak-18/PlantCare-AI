#  login & register 

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from database import users
from auth import hash_password, verify_password, create_token


router = APIRouter()


class AuthIn(BaseModel):
    name: str = ""
    email: EmailStr
    password: str


@router.post("/register")
def register(data: AuthIn):

    # Check existing email
    if users.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")

    # Create user
    user = {
        "name": data.name.strip() or data.email.split("@")[0],
        "email": data.email,
        "password": hash_password(data.password)
    }

    # Save user in MongoDB
    result = users.insert_one(user)

    # Return login token
    return {
        "token": create_token(str(result.inserted_id)),
        "name": user["name"],
        "email": user["email"]
    }


@router.post("/login")
def login(data: AuthIn):

    user = users.find_one({"email": data.email})

    if not user or not verify_password(
        data.password,
        user["password"]
    ):
        raise HTTPException(
            401,
            "Invalid email or password"
        )

    return {
        "token": create_token(str(user["_id"])),
        "name": user["name"],
        "email": user["email"]
    }