#  login, register + PROFILE (view / edit / avatar)

from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, EmailStr, Field

from database import users
from auth import hash_password, verify_password, create_token, get_current_user
from services.images import read_image, save_avatar, delete_upload


router = APIRouter()


class AuthIn(BaseModel):
    name: str = ""
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=60)
    current_password: Optional[str] = None
    new_password: Optional[str] = None


def public(user: dict) -> dict:
    """Frontend ko jo user data dikhana hai (password kabhi nahi)."""
    return {
        "name": user["name"],
        "email": user["email"],
        "avatar": user.get("avatar", ""),
    }


def get_user_doc(user_id: str) -> dict:
    try:
        doc = users.find_one({"_id": ObjectId(user_id)})
    except (InvalidId, TypeError):
        doc = None
    if not doc:
        raise HTTPException(404, "User not found")
    return doc


@router.post("/register")
def register(data: AuthIn):

    # Check existing email
    if users.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")

    # Create user
    user = {
        "name": data.name.strip() or data.email.split("@")[0],
        "email": data.email,
        "password": hash_password(data.password),
        "avatar": "",
    }

    # Save user in MongoDB
    result = users.insert_one(user)

    # Return login token
    return {"token": create_token(str(result.inserted_id)), **public(user)}


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

    return {"token": create_token(str(user["_id"])), **public(user)}


# ---------------------------------------------------------
# PROFILE
# ---------------------------------------------------------
@router.get("/me")
def me(user_id: str = Depends(get_current_user)):
    return public(get_user_doc(user_id))


@router.put("/profile")
def update_profile(data: ProfileUpdate, user_id: str = Depends(get_current_user)):
    user = get_user_doc(user_id)
    changes = {}

    if data.name is not None:
        name = data.name.strip()
        if not name:
            raise HTTPException(400, "Name cannot be empty.")
        changes["name"] = name

    if data.new_password:
        if len(data.new_password) < 6:
            raise HTTPException(400, "New password must be at least 6 characters.")
        if not data.current_password or not verify_password(data.current_password, user["password"]):
            raise HTTPException(400, "Current password is incorrect.")
        changes["password"] = hash_password(data.new_password)

    if changes:
        users.update_one({"_id": user["_id"]}, {"$set": changes})
        user = get_user_doc(user_id)

    return public(user)


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    user = get_user_doc(user_id)
    image = await read_image(file)
    url = save_avatar(image, user_id)
    users.update_one({"_id": user["_id"]}, {"$set": {"avatar": url}})
    return public(get_user_doc(user_id))


@router.delete("/avatar")
def remove_avatar(user_id: str = Depends(get_current_user)):
    user = get_user_doc(user_id)
    delete_upload(user.get("avatar", ""))
    users.update_one({"_id": user["_id"]}, {"$set": {"avatar": ""}})
    return public(get_user_doc(user_id))
