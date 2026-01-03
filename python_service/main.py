from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from bson import ObjectId
from typing import Optional

app = FastAPI()

MONGO_URI = "mongodb://localhost:27017/gametracker"
client = AsyncIOMotorClient(MONGO_URI)
db = client["gametracker"]
usergames_collection = db["usergames"]
games_collection = db["games"]

class Analytics(BaseModel):
    total_hours: int
    average_rating: float
    games_count: int

@app.get("/analytics/user/{user_id}", response_model=Analytics)
async def get_user_analytics(
    user_id: str,
    genre: Optional[str] = None,
    platform: Optional[str] = None
):
    try:
        user_oid = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="User ID inválido")

    pipeline = [
        {"$match": {"userId": user_oid}},
        {
            "$lookup": {
                "from": "games",
                "localField": "gameId",
                "foreignField": "_id",
                "as": "game"
            }
        },
        {"$unwind": "$game"}
    ]

    user_games = await usergames_collection.aggregate(pipeline).to_list(length=None)

    if genre:
        user_games = [ug for ug in user_games if (isinstance(ug["game"]["genre"], list) and genre in ug["game"]["genre"]) or ug["game"]["genre"] == genre]
    if platform:
        user_games = [ug for ug in user_games if (isinstance(ug["game"]["platform"], list) and platform in ug["game"]["platform"]) or ug["game"]["platform"] == platform]

    if not user_games:
        return Analytics(total_hours=0, average_rating=0, games_count=0)

    total_hours = sum(game.get("hoursPlayed", 0) for game in user_games)
    average_rating = sum(game.get("rating", 0) for game in user_games) / len(user_games)
    games_count = len(user_games)

    return Analytics(total_hours=total_hours, average_rating=average_rating, games_count=games_count)
