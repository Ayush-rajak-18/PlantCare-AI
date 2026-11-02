"""
Image upload helpers (plant photos + profile avatars).

Photos backend/uploads/ folder mein save hoti hain:
    uploads/plants/<plant_id>.jpg
    uploads/avatars/<user_id>.jpg
Aur main.py unhe  /uploads/...  URL par serve karta hai.
"""
import time
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
PLANT_DIR = UPLOAD_DIR / "plants"
AVATAR_DIR = UPLOAD_DIR / "avatars"

for folder in (PLANT_DIR, AVATAR_DIR):
    folder.mkdir(parents=True, exist_ok=True)

MAX_BYTES = 8 * 1024 * 1024  # 8 MB


async def read_image(file: UploadFile) -> Image.Image:
    """Upload ko validate karke RGB image bana deta hai."""
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "Please upload an image file.")

    data = await file.read()

    if len(data) > MAX_BYTES:
        raise HTTPException(400, "Image must be smaller than 8 MB.")

    try:
        image = Image.open(BytesIO(data))
        image = ImageOps.exif_transpose(image)  # phone photo ki rotation theek karo
        return image.convert("RGB")
    except Exception:
        raise HTTPException(400, "This file is not a valid image.")


def _url(kind: str, name: str) -> str:
    # ?v= cache-buster: nayi photo lagane par browser purani na dikhaye
    return f"/uploads/{kind}/{name}.jpg?v={int(time.time())}"


def save_plant_photo(image: Image.Image, plant_id: str) -> str:
    image.thumbnail((900, 900))
    image.save(PLANT_DIR / f"{plant_id}.jpg", "JPEG", quality=85, optimize=True)
    return _url("plants", plant_id)


def save_avatar(image: Image.Image, user_id: str) -> str:
    square = ImageOps.fit(image, (256, 256))
    square.save(AVATAR_DIR / f"{user_id}.jpg", "JPEG", quality=88, optimize=True)
    return _url("avatars", user_id)


def delete_upload(url_path: str) -> None:
    """Stored URL (/uploads/...) se file hata deta hai. Folder ke bahar kuch delete nahi karta."""
    if not url_path:
        return
    relative = url_path.split("?")[0].replace("/uploads/", "", 1)
    target = (UPLOAD_DIR / relative).resolve()
    try:
        if UPLOAD_DIR.resolve() in target.parents and target.is_file():
            target.unlink()
    except OSError:
        pass
