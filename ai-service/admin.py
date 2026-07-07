import os
import sys
import argparse
import hashlib

# Setup Django environment so we can import from our apps
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "playmates_backend.settings")

try:
    import django
    django.setup()
except Exception as e:
    print(f"Error setting up Django: {e}")
    sys.exit(1)

from api.db import (
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

from api.views import (
    SEED_VENUES,
    SEED_PLAYERS,
    SEED_TEAMS,
    FALLBACK_USERS
)

COLLECTIONS = {
    "venues": venues_collection,
    "bookings": bookings_collection,
    "players": players_collection,
    "teams": teams_collection,
    "connects": connects_collection,
    "joins": joins_collection,
    "matches": matches_collection,
    "threads": threads_collection,
    "users": users_collection
}

def show_status():
    print("\n=== MongoDB Collection Status ===")
    for name, col in COLLECTIONS.items():
        try:
            count = col.count_documents({})
            print(f"  {name:<12} : {count} documents")
        except Exception as e:
            print(f"  {name:<12} : Error ({e})")
    print("=================================\n")

def clear_db():
    print("\n=== Clearing MongoDB Database ===")
    for name, col in COLLECTIONS.items():
        try:
            res = col.delete_many({})
            print(f"  Cleared {name:<12} : Deleted {res.deleted_count} documents")
        except Exception as e:
            print(f"  Error clearing {name:<12} : {e}")
    print("=================================\n")

def seed_db():
    print("\n=== Seeding MongoDB Database ===")
    
    # 1. Seed Venues
    try:
        if venues_collection.count_documents({}) == 0:
            res = venues_collection.insert_many(SEED_VENUES)
            print(f"  Seeded 'venues'      : {len(res.inserted_ids)} documents")
        else:
            print("  Skipped 'venues'      : already has documents")
    except Exception as e:
        print(f"  Error seeding 'venues': {e}")
        
    # 2. Seed Players
    try:
        if players_collection.count_documents({}) == 0:
            res = players_collection.insert_many(SEED_PLAYERS)
            print(f"  Seeded 'players'     : {len(res.inserted_ids)} documents")
        else:
            print("  Skipped 'players'     : already has documents")
    except Exception as e:
        print(f"  Error seeding 'players': {e}")

    # 3. Seed Teams
    try:
        if teams_collection.count_documents({}) == 0:
            res = teams_collection.insert_many(SEED_TEAMS)
            print(f"  Seeded 'teams'       : {len(res.inserted_ids)} documents")
        else:
            print("  Skipped 'teams'       : already has documents")
    except Exception as e:
        print(f"  Error seeding 'teams': {e}")

    # 4. Seed Users
    try:
        if users_collection.count_documents({}) == 0:
            res = users_collection.insert_many(FALLBACK_USERS)
            print(f"  Seeded 'users'       : {len(res.inserted_ids)} documents")
        else:
            print("  Skipped 'users'       : already has documents")
    except Exception as e:
        print(f"  Error seeding 'users': {e}")
        
    print("=================================\n")

def reset_db():
    clear_db()
    seed_db()

def show_collection(collection_name):
    if collection_name not in COLLECTIONS:
        print(f"Error: Collection '{collection_name}' not found. Choose from: {', '.join(COLLECTIONS.keys())}")
        return
    
    col = COLLECTIONS[collection_name]
    print(f"\n=== Documents in '{collection_name}' ===")
    try:
        count = 0
        for doc in col.find():
            count += 1
            if "_id" in doc:
                doc["_id"] = str(doc["_id"])
            print(doc)
        if count == 0:
            print("  (Collection is empty)")
    except Exception as e:
        print(f"  Error reading collection: {e}")
    print("========================================\n")

def create_superuser(username, password, name, email, phone, sport):
    # Compute password hash
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    # Check if user already exists
    if users_collection.find_one({"username": username}):
        # Update existing user's password and details
        users_collection.update_one(
            {"username": username},
            {"$set": {
                "password_hash": password_hash,
                "name": name,
                "email": email,
                "phone": phone,
                "sport": sport
            }}
        )
        print(f"Updated existing user '{username}' credentials successfully.")
    else:
        # Insert new user
        users_collection.insert_one({
            "username": username,
            "password_hash": password_hash,
            "name": name,
            "email": email,
            "phone": phone,
            "sport": sport
        })
        print(f"Created new superuser '{username}' successfully.")

def main():
    parser = argparse.ArgumentParser(description="MongoDB CLI helper for PlayMates Ahmedabad app")
    subparsers = parser.add_subparsers(dest="command", help="Admin commands")

    # Status command
    subparsers.add_parser("status", help="Show the document count in each collection")

    # Seed command
    subparsers.add_parser("seed", help="Seed default data into MongoDB")

    # Clear command
    subparsers.add_parser("clear", help="Clear all documents from the database")

    # Reset command
    subparsers.add_parser("reset", help="Clear all documents and seed default data")

    # Show command
    show_parser = subparsers.add_parser("show", help="List all documents in a specific collection")
    show_parser.add_argument("collection", choices=list(COLLECTIONS.keys()), help="Name of the collection to show")

    # Createsuperuser command
    csu_parser = subparsers.add_parser("createsuperuser", help="Create or update a superuser/admin account in MongoDB")
    csu_parser.add_argument("--username", default="admin", help="Username (default: admin)")
    csu_parser.add_argument("--password", default="admin", help="Password (default: admin)")
    csu_parser.add_argument("--name", default="System Administrator", help="Display Name (default: System Administrator)")
    csu_parser.add_argument("--email", default="admin@playmates.com", help="Email (default: admin@playmates.com)")
    csu_parser.add_argument("--phone", default="+91 00000 00000", help="Phone (default: +91 00000 00000)")
    csu_parser.add_argument("--sport", default="pickleball", help="Sport (default: pickleball)")

    args = parser.parse_args()

    if args.command == "status":
        show_status()
    elif args.command == "seed":
        seed_db()
    elif args.command == "clear":
        clear_db()
    elif args.command == "reset":
        reset_db()
    elif args.command == "show":
        show_collection(args.collection)
    elif args.command == "createsuperuser":
        create_superuser(args.username, args.password, args.name, args.email, args.phone, args.sport)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
