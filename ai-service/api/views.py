import json
import hashlib
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId
from bson.errors import InvalidId
from .db import (
    venues_collection,
    bookings_collection,
    players_collection,
    teams_collection,
    connects_collection,
    joins_collection,
    matches_collection,
    threads_collection,
    users_collection
)

# --- AUTOMATIC DB SEED DATA ---
SEED_VENUES = [
    {
        "name": "Arena Cricket Hub",
        "sport": "cricket",
        "area": "Satellite",
        "address": "Near Shivranjani Cross Road, Satellite, Ahmedabad",
        "pricePerHour": 800,
        "rating": 4.7,
        "reviewCount": 124,
        "image": "/venues/cricket-turf.png",
        "amenities": ["Floodlights", "Parking", "Changing Room", "Canteen", "First Aid"],
        "openTime": "06:00",
        "closeTime": "23:00",
        "availableSlots": ["06:00", "07:00", "08:00", "16:00", "17:00", "19:00", "20:00", "21:00"]
    },
    {
        "name": "GreenField Cricket Turf",
        "sport": "cricket",
        "area": "Bopal",
        "address": "Bopal-Ghuma Road, Bopal, Ahmedabad",
        "pricePerHour": 700,
        "rating": 4.5,
        "reviewCount": 89,
        "image": "/venues/cricket-turf.png",
        "amenities": ["Floodlights", "Parking", "Changing Room", "Drinking Water"],
        "openTime": "05:30",
        "closeTime": "22:00",
        "availableSlots": ["05:30", "06:00", "07:00", "08:00", "18:00", "19:00", "20:00"]
    },
    {
        "name": "ProKick Football Arena",
        "sport": "football",
        "area": "Prahlad Nagar",
        "address": "Prahlad Nagar Garden Road, Ahmedabad",
        "pricePerHour": 1200,
        "rating": 4.8,
        "reviewCount": 203,
        "image": "/venues/football-turf.png",
        "amenities": ["Floodlights", "Valet Parking", "Changing Room", "Canteen", "Shower", "CCTV"],
        "openTime": "06:00",
        "closeTime": "24:00",
        "availableSlots": ["06:00", "07:00", "09:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]
    },
    {
        "name": "Goal Zone Football Ground",
        "sport": "football",
        "area": "Vastrapur",
        "address": "Vastrapur Lake Road, Vastrapur, Ahmedabad",
        "pricePerHour": 1000,
        "rating": 4.4,
        "reviewCount": 156,
        "image": "/venues/football-turf.png",
        "amenities": ["Floodlights", "Parking", "Changing Room", "Canteen"],
        "openTime": "05:00",
        "closeTime": "23:00",
        "availableSlots": ["05:00", "06:00", "07:00", "18:00", "19:00", "20:00", "21:00"]
    },
    {
        "name": "PickleZone Courts",
        "sport": "pickleball",
        "area": "Thaltej",
        "address": "Thaltej Cross Road, Near S.G. Highway, Ahmedabad",
        "pricePerHour": 600,
        "rating": 4.9,
        "reviewCount": 67,
        "image": "/venues/pickleball-court.png",
        "amenities": ["Outdoor Courts", "Parking", "Locker Room", "Equipment Rental", "Coach Available"],
        "openTime": "06:00",
        "closeTime": "22:00",
        "availableSlots": ["06:00", "07:00", "08:00", "09:00", "16:00", "17:00", "18:00", "19:00", "20:00"]
    },
    {
        "name": "AhmedaBall Pickleball Club",
        "sport": "pickleball",
        "area": "Bodakdev",
        "address": "Judges Bungalow Road, Bodakdev, Ahmedabad",
        "pricePerHour": 550,
        "rating": 4.6,
        "reviewCount": 43,
        "image": "/venues/pickleball-court.png",
        "amenities": ["Indoor Courts", "Parking", "Changing Room", "Equipment Rental"],
        "openTime": "07:00",
        "closeTime": "21:00",
        "availableSlots": ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"]
    },
    {
        "name": "Padel Pro Ahmedabad",
        "sport": "padel",
        "area": "SG Highway",
        "address": "Sola Road, Near S.G. Highway, Ahmedabad",
        "pricePerHour": 1500,
        "rating": 4.9,
        "reviewCount": 38,
        "image": "/venues/padel-court.png",
        "amenities": ["Glass Courts", "AC Lounge", "Pro Shop", "Coaching", "Parking", "Cafeteria"],
        "openTime": "06:00",
        "closeTime": "23:00",
        "availableSlots": ["06:00", "07:00", "09:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"]
    },
    {
        "name": "Navkar Padel Club",
        "sport": "padel",
        "area": "Chandkheda",
        "address": "Chandkheda Char Rasta, Gandhinagar Highway, Ahmedabad",
        "pricePerHour": 1200,
        "rating": 4.5,
        "reviewCount": 29,
        "image": "/venues/padel-court.png",
        "amenities": ["Glass Courts", "Parking", "Changing Room", "Equipment Rental"],
        "openTime": "05:30",
        "closeTime": "22:00",
        "availableSlots": ["05:30", "06:00", "07:00", "08:00", "18:00", "19:00", "20:00", "21:00"]
    }
]

SEED_PLAYERS = [
    {"name": "Riya Shah", "sport": "pickleball", "position": "All-rounder", "area": "Thaltej", "level": "Intermediate", "avatar": "RS"},
    {"name": "Priya Desai", "sport": "padel", "position": "Doubles", "area": "SG Highway", "level": "Pro", "avatar": "PD"},
    {"name": "Rohan Bhatt", "sport": "padel", "position": "Singles", "area": "Bodakdev", "level": "Beginner", "avatar": "RB"},
    {"name": "Siddhi Kapoor", "sport": "pickleball", "position": "Singles & Doubles", "area": "Navrangpura", "level": "Advanced", "avatar": "SK"}
]

SEED_TEAMS = [
    {"name": "Satellite Strikers", "sport": "cricket", "area": "Satellite", "level": "Advanced", "members": 6, "maxMembers": 8, "avatar": "SS", "captain": "Arjun Mehta", "description": "Satellite Cricket Club. Looking for 2 Batsmen.", "wins": 23, "losses": 7, "lookingFor": "2 Batsmen"},
    {"name": "Bopal Blasters", "sport": "football", "area": "Bopal", "level": "Intermediate", "members": 8, "maxMembers": 11, "avatar": "BB", "captain": "Dev Patel", "description": "Fun football team playing on weekends.", "wins": 15, "losses": 12, "lookingFor": "Defender and Goalkeeper"}
]

# --- IN-MEMORY OFFLINE FALLBACKS ---
FALLBACK_BOOKINGS = [
    {
        "id": "seed-b1",
        "venueName": "ProKick Football Arena",
        "sport": "football",
        "area": "Prahlad Nagar",
        "date": "Sat, 5 Jul",
        "slots": ["19:00", "20:00"],
        "amount": 2400,
        "userName": "Dev Patel",
        "userPhone": "+91 98765 43210",
        "username": "dev"
    }
]
FALLBACK_PLAYERS = [{**p, "id": f"seed-p{i+1}"} for i, p in enumerate(SEED_PLAYERS)]
FALLBACK_TEAMS = [{**t, "id": f"seed-t{i+1}"} for i, t in enumerate(SEED_TEAMS)]
FALLBACK_CONNECTS = [
    {"id": "seed-c1", "playerName": "Dev Patel", "playerAvatar": "DP", "sport": "football", "area": "Prahlad Nagar", "status": "accepted", "username": "dev"},
    {"id": "seed-c2", "playerName": "Karan Joshi", "playerAvatar": "KJ", "sport": "cricket", "area": "Bopal", "status": "pending", "username": "dev"}
]
FALLBACK_JOINS = [
    {"id": "seed-j1", "teamName": "Satellite Strikers", "teamAvatar": "SS", "sport": "cricket", "status": "rejected", "username": "dev"}
]
FALLBACK_MATCHES = []
FALLBACK_THREADS = []
FALLBACK_USERS = [
    # Default user account: dev / dev
    {
        "username": "dev",
        "password_hash": "12d6a5755e7a39d80112b32bb9fb3d37a1f592fb86c75f3a0937b2d56a5c2d33", # sha256("dev")
        "name": "Dev Patel",
        "email": "dev@playmates.com",
        "phone": "+91 99999 88888",
        "sport": "football"
    },
    # Default administrator account: admin / admin
    {
        "username": "admin",
        "password_hash": "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", # sha256("admin")
        "name": "System Administrator",
        "email": "admin@playmates.com",
        "phone": "+91 00000 00000",
        "sport": "pickleball"
    }
]

# --- DOCUMENT PARSING HELPERS ---

def venue_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "sport": doc["sport"],
        "area": doc["area"],
        "address": doc["address"],
        "pricePerHour": doc["pricePerHour"],
        "rating": doc["rating"],
        "reviewCount": doc["reviewCount"],
        "image": doc["image"],
        "amenities": doc["amenities"],
        "openTime": doc["openTime"],
        "closeTime": doc["closeTime"],
        "availableSlots": doc["availableSlots"]
    }

