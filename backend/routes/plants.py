from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from bson import ObjectId
from database import plants
from auth import get_current_user

router = APIRouter()

class PlantIn(BaseModel):
    name: str
    species: str
    location: str = "Indoor"
    watering_days: int = Field(default=3, ge=1, le=60)
    notes: str = ""

def clean(x):
    x["_id"] = str(x["_id"])
    x["user_id"] = str(x["user_id"])
    return x

@router.get("")
def list_plants(user_id: str = Depends(get_current_user)):
    return [clean(x) for x in plants.find({"user_id": user_id})]

@router.post("")
def add_plant(data: PlantIn, user_id: str = Depends(get_current_user)):
    doc = data.model_dump()
    doc["user_id"] = user_id
    result = plants.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

@router.delete("/{plant_id}")
def delete_plant(plant_id: str, user_id: str = Depends(get_current_user)):
    result = plants.delete_one({"_id": ObjectId(plant_id), "user_id": user_id})
    if not result.deleted_count:
        raise HTTPException(404, "Plant not found")
    return {"message": "Plant deleted"}
