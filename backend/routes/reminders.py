# Reminders: automatic watering reminders + custom reminders
from datetime import datetime, timedelta, timezone
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from database import plants, reminders
from auth import get_current_user
from routes.plants import watering_info, parse_dt, now_utc, to_oid

router = APIRouter()

WATER_PREFIX = "water:"      # watering reminder ka id:  water:<plant_id>
UPCOMING_DAYS = 7            # automatic watering reminders kitne din aage tak dikhayein


class ReminderIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    note: str = Field(default="", max_length=300)
    due_at: str                                   # ISO datetime (browser UTC bhejta hai)
    plant_id: Optional[str] = None
    repeat_days: int = Field(default=0, ge=0, le=365)   # 0 = ek baar


def status_for(due: datetime) -> str:
    hours = (due - now_utc()).total_seconds() / 3600
    if hours <= 0:
        return "overdue"
    if hours < 24:
        return "today"
    return "upcoming"


def custom_oid(rid: str) -> ObjectId:
    try:
        return ObjectId(rid)
    except (InvalidId, TypeError):
        raise HTTPException(404, "Reminder not found")


# ---------------------------------------------------------
# GET /reminders  -> sab reminders ek list mein
# ---------------------------------------------------------
@router.get("")
def list_reminders(user_id: str = Depends(get_current_user)):
    items = []
    plant_lookup = {}

    # 1) Automatic watering reminders (plants se)
    for p in plants.find({"user_id": user_id}):
        info = watering_info(p)
        pid = str(p["_id"])
        plant_lookup[pid] = p
        due = parse_dt(info["next_watering"])

        if (due - now_utc()) > timedelta(days=UPCOMING_DAYS):
            continue

        items.append({
            "id": WATER_PREFIX + pid,
            "kind": "watering",
            "title": f"Water {p.get('name', 'your plant')}",
            "note": p.get("location", ""),
            "plant_id": pid,
            "plant_name": p.get("name", ""),
            "plant_photo": p.get("photo", ""),
            "due_at": due.isoformat(),
            "status": status_for(due),
            "repeat_days": int(p.get("watering_days") or 0),
        })

    # 2) Custom reminders
    for r in reminders.find({"user_id": user_id, "done": False}):
        due = parse_dt(r.get("due_at"))
        if not due:
            continue
        pid = r.get("plant_id") or ""
        plant = plant_lookup.get(pid)
        items.append({
            "id": str(r["_id"]),
            "kind": "custom",
            "title": r.get("title", ""),
            "note": r.get("note", ""),
            "plant_id": pid,
            "plant_name": plant.get("name", "") if plant else "",
            "plant_photo": plant.get("photo", "") if plant else "",
            "due_at": due.isoformat(),
            "status": status_for(due),
            "repeat_days": int(r.get("repeat_days") or 0),
        })

    items.sort(key=lambda x: x["due_at"])

    counts = {"overdue": 0, "today": 0, "upcoming": 0}
    for it in items:
        counts[it["status"]] += 1
    counts["due_now"] = counts["overdue"] + counts["today"]

    return {"items": items, "counts": counts}


# ---------------------------------------------------------
# POST /reminders  -> custom reminder banana
# ---------------------------------------------------------
@router.post("")
def create_reminder(data: ReminderIn, user_id: str = Depends(get_current_user)):
    due = parse_dt(data.due_at)
    if not due:
        raise HTTPException(400, "Invalid date/time.")

    if data.plant_id:
        if not plants.find_one({"_id": to_oid(data.plant_id), "user_id": user_id}):
            raise HTTPException(404, "Plant not found")

    doc = {
        "user_id": user_id,
        "title": data.title.strip(),
        "note": data.note.strip(),
        "due_at": due.astimezone(timezone.utc).isoformat(),
        "plant_id": data.plant_id or "",
        "repeat_days": data.repeat_days,
        "done": False,
        "created_at": now_utc().isoformat(),
    }
    result = reminders.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Reminder added"}


# ---------------------------------------------------------
# POST /reminders/{id}/done
#   water:<plant_id>  -> plant ko "paani diya" mark karo
#   custom            -> repeat ho to agli date par, warna done
# ---------------------------------------------------------
@router.post("/{rid}/done")
def complete_reminder(rid: str, user_id: str = Depends(get_current_user)):
    if rid.startswith(WATER_PREFIX):
        pid = rid[len(WATER_PREFIX):]
        result = plants.update_one(
            {"_id": to_oid(pid), "user_id": user_id},
            {"$set": {"last_watered": now_utc().isoformat()}},
        )
        if not result.matched_count:
            raise HTTPException(404, "Plant not found")
        return {"message": "Marked as watered"}

    doc = reminders.find_one({"_id": custom_oid(rid), "user_id": user_id})
    if not doc:
        raise HTTPException(404, "Reminder not found")

    repeat = int(doc.get("repeat_days") or 0)
    if repeat > 0:
        due = parse_dt(doc.get("due_at")) or now_utc()
        while due <= now_utc():
            due += timedelta(days=repeat)
        reminders.update_one({"_id": doc["_id"]}, {"$set": {"due_at": due.isoformat()}})
        return {"message": "Rescheduled", "next_due": due.isoformat()}

    reminders.update_one({"_id": doc["_id"]}, {"$set": {"done": True}})
    return {"message": "Done"}


@router.delete("/{rid}")
def delete_reminder(rid: str, user_id: str = Depends(get_current_user)):
    if rid.startswith(WATER_PREFIX):
        raise HTTPException(400, "Watering reminders are automatic. Change the plant's watering interval instead.")

    result = reminders.delete_one({"_id": custom_oid(rid), "user_id": user_id})
    if not result.deleted_count:
        raise HTTPException(404, "Reminder not found")
    return {"message": "Reminder deleted"}