def booking_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "venueName": doc["venueName"],
        "sport": doc["sport"],
        "area": doc["area"],
        "date": doc["date"],
        "slots": doc["slots"],
        "amount": doc["amount"],
        "userName": doc.get("userName", ""),
        "userPhone": doc.get("userPhone", ""),
        "username": doc.get("username", "")
    }

def player_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "sport": doc["sport"],
        "position": doc["position"],
        "area": doc["area"],
        "level": doc["level"],
        "avatar": doc["avatar"]
    }

def team_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "sport": doc["sport"],
        "area": doc["area"],
        "level": doc["level"],
        "members": doc["members"],
        "maxMembers": doc["maxMembers"],
        "avatar": doc["avatar"],
        "captain": doc["captain"],
        "description": doc["description"],
        "wins": doc["wins"],
        "losses": doc["losses"],
        "lookingFor": doc["lookingFor"]
    }

def connect_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "playerName": doc["playerName"],
        "playerAvatar": doc["playerAvatar"],
        "sport": doc["sport"],
        "area": doc["area"],
        "status": doc["status"],
        "username": doc.get("username", "")
    }

def join_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "teamName": doc["teamName"],
        "teamAvatar": doc["teamAvatar"],
        "sport": doc["sport"],
        "status": doc["status"],
        "username": doc.get("username", "")
    }

