# Plants: list / add / EDIT / delete + WATER NOW + PHOTO
import math
from datetime import datetime, timedelta, timezone
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from database import plants
from auth import get_current_user
from services.images import read_image, save_plant_photo, delete_upload

router = APIRouter()


# ---------------------------------------------------------
# Request bodies
# ---------------------------------------------------------
class PlantIn(BaseModel):
    name: str
    species: str
    location: str = "Indoor"
    watering_days: int = Field(default=3, ge=1, le=60)
    notes: str = ""


class PlantUpdate(BaseModel):
    # Edit ke time sab optional: jo bheja wahi badlega
    name: Optional[str] = None
    species: Optional[str] = None
    location: Optional[str] = None
    watering_days: Optional[int] = Field(default=None, ge=1, le=60)
    notes: Optional[str] = None


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_dt(value) -> Optional[datetime]:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def watering_info(doc: dict) -> dict:
    """Agli watering kab hai: next_watering, status (overdue/today/ok), days_left."""
    last = parse_dt(doc.get("last_watered")) or doc["_id"].generation_time
    interval = int(doc.get("watering_days") or 3)
    next_dt = last + timedelta(days=interval)
    hours_left = (next_dt - now_utc()).total_seconds() / 3600

    if hours_left <= 0:
        status = "overdue"
    elif hours_left < 24:
        status = "today"
    else:
        status = "ok"

    return {
        "last_watered": last.isoformat(),
        "next_watering": next_dt.isoformat(),
        "water_status": status,
        "days_left": max(0, math.ceil(hours_left / 24)),
        "days_overdue": int(-hours_left // 24) if hours_left <= 0 else 0,
    }


def clean(doc: dict) -> dict:
    info = watering_info(doc)  # _id abhi ObjectId hai
    doc["_id"] = str(doc["_id"])
    doc["user_id"] = str(doc["user_id"])
    doc.setdefault("photo", "")
    doc.update(info)
    return doc


def to_oid(plant_id: str) -> ObjectId:
    try:
        return ObjectId(plant_id)
    except (InvalidId, TypeError):
        raise HTTPException(404, "Plant not found")


def get_own_plant(plant_id: str, user_id: str) -> dict:
    doc = plants.find_one({"_id": to_oid(plant_id), "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Plant not found")
    return doc


# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------
@router.get("")
def list_plants(user_id: str = Depends(get_current_user)):
    return [clean(x) for x in plants.find({"user_id": user_id})]


@router.post("")
def add_plant(data: PlantIn, user_id: str = Depends(get_current_user)):
    doc = data.model_dump()
    doc["user_id"] = user_id
    doc["photo"] = ""
    doc["last_watered"] = now_utc().isoformat()  # naya plant = abhi paani diya maana
    result = plants.insert_one(doc)
    doc["_id"] = result.inserted_id
    return clean(doc)


@router.put("/{plant_id}")
def update_plant(plant_id: str, data: PlantUpdate, user_id: str = Depends(get_current_user)):
    get_own_plant(plant_id, user_id)

    changes = {k: v for k, v in data.model_dump().items() if v is not None}
    for key in ("name", "species"):
        if key in changes:
            changes[key] = changes[key].strip()
    if changes.get("name") == "":
        raise HTTPException(400, "Plant name cannot be empty.")

    if changes:
        plants.update_one({"_id": to_oid(plant_id)}, {"$set": changes})

    return clean(get_own_plant(plant_id, user_id))


@router.post("/{plant_id}/water")
def water_plant(plant_id: str, user_id: str = Depends(get_current_user)):
    """'Water now' button: last_watered = abhi."""
    get_own_plant(plant_id, user_id)
    plants.update_one(
        {"_id": to_oid(plant_id)},
        {"$set": {"last_watered": now_utc().isoformat()}},
    )
    return clean(get_own_plant(plant_id, user_id))


@router.post("/{plant_id}/photo")
async def upload_photo(
    plant_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    get_own_plant(plant_id, user_id)
    image = await read_image(file)
    url = save_plant_photo(image, plant_id)
    plants.update_one({"_id": to_oid(plant_id)}, {"$set": {"photo": url}})
    return clean(get_own_plant(plant_id, user_id))


@router.delete("/{plant_id}/photo")
def remove_photo(plant_id: str, user_id: str = Depends(get_current_user)):
    doc = get_own_plant(plant_id, user_id)
    delete_upload(doc.get("photo", ""))
    plants.update_one({"_id": to_oid(plant_id)}, {"$set": {"photo": ""}})
    return clean(get_own_plant(plant_id, user_id))


@router.delete("/{plant_id}")
def delete_plant(plant_id: str, user_id: str = Depends(get_current_user)):
    doc = get_own_plant(plant_id, user_id)
    delete_upload(doc.get("photo", ""))
    plants.delete_one({"_id": to_oid(plant_id), "user_id": user_id})
    return {"message": "Plant deleted"}
