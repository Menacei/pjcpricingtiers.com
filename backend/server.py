from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ContactForm(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    service: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AffiliateLink(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    partner_name: str
    link: str
    clicks: int = 0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AffiliateLinkCreate(BaseModel):
    partner_name: str
    link: str

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    package_id: str
    amount: float
    currency: str = "usd"
    session_id: Optional[str] = None
    payment_status: str = "pending"
    status: str = "initiated"
    metadata: Optional[Dict[str, str]] = None
    customer_email: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CheckoutRequest(BaseModel):
    package_id: str
    origin_url: str
    customer_email: Optional[str] = None

class PaymentStatusRequest(BaseModel):
    session_id: str

# Fixed pricing packages (SECURITY: Never allow frontend to set prices)
PACKAGES = {
    "essential": 599.99,
    "professional": 2999.99,
    "enterprise": 10000.0
}

# Existing routes
@api_router.get("/")
async def root():
    return {"message": "PJC Web Designs API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    status_data = status_obj.dict()
    status_data['timestamp'] = status_data['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(status_data)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    for check in status_checks:
        if isinstance(check.get('timestamp'), str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return [StatusCheck(**status_check) for status_check in status_checks]

# Chat endpoint
@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Initialize the chat with Emergent LLM key
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=session_id,
            system_message="You are a helpful AI assistant for PJC Web Designs, a modern web design company. You help potential clients understand our services, pricing, and answer questions about web design, development, and digital solutions. Be friendly, professional, and knowledgeable about web technologies."
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=request.message)
        
        # Get response from AI
        response = await chat.send_message(user_message)
        
        # Store chat in database
        chat_data = ChatMessage(
            session_id=session_id,
            message=request.message,
            response=response
        )
        
        chat_dict = chat_data.dict()
        chat_dict['timestamp'] = chat_dict['timestamp'].isoformat()
        await db.chat_messages.insert_one(chat_dict)
        
        return {
            "response": response,
            "session_id": session_id
        }
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

# Contact form endpoint
@api_router.post("/contact")
async def submit_contact_form(form: ContactForm):
    try:
        form_dict = form.dict()
        form_dict['timestamp'] = form_dict['timestamp'].isoformat()
        await db.contact_forms.insert_one(form_dict)
        return {"message": "Contact form submitted successfully", "id": form.id}
    except Exception as e:
        logging.error(f"Contact form error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

# Affiliate links endpoints
@api_router.post("/affiliate", response_model=AffiliateLink)
async def create_affiliate_link(link_data: AffiliateLinkCreate):
    try:
        affiliate_link = AffiliateLink(**link_data.dict())
        link_dict = affiliate_link.dict()
        link_dict['timestamp'] = link_dict['timestamp'].isoformat()
        await db.affiliate_links.insert_one(link_dict)
        return affiliate_link
    except Exception as e:
        logging.error(f"Affiliate link creation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create affiliate link")

@api_router.get("/affiliate", response_model=List[AffiliateLink])
async def get_affiliate_links():
    try:
        links = await db.affiliate_links.find().to_list(1000)
        for link in links:
            if isinstance(link.get('timestamp'), str):
                link['timestamp'] = datetime.fromisoformat(link['timestamp'])
        return [AffiliateLink(**link) for link in links]
    except Exception as e:
        logging.error(f"Get affiliate links error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get affiliate links")

@api_router.post("/affiliate/{link_id}/click")
async def track_affiliate_click(link_id: str):
    try:
        result = await db.affiliate_links.update_one(
            {"id": link_id},
            {"$inc": {"clicks": 1}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Affiliate link not found")
        return {"message": "Click tracked successfully"}
    except Exception as e:
        logging.error(f"Click tracking error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track click")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()