def match_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "fromTeam": doc["fromTeam"],
        "toTeam": doc["toTeam"],
        "toAvatar": doc["toAvatar"],
        "sport": doc["sport"],
        "matchType": doc["matchType"],
        "stake": doc["stake"],
        "status": doc["status"],
        "username": doc.get("username", "")
    }

def thread_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "playerName": doc["playerName"],
        "playerAvatar": doc["playerAvatar"],
        "sport": doc["sport"],
        "messages": doc["messages"],
        "username": doc.get("username", "")
    }

# --- REST VIEWS IMPLEMENTATIONS (WITH ROBUST OFFLINE FALLBACKS) ---

# 1. VENUES LIST
@csrf_exempt
def venues_list(request):
    if request.method == "GET":
        try:
            if venues_collection.count_documents({}) == 0:
                venues_collection.insert_many(SEED_VENUES)
            venues = [venue_helper(d) for d in venues_collection.find()]
            return JsonResponse(venues, safe=False)
        except Exception:
            mock_venues = [{**v, "id": f"fallback-v{i}"} for i, v in enumerate(SEED_VENUES)]
            return JsonResponse(mock_venues, safe=False)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 2. BOOKINGS (GET / POST)
@csrf_exempt
def bookings_list(request):
    username = request.GET.get("username")
    
    if request.method == "GET":
        try:
            # Scoped data bypass for admin
            query = {} if username == "admin" else {"username": username} if username else {}
            bookings = [booking_helper(d) for d in bookings_collection.find(query)]
            return JsonResponse(bookings, safe=False)
        except Exception:
            # Fallback filter bypass for admin
            filtered = FALLBACK_BOOKINGS if username == "admin" else [b for b in FALLBACK_BOOKINGS if not username or b.get("username") == username]
            return JsonResponse(filtered, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        new_doc = {
            "venueName": data.get("venueName"),
            "sport": data.get("sport"),
            "area": data.get("area"),
            "date": data.get("date"),
            "slots": data.get("slots", []),
            "amount": int(data.get("amount", 0)),
            "userName": data.get("userName", ""),
            "userPhone": data.get("userPhone", ""),
            "username": data.get("username")
        }
        try:
            res = bookings_collection.insert_one(new_doc)
            created = bookings_collection.find_one({"_id": res.inserted_id})
            return JsonResponse(booking_helper(created), status=201)
        except Exception:
            new_doc["id"] = f"fallback-{uuid.uuid4().hex[:8]}"
            FALLBACK_BOOKINGS.append(new_doc)
            return JsonResponse(new_doc, status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

# BOOKINGS DETAIL (DELETE)
@csrf_exempt
def booking_detail(request, booking_id):
    if request.method == "DELETE":
        try:
            obj_id = ObjectId(booking_id)
            result = bookings_collection.delete_one({"_id": obj_id})
            if result.deleted_count == 0:
                return JsonResponse({"error": "Booking not found"}, status=404)
            return JsonResponse({"message": "Booking deleted successfully"}, status=200)
        except Exception:
            global FALLBACK_BOOKINGS
            initial_len = len(FALLBACK_BOOKINGS)
            FALLBACK_BOOKINGS = [b for b in FALLBACK_BOOKINGS if b.get("id") != booking_id]
            if len(FALLBACK_BOOKINGS) == initial_len:
                return JsonResponse({"error": "Booking not found"}, status=404)
            return JsonResponse({"message": "Booking deleted successfully"}, status=200)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 3. PLAYERS (GET / POST)
@csrf_exempt
def players_list(request):
    if request.method == "GET":
        try:
            if players_collection.count_documents({}) == 0:
                players_collection.insert_many(SEED_PLAYERS)
            players = [player_helper(d) for d in players_collection.find()]
            return JsonResponse(players, safe=False)
        except Exception:
            return JsonResponse(FALLBACK_PLAYERS, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        new_doc = {
            "name": data.get("name"),
            "sport": data.get("sport"),
            "position": data.get("position"),
            "area": data.get("area"),
            "level": data.get("level"),
            "avatar": data.get("avatar")
        }
        try:
            res = players_collection.insert_one(new_doc)
            created = players_collection.find_one({"_id": res.inserted_id})
            return JsonResponse(player_helper(created), status=201)
        except Exception:
            new_doc["id"] = f"fallback-{uuid.uuid4().hex[:8]}"
            FALLBACK_PLAYERS.append(new_doc)
            return JsonResponse(new_doc, status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 4. TEAMS (GET / POST)
@csrf_exempt
def teams_list(request):
    if request.method == "GET":
        try:
            if teams_collection.count_documents({}) == 0:
                teams_collection.insert_many(SEED_TEAMS)
            teams = [team_helper(d) for d in teams_collection.find()]
            return JsonResponse(teams, safe=False)
        except Exception:
            return JsonResponse(FALLBACK_TEAMS, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        new_doc = {
            "name": data.get("name"),
            "sport": data.get("sport"),
            "area": data.get("area"),
            "level": data.get("level"),
            "members": int(data.get("members", 1)),
            "maxMembers": int(data.get("maxMembers", 11)),
            "avatar": data.get("avatar"),
            "captain": data.get("captain"),
            "description": data.get("description"),
            "wins": int(data.get("wins", 0)),
            "losses": int(data.get("losses", 0)),
            "lookingFor": data.get("lookingFor", "")
        }
        try:
            res = teams_collection.insert_one(new_doc)
            created = teams_collection.find_one({"_id": res.inserted_id})
            return JsonResponse(team_helper(created), status=201)
        except Exception:
            new_doc["id"] = f"fallback-{uuid.uuid4().hex[:8]}"
            FALLBACK_TEAMS.append(new_doc)
            return JsonResponse(new_doc, status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 5. CONNECTS (GET / POST)
@csrf_exempt
def connects_list(request):
    username = request.GET.get("username")
    
    if request.method == "GET":
        try:
            query = {} if username == "admin" else {"username": username} if username else {}
            connects = [connect_helper(d) for d in connects_collection.find(query)]
            return JsonResponse(connects, safe=False)
        except Exception:
            filtered = FALLBACK_CONNECTS if username == "admin" else [c for c in FALLBACK_CONNECTS if not username or c.get("username") == username]
            return JsonResponse(filtered, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        new_doc = {
            "playerName": data.get("playerName"),
            "playerAvatar": data.get("playerAvatar"),
            "sport": data.get("sport"),
            "area": data.get("area"),
            "status": "pending",
            "username": data.get("username")
        }
        try:
            res = connects_collection.insert_one(new_doc)
            created = connects_collection.find_one({"_id": res.inserted_id})
            return JsonResponse(connect_helper(created), status=201)
        except Exception:
            new_doc["id"] = f"fallback-{uuid.uuid4().hex[:8]}"
            FALLBACK_CONNECTS.append(new_doc)
            return JsonResponse(new_doc, status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 6. JOINS (GET / POST)
@csrf_exempt
def joins_list(request):
    username = request.GET.get("username")
    
    if request.method == "GET":
        try:
            query = {} if username == "admin" else {"username": username} if username else {}
            joins = [join_helper(d) for d in joins_collection.find(query)]
            return JsonResponse(joins, safe=False)
        except Exception:
            filtered = FALLBACK_JOINS if username == "admin" else [j for j in FALLBACK_JOINS if not username or j.get("username") == username]
            return JsonResponse(filtered, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        new_doc = {
            "teamName": data.get("teamName"),
            "teamAvatar": data.get("teamAvatar"),
            "sport": data.get("sport"),
            "status": "pending",
            "username": data.get("username")
        }
        try:
            res = joins_collection.insert_one(new_doc)
            created = joins_collection.find_one({"_id": res.inserted_id})
            return JsonResponse(join_helper(created), status=201)
        except Exception:
            new_doc["id"] = f"fallback-{uuid.uuid4().hex[:8]}"
            FALLBACK_JOINS.append(new_doc)
            return JsonResponse(new_doc, status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 7. MATCHES (GET / POST)
@csrf_exempt
def matches_list(request):
    username = request.GET.get("username")
    
    if request.method == "GET":
        try:
            query = {} if username == "admin" else {"username": username} if username else {}
            matches = [match_helper(d) for d in matches_collection.find(query)]
            return JsonResponse(matches, safe=False)
        except Exception:
            filtered = FALLBACK_MATCHES if username == "admin" else [m for m in FALLBACK_MATCHES if not username or m.get("username") == username]
            return JsonResponse(filtered, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        new_doc = {
            "fromTeam": data.get("fromTeam"),
            "toTeam": data.get("toTeam"),
            "toAvatar": data.get("toAvatar"),
            "sport": data.get("sport"),
            "matchType": data.get("matchType"),
            "stake": int(data.get("stake", 0)),
            "status": "pending",
            "username": data.get("username")
        }
        try:
            res = matches_collection.insert_one(new_doc)
            created = matches_collection.find_one({"_id": res.inserted_id})
            return JsonResponse(match_helper(created), status=201)
        except Exception:
            new_doc["id"] = f"fallback-{uuid.uuid4().hex[:8]}"
            FALLBACK_MATCHES.append(new_doc)
            return JsonResponse(new_doc, status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 8. THREADS (GET / POST)
@csrf_exempt
def threads_list(request):
    username = request.GET.get("username")
    
    if request.method == "GET":
        try:
            query = {} if username == "admin" else {"username": username} if username else {}
            threads = [thread_helper(d) for d in threads_collection.find(query)]
            return JsonResponse(threads, safe=False)
        except Exception:
            filtered = FALLBACK_THREADS if username == "admin" else [t for t in FALLBACK_THREADS if not username or t.get("username") == username]
            return JsonResponse(filtered, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        player_name = data.get("playerName")
        player_avatar = data.get("playerAvatar")
        sport = data.get("sport")
        message_text = data.get("messageText")
        user_name_val = data.get("username")
        
        my_msg = {"from": "me", "text": message_text, "time": "Just now"}
        
        try:
            thread = threads_collection.find_one({"playerName": player_name, "username": user_name_val})
            if thread:
                threads_collection.update_one(
                    {"_id": thread["_id"]},
                    {"$push": {"messages": my_msg}}
                )
                updated = threads_collection.find_one({"_id": thread["_id"]})
            else:
                new_thread = {
                    "playerName": player_name,
                    "playerAvatar": player_avatar,
                    "sport": sport,
                    "messages": [my_msg],
                    "username": user_name_val
                }
                res = threads_collection.insert_one(new_thread)
                updated = threads_collection.find_one({"_id": res.inserted_id})
            return JsonResponse(thread_helper(updated), status=201)
        except Exception:
            existing = next((t for t in FALLBACK_THREADS if t["playerName"] == player_name and t.get("username") == user_name_val), None)
            if existing:
                existing["messages"].append(my_msg)
                return JsonResponse(existing, status=201)
            else:
                new_t = {
                    "id": f"fallback-{uuid.uuid4().hex[:8]}",
                    "playerName": player_name,
                    "playerAvatar": player_avatar,
                    "sport": sport,
                    "messages": [my_msg],
                    "username": user_name_val
                }
                FALLBACK_THREADS.append(new_t)
                return JsonResponse(new_t, status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 9. USER SIGNUP AUTH (POST)
@csrf_exempt
def auth_signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username", "").strip().lower()
            password = data.get("password", "")
            name = data.get("name", "").strip()
            phone = data.get("phone", "").strip()
            email = data.get("email", "").strip()
            sport = data.get("sport", "football")
            
            if not username or not password or not name or not phone or not email:
                return JsonResponse({"error": "All fields are required"}, status=400)
                
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            try:
                if users_collection.find_one({"username": username}):
                    return JsonResponse({"error": "Username already exists"}, status=400)
                
                users_collection.insert_one({
                    "username": username,
                    "password_hash": password_hash,
                    "name": name,
                    "phone": phone,
                    "email": email,
                    "sport": sport
                })
            except Exception:
                if any(u["username"] == username for u in FALLBACK_USERS):
                    return JsonResponse({"error": "Username already exists"}, status=400)
                
                FALLBACK_USERS.append({
                    "username": username,
                    "password_hash": password_hash,
                    "name": name,
                    "phone": phone,
                    "email": email,
                    "sport": sport
                })
            
            return JsonResponse({"success": True, "message": "Account created successfully!"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

# 10. USER LOGIN AUTH (POST)
@csrf_exempt
def auth_login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username", "").strip().lower()
            password = data.get("password", "")
            
            if not username or not password:
                return JsonResponse({"error": "Username and password are required"}, status=400)
                
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            try:
                user = users_collection.find_one({"username": username, "password_hash": password_hash})
                if not user:
                    return JsonResponse({"error": "Invalid username or password"}, status=400)
                
                token = f"mock-token-{str(user['_id'])}"
                return JsonResponse({
                    "token": token,
                    "username": user["username"],
                    "name": user["name"],
                    "email": user["email"],
                    "phone": user["phone"],
                    "sport": user.get("sport", "football")
                })
            except Exception:
                user = next((u for u in FALLBACK_USERS if u["username"] == username and u["password_hash"] == password_hash), None)
                if user:
                    return JsonResponse({
                        "token": f"mock-token-fallback-{username}",
                        "username": user["username"],
                        "name": user["name"],
                        "email": user["email"],
                        "phone": user["phone"],
                        "sport": user.get("sport", "football")
                    })
                
                # Reject credentials if not found in fallback users list
                return JsonResponse({"error": "Invalid username or password"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)
