import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGODB_URL", "mongodb://127.0.0.1:27017"))
db = client[os.getenv("DB_NAME", "plantcare_ai")]

users = db["users"]
plants = db["plants"]
diagnoses = db["diagnoses"]
