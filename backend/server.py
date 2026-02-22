from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionCreate(BaseModel):
    session_id: str

class Ingredient(BaseModel):
    ingredient_id: str = Field(default_factory=lambda: f"ing_{uuid.uuid4().hex[:12]}")
    name: str
    quantity: str = "1"
    unit: str = ""
    category: str = "other"

class IngredientCreate(BaseModel):
    name: str
    quantity: str = "1"
    unit: str = ""
    category: str = "other"

class FamilyMember(BaseModel):
    member_id: str = Field(default_factory=lambda: f"mem_{uuid.uuid4().hex[:12]}")
    name: str
    dietary_restriction: str = "non-veg"  # veg, non-veg, vegan
    spice_tolerance: str = "medium"  # mild, medium, hot
    preferences: List[str] = []  # high-protein, low-carb, etc.

class FamilyMemberCreate(BaseModel):
    name: str
    dietary_restriction: str = "non-veg"
    spice_tolerance: str = "medium"
    preferences: List[str] = []

class MealQuery(BaseModel):
    query: str

class Recipe(BaseModel):
    name: str
    cuisine: str
    cooking_time: str
    servings: int
    ingredients_needed: List[dict]
    missing_ingredients: List[str]
    steps: List[str]
    dietary_info: str
    spice_level: str

# ===================== AUTH HELPERS =====================

async def get_current_user(request: Request) -> User:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

# ===================== AUTH ENDPOINTS =====================

@api_router.post("/auth/session")
async def create_session(session_data: SessionCreate, response: Response):
    """Exchange session_id from Emergent Auth for a session cookie"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_data.session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session ID")
            
            auth_data = resp.json()
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": auth_data["name"], "picture": auth_data.get("picture")}}
        )
    else:
        user_doc = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    session_token = auth_data.get("session_token", f"sess_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}

# ===================== PANTRY ENDPOINTS =====================

@api_router.get("/pantry")
async def get_pantry(user: User = Depends(get_current_user)):
    pantry = await db.pantry.find_one({"user_id": user.user_id}, {"_id": 0})
    if not pantry:
        return {"user_id": user.user_id, "ingredients": []}
    return pantry

@api_router.post("/pantry/ingredient")
async def add_ingredient(ingredient: IngredientCreate, user: User = Depends(get_current_user)):
    new_ingredient = Ingredient(**ingredient.model_dump())
    
    pantry = await db.pantry.find_one({"user_id": user.user_id})
    if not pantry:
        await db.pantry.insert_one({
            "user_id": user.user_id,
            "ingredients": [new_ingredient.model_dump()]
        })
    else:
        await db.pantry.update_one(
            {"user_id": user.user_id},
            {"$push": {"ingredients": new_ingredient.model_dump()}}
        )
    
    return new_ingredient.model_dump()

@api_router.put("/pantry/ingredient/{ingredient_id}")
async def update_ingredient(ingredient_id: str, ingredient: IngredientCreate, user: User = Depends(get_current_user)):
    result = await db.pantry.update_one(
        {"user_id": user.user_id, "ingredients.ingredient_id": ingredient_id},
        {"$set": {
            "ingredients.$.name": ingredient.name,
            "ingredients.$.quantity": ingredient.quantity,
            "ingredients.$.unit": ingredient.unit,
            "ingredients.$.category": ingredient.category
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return {"message": "Updated", "ingredient_id": ingredient_id}

@api_router.delete("/pantry/ingredient/{ingredient_id}")
async def delete_ingredient(ingredient_id: str, user: User = Depends(get_current_user)):
    result = await db.pantry.update_one(
        {"user_id": user.user_id},
        {"$pull": {"ingredients": {"ingredient_id": ingredient_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return {"message": "Deleted"}

# ===================== FAMILY ENDPOINTS =====================

@api_router.get("/family")
async def get_family(user: User = Depends(get_current_user)):
    family = await db.family.find_one({"user_id": user.user_id}, {"_id": 0})
    if not family:
        return {"user_id": user.user_id, "members": []}
    return family

@api_router.post("/family/member")
async def add_family_member(member: FamilyMemberCreate, user: User = Depends(get_current_user)):
    new_member = FamilyMember(**member.model_dump())
    
    family = await db.family.find_one({"user_id": user.user_id})
    if not family:
        await db.family.insert_one({
            "user_id": user.user_id,
            "members": [new_member.model_dump()]
        })
    else:
        await db.family.update_one(
            {"user_id": user.user_id},
            {"$push": {"members": new_member.model_dump()}}
        )
    
    return new_member.model_dump()

@api_router.put("/family/member/{member_id}")
async def update_family_member(member_id: str, member: FamilyMemberCreate, user: User = Depends(get_current_user)):
    result = await db.family.update_one(
        {"user_id": user.user_id, "members.member_id": member_id},
        {"$set": {
            "members.$.name": member.name,
            "members.$.dietary_restriction": member.dietary_restriction,
            "members.$.spice_tolerance": member.spice_tolerance,
            "members.$.preferences": member.preferences
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Updated", "member_id": member_id}

@api_router.delete("/family/member/{member_id}")
async def delete_family_member(member_id: str, user: User = Depends(get_current_user)):
    result = await db.family.update_one(
        {"user_id": user.user_id},
        {"$pull": {"members": {"member_id": member_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Deleted"}

# ===================== AI ENDPOINTS =====================

@api_router.post("/ai/detect-ingredients")
async def detect_ingredients(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    """Detect ingredients from an uploaded grocery photo"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    content = await file.read()
    base64_image = base64.b64encode(content).decode("utf-8")
    
    chat = LlmChat(
        api_key=api_key,
        session_id=f"detect_{user.user_id}_{uuid.uuid4().hex[:8]}",
        system_message="""You are a grocery detection assistant. Analyze the image and identify all visible food ingredients.
Return ONLY a JSON array of detected ingredients with their estimated quantities. Format:
[{"name": "ingredient name", "quantity": "estimated amount", "unit": "unit like kg, pcs, etc", "category": "vegetables/fruits/dairy/meat/grains/spices/other"}]
Be specific with Indian ingredients like dal, atta, paneer, etc."""
    ).with_model("openai", "gpt-5.2-mini")
    
    image_content = ImageContent(image_base64=base64_image)
    user_message = UserMessage(
        text="Identify all food ingredients in this grocery photo. Return only the JSON array.",
        image_contents=[image_content]
    )
    
    response = await chat.send_message(user_message)
    
    try:
        import json
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
        ingredients = json.loads(clean_response.strip())
        return {"ingredients": ingredients}
    except:
        return {"ingredients": [], "raw_response": response}

