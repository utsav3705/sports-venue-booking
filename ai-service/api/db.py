from pymongo import MongoClient
import os

# Get connection URI from environment variable, or fallback to default localhost port 27017
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

# Initiate PyMongo Client with 1.5s server selection timeout for robust error fallback
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)


# Select database name
db = client["playmates_db"]

# Collection handles for PlayMates Ahmedabad app features
venues_collection = db["venues"]      # Sports turfs list
bookings_collection = db["bookings"]  # Turf booking slots
players_collection = db["players"]    # Player profiles
teams_collection = db["teams"]        # Registered clubs/teams
connects_collection = db["connects"]  # Player-to-Player connection requests
joins_collection = db["joins"]        # Team-joining request applications
matches_collection = db["matches"]    # Match challenge invites
threads_collection = db["threads"]    # Chat message threads history
users_collection = db["users"]        # User authentication profiles