@api_router.post("/ai/suggest-recipes")
async def suggest_recipes(query: MealQuery, user: User = Depends(get_current_user)):
    """Get recipe suggestions based on pantry, family preferences, and user query"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    pantry = await db.pantry.find_one({"user_id": user.user_id}, {"_id": 0})
    family = await db.family.find_one({"user_id": user.user_id}, {"_id": 0})
    
    ingredients_list = []
    if pantry and pantry.get("ingredients"):
        ingredients_list = [f"{i['name']} ({i['quantity']} {i['unit']})" for i in pantry["ingredients"]]
    
    family_prefs = []
    if family and family.get("members"):
        for m in family["members"]:
            prefs = f"{m['name']}: {m['dietary_restriction']}, spice: {m['spice_tolerance']}"
            if m.get("preferences"):
                prefs += f", wants: {', '.join(m['preferences'])}"
            family_prefs.append(prefs)
    
    prompt = f"""Based on this context, suggest 3 recipes:

USER REQUEST: {query.query}

AVAILABLE INGREDIENTS:
{chr(10).join(ingredients_list) if ingredients_list else "No ingredients in pantry yet"}

FAMILY PREFERENCES:
{chr(10).join(family_prefs) if family_prefs else "No family profiles set"}

Return ONLY a JSON array with exactly 3 recipes. Each recipe must have:
- name: dish name
- cuisine: "Indian" or "International"
- cooking_time: e.g., "30 mins"
- servings: number
- ingredients_needed: [{{"name": "ingredient", "quantity": "amount"}}]
- missing_ingredients: ["ingredient1", "ingredient2"] (items not in pantry)
- steps: ["step 1", "step 2", ...]
- dietary_info: "Vegetarian", "Non-Vegetarian", or "Vegan"
- spice_level: "Mild", "Medium", or "Hot"

Focus on Indian cuisine but include popular international dishes too. Consider all family member preferences."""

    chat = LlmChat(
        api_key=api_key,
        session_id=f"recipe_{user.user_id}_{uuid.uuid4().hex[:8]}",
        system_message="You are a helpful Indian home cooking expert. Return only valid JSON arrays."
    ).with_model("openai", "gpt-5.2-mini")
    
    response = await chat.send_message(UserMessage(text=prompt))
    
    try:
        import json
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
        recipes = json.loads(clean_response.strip())
        return {"recipes": recipes}
    except:
        return {"recipes": [], "raw_response": response}

# ===================== ROOT ENDPOINT =====================

@api_router.get("/")
async def root():
    return {"message": "SmartMeal API", "version": "1.0.0"}

# Include the router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
