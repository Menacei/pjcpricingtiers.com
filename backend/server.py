from fastapi import FastAPI, APIRouter, HTTPException, Request, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
from paypalcheckoutsdk.core import SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalhttp import HttpError as PayPalHttpError
import aiohttp
from bs4 import BeautifulSoup
import re
import json

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
    payment_method: str = "stripe"  # "stripe" or "paypal"
    total_pages: int = 0  # Total pages needed for pricing calculation

class PaymentStatusRequest(BaseModel):
    session_id: str

class PayPalOrderRequest(BaseModel):
    package_id: str
    origin_url: str
    customer_email: Optional[str] = None
    total_pages: int = 0  # Total pages needed for pricing calculation

class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str
    author: str = "PJC Web Designs Team"
    category: str
    tags: List[str] = []
    featured_image: Optional[str] = None
    published: bool = True
    reading_time: int = 5  # in minutes
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    author: Optional[str] = "PJC Web Designs Team"
    category: str
    tags: List[str] = []
    featured_image: Optional[str] = None
    published: bool = True

class SocialShare(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    platform: str
    share_url: str
    clicks: int = 0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SocialMediaPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str
    content: str
    media_url: Optional[str] = None
    media_type: str = "image"  # "image", "video", "carousel"
    author_name: str = "PJC Web Designs"
    author_avatar: Optional[str] = None
    likes: int = 0
    comments: int = 0
    shares: int = 0
    post_url: Optional[str] = None
    hashtags: List[str] = []
    featured: bool = False
    published: bool = True
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SocialMediaPostCreate(BaseModel):
    platform: str
    content: str
    media_url: Optional[str] = None
    media_type: str = "image"
    author_name: str = "PJC Web Designs"
    author_avatar: Optional[str] = None
    likes: int = 0
    comments: int = 0
    shares: int = 0
    post_url: Optional[str] = None
    hashtags: List[str] = []
    featured: bool = False

# Lead Generation Models
class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Core fields
    full_name: str
    email: str
    phone: Optional[str] = None
    business_type: Optional[str] = None
    biggest_problem: Optional[str] = None
    budget_range: Optional[str] = None
    # Tracking fields
    lead_source: str = "organic"  # organic, paid, social, referral, direct
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    landing_page: Optional[str] = None
    referrer: Optional[str] = None
    # Status and scoring
    status: str = "new"  # new, contacted, booked, closed, lost
    lead_score: int = 0
    notes: Optional[str] = None
    # Booking info
    booking_scheduled: bool = False
    booking_datetime: Optional[datetime] = None
    # Timestamps
    last_activity: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    business_type: Optional[str] = None
    biggest_problem: Optional[str] = None
    budget_range: Optional[str] = None
    lead_source: str = "organic"
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    landing_page: Optional[str] = None
    referrer: Optional[str] = None

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    lead_score: Optional[int] = None
    booking_scheduled: Optional[bool] = None
    booking_datetime: Optional[datetime] = None

class LeadActivity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str
    activity_type: str  # page_view, form_fill, email_open, email_click, etc.
    activity_data: Optional[Dict] = None
    score_change: int = 0
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsletterSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: Optional[str] = None
    interests: List[str] = []
    source: str = "website"
    status: str = "active"  # active, unsubscribed
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadMagnet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    magnet_type: str  # ebook, checklist, consultation, quote, template
    file_url: Optional[str] = None
    download_count: int = 0
    conversion_rate: float = 0.0
    active: bool = True
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Fixed pricing packages (SECURITY: Never allow frontend to set prices)
PACKAGES = {
    "starter": {
        "base_price": 325.00,
        "included_pages": 3,
        "additional_page_price": 106.00,
        "max_pages": 10,
        "name": "Launch Pad",
        "service_type": "web_design"
    },
    "growth": {
        "base_price": 812.00,
        "included_pages": 8,
        "additional_page_price": 100.00,
        "max_pages": 20,
        "name": "Growth Engine",
        "service_type": "web_design"
    },
    "scale": {
        "base_price": 1625.00,
        "included_pages": 15,
        "additional_page_price": 94.00,
        "max_pages": 50,
        "name": "Scale & Dominate",
        "service_type": "web_design"
    },
    # NewReach Transport - Moving Services (deposit/booking fee)
    "move_local_basic": {
        "base_price": 99.00,
        "name": "Local Move - Basic (2hr deposit)",
        "service_type": "moving",
        "description": "2-hour minimum booking deposit for local basic move"
    },
    "move_local_full": {
        "base_price": 149.00,
        "name": "Local Move - Full Service (2hr deposit)",
        "service_type": "moving",
        "description": "2-hour minimum booking deposit for full service local move"
    },
    "move_long_distance": {
        "base_price": 500.00,
        "name": "Long Distance Move (Booking Deposit)",
        "service_type": "moving",
        "description": "Booking deposit for long distance move - final price based on weight/distance"
    },
    # Box Truck Services
    "box_truck_local": {
        "base_price": 150.00,
        "name": "Box Truck - Local Haul (Booking Fee)",
        "service_type": "transport",
        "description": "Booking fee for local box truck service"
    },
    "box_truck_regional": {
        "base_price": 250.00,
        "name": "Box Truck - Regional Haul (Booking Fee)",
        "service_type": "transport",
        "description": "Booking fee for regional box truck service"
    }
}

# NewReach AI Consultant Agency Pricing
AI_CONSULTING_PACKAGES = {
    "ai_starter": {
        "monthly_price": 197.00,
        "annual_price": 1970.00,  # Save 2 months
        "service_type": "ai_consulting"
    },
    "ai_growth": {
        "monthly_price": 397.00,
        "annual_price": 3970.00,  # Save 2 months
        "service_type": "ai_consulting"
    },
    "ai_premium": {
        "monthly_price": 697.00,
        "annual_price": 6970.00,  # Save 2 months
        "service_type": "ai_consulting"
    }
}

# PayPal Environment Setup
def get_paypal_client():
    client_id = os.environ.get('PAYPAL_CLIENT_ID')
    client_secret = os.environ.get('PAYPAL_SECRET')
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="PayPal configuration error")
    
    # Use sandbox for testing, live for production
    environment = SandboxEnvironment(client_id=client_id, client_secret=client_secret)
    return environment.client()

def calculate_package_price(package_id: str, total_pages: int = 0) -> Dict:
    """Calculate the final price based on package and number of pages"""
    if package_id not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package selected")
    
    package = PACKAGES[package_id]
    base_price = package["base_price"]
    service_type = package.get("service_type", "web_design")
    
    # For transport/moving packages, just return base price
    if service_type in ["moving", "transport"]:
        return {
            "base_price": base_price,
            "final_price": base_price,
            "service_type": service_type,
            "name": package.get("name", package_id),
            "description": package.get("description", "")
        }
    
    # For web design packages with page-based pricing
    included_pages = package.get("included_pages", 0)
    additional_page_price = package.get("additional_page_price", 0)
    max_pages = package.get("max_pages", 50)
    
    # Use included pages if total_pages is 0 or less than included
    if total_pages <= 0:
        total_pages = included_pages
    
    # Check if requested pages exceed maximum
    if total_pages > max_pages:
        raise HTTPException(
            status_code=400, 
            detail=f"Requested {total_pages} pages exceeds maximum of {max_pages} for this package"
        )
    
    # Calculate additional pages and total price
    additional_pages = max(0, total_pages - included_pages)
    additional_cost = additional_pages * additional_page_price
    final_price = base_price + additional_cost
    
    return {
        "base_price": base_price,
        "included_pages": included_pages,
        "total_pages": total_pages,
        "additional_pages": additional_pages,
        "additional_page_price": additional_page_price,
        "additional_cost": additional_cost,
        "final_price": final_price,
        "savings": f"Save ${additional_page_price - 75:.2f} per additional page vs highest tier" if package_id != "scale" else "Best value for additional pages"
    }

# Sample blog posts data
SAMPLE_BLOG_POSTS = [
    {
        "title": "The Future of Web Design: Urban Tech Aesthetics",
        "excerpt": "Explore how urban technology influences modern web design and creates engaging digital experiences.",
        "content": "Urban tech aesthetics represent the convergence of metropolitan energy and cutting-edge technology. In web design, this translates to bold gradients, architectural imagery, and interactive elements that mirror the dynamism of city life. Professional designers understand the importance of reliable data backup solutions like AOMEI to protect their creative work and client projects...",
        "category": "Design Trends",
        "tags": ["web design", "urban tech", "aesthetics", "trends"],
        "featured_image": "https://images.unsplash.com/photo-1707226845968-c7e5e3409e35",
        "reading_time": 8
    },
    {
        "title": "Stripe Integration Best Practices for Web Design Agencies",
        "excerpt": "Learn how to implement secure and user-friendly payment systems for your web design business.",
        "content": "Payment processing is crucial for web design agencies. Stripe offers robust APIs and security features that make collecting payments seamless for both businesses and clients...",
        "category": "Development",
        "tags": ["stripe", "payments", "web development", "business"],
        "featured_image": "https://images.unsplash.com/photo-1559028012-481c04fa702d",
        "reading_time": 6
    },
    {
        "title": "AI Chatbots: Enhancing Customer Experience in Web Design",
        "excerpt": "Discover how AI-powered chatbots can improve client communication and support for web design services.",
        "content": "AI chatbots have revolutionized customer service in the web design industry. By implementing intelligent chat systems, agencies can provide 24/7 support and instantly answer common questions...",
        "category": "AI & Technology",
        "tags": ["ai", "chatbots", "customer service", "automation"],
        "featured_image": "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d",
        "reading_time": 7
    },
    {
        "title": "Social Media Integration for Modern Websites",
        "excerpt": "Best practices for integrating social media platforms into your web design projects.",
        "content": "Social media integration is essential for modern websites. From sharing buttons to social login, learn how to create seamless connections between your website and major social platforms...",
        "category": "Social Media",
        "tags": ["social media", "integration", "sharing", "engagement"],
        "featured_image": "https://images.unsplash.com/photo-1547658719-da2b51169166",
        "reading_time": 5
    }
]

# Sample social media posts data
SAMPLE_SOCIAL_POSTS = [
    {
        "platform": "instagram",
        "content": "Just launched this stunning e-commerce site for a local boutique! 🛍️ Urban tech meets fashion in the most beautiful way. #WebDesign #UrbanTech #Ecommerce",
        "media_url": "https://images.unsplash.com/photo-1559028012-481c04fa702d",
        "media_type": "image",
        "author_name": "PJC Web Designs",
        "likes": 247,
        "comments": 18,
        "shares": 32,
        "hashtags": ["webdesign", "urbantech", "ecommerce", "boutique"],
        "featured": True
    },
    {
        "platform": "twitter",
        "content": "🚀 Breaking: Our AI chatbot integration just helped another client increase customer engagement by 150%! The future of web design is here. We protect all our projects with reliable backup solutions. #AI #WebDevelopment #ChatBot",
        "media_url": "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d",
        "media_type": "image",
        "author_name": "PJC Web Designs",
        "likes": 89,
        "comments": 12,
        "shares": 45,
        "hashtags": ["ai", "webdevelopment", "chatbot", "engagement"],
        "featured": True
    },
    {
        "platform": "linkedin",
        "content": "Client success story: We helped a startup scale from 0 to 10k users with our Professional Business Suite. Custom web applications that grow with your business. 📈",
        "media_url": "https://images.unsplash.com/photo-1547658719-da2b51169166",
        "media_type": "image",
        "author_name": "PJC Web Designs",
        "likes": 156,
        "comments": 23,
        "shares": 67,
        "hashtags": ["startup", "scaling", "webapplication", "success"],
        "featured": True
    },
    {
        "platform": "facebook",
        "content": "Behind the scenes: Our team working on the latest urban tech design project. When creativity meets technology, magic happens! ✨ #BehindTheScenes #TeamWork",
        "media_url": "https://images.unsplash.com/photo-1707226845968-c7e5e3409e35",
        "media_type": "image",
        "author_name": "PJC Web Designs",
        "likes": 134,
        "comments": 28,
        "shares": 19,
        "hashtags": ["behindthescenes", "teamwork", "urbantech", "creativity"]
    },
    {
        "platform": "instagram",
        "content": "Color theory in action! 🎨 This gradient combination perfectly captures the urban tech aesthetic our clients love. What's your favorite color scheme?",
        "media_url": "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d",
        "media_type": "image",
        "author_name": "PJC Web Designs",
        "likes": 203,
        "comments": 34,
        "shares": 28,
        "hashtags": ["colortheory", "gradient", "design", "urbantech"]
    },
    {
        "platform": "twitter",
        "content": "💡 Pro tip: Mobile-first design isn't just a trend, it's essential. 70% of web traffic comes from mobile devices. Is your site ready? #MobileFirst #WebDesign",
        "media_url": "https://images.unsplash.com/photo-1559028012-481c04fa702d",
        "media_type": "image",
        "author_name": "PJC Web Designs",
        "likes": 78,
        "comments": 15,
        "shares": 52,
        "hashtags": ["mobilefirst", "webdesign", "protip", "responsive"]
    }
]

async def initialize_blog_posts():
    """Initialize sample blog posts if none exist"""
    try:
        existing_posts = await db.blog_posts.count_documents({})
        if existing_posts == 0:
            for post_data in SAMPLE_BLOG_POSTS:
                slug = post_data["title"].lower().replace(" ", "-").replace(",", "").replace(".", "").replace(":", "")
                slug = "".join(c for c in slug if c.isalnum() or c == "-")
                
                blog_post = BlogPost(
                    **post_data,
                    slug=slug
                )
                
                post_dict = blog_post.dict()
                post_dict['timestamp'] = post_dict['timestamp'].isoformat()
                await db.blog_posts.insert_one(post_dict)
            
            logging.info("Sample blog posts initialized")
    except Exception as e:
        logging.error(f"Failed to initialize blog posts: {str(e)}")

async def initialize_social_posts():
    """Initialize sample social media posts if none exist"""
    try:
        existing_posts = await db.social_media_posts.count_documents({})
        if existing_posts == 0:
            for post_data in SAMPLE_SOCIAL_POSTS:
                social_post = SocialMediaPost(**post_data)
                
                post_dict = social_post.dict()
                post_dict['timestamp'] = post_dict['timestamp'].isoformat()
                await db.social_media_posts.insert_one(post_dict)
            
            logging.info("Sample social media posts initialized")
    except Exception as e:
        logging.error(f"Failed to initialize social media posts: {str(e)}")

async def initialize_lead_magnets():
    """Initialize sample lead magnets if none exist"""
    try:
        existing_magnets = await db.lead_magnets.count_documents({})
        if existing_magnets == 0:
            lead_magnets = [
                {
                    "title": "Web Design Checklist for Startups",
                    "description": "Essential 25-point checklist to ensure your startup website covers all the basics for success.",
                    "magnet_type": "checklist",
                    "file_url": "#",
                    "active": True
                },
                {
                    "title": "Free 30-Minute Strategy Consultation",
                    "description": "Get personalized advice for your web design project. Discuss your goals, timeline, and budget with our experts.",
                    "magnet_type": "consultation",
                    "file_url": "#",
                    "active": True
                },
                {
                    "title": "Website Cost Calculator & Planning Template",
                    "description": "Plan your website budget with our comprehensive cost calculator and project planning template.",
                    "magnet_type": "template",
                    "file_url": "#",
                    "active": True
                },
                {
                    "title": "Instant Website Quote",
                    "description": "Get a personalized quote for your website project in under 2 minutes.",
                    "magnet_type": "quote",
                    "file_url": "#",
                    "active": True
                }
            ]
            
            for magnet_data in lead_magnets:
                magnet = LeadMagnet(**magnet_data)
                magnet_dict = magnet.dict()
                magnet_dict['timestamp'] = magnet_dict['timestamp'].isoformat()
                await db.lead_magnets.insert_one(magnet_dict)
            
            logging.info("Sample lead magnets initialized")
    except Exception as e:
        logging.error(f"Failed to initialize lead magnets: {str(e)}")

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
            system_message="You are Pat's AI assistant on his personal portfolio website. Pat (Patrick 'Pat' James Church) is a freelance web designer, AI specialist, and automation expert based in Kansas City, MO. He builds websites that actually make money for small businesses - not just pretty designs. Pat's unique approach combines AI integration, automation, and strategic web design to help clients get more leads, close more sales, and save hours every week. His packages are: Launch Pad (starts at $325 for 3 pages) - perfect for solopreneurs, Growth Engine (starts at $812 for 8 pages) - most popular with advanced AI automation and lead capture, and Scale & Dominate (starts at $1,625 for 15 pages) - full automation suite with custom AI tools. Pat's specialties include custom AI chatbots, research crawlers, lead automation, and e-commerce. Be conversational, helpful, and enthusiastic about how Pat can help grow their business. If asked for contact info: email Patrickjchurch04@gmail.com, response within 24 hours. Emphasize that Pat focuses on RESULTS, not just design."
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

# Stripe Payment Endpoints
@api_router.post("/checkout/session")
async def create_checkout_session(request: CheckoutRequest, http_request: Request):
    try:
        # Validate package exists
        if request.package_id not in PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package selected")
        
        # Calculate amount from server-side definition only (SECURITY)
        pricing = calculate_package_price(request.package_id, request.total_pages)
        amount = pricing["final_price"]
        
        # Initialize Stripe checkout
        api_key = os.environ.get('STRIPE_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="Stripe configuration error")
        
        host_url = str(http_request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
        
        # Build URLs from provided origin (SECURITY: Dynamic URLs)
        success_url = f"{request.origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/cancel"
        
        # Create checkout session
        metadata = {
            "package_id": request.package_id,
            "source": "pjc_web_designs",
            "customer_email": request.customer_email or ""
        }
        
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create transaction record BEFORE redirect (MANDATORY)
        transaction = PaymentTransaction(
            package_id=request.package_id,
            amount=amount,
            currency="usd",
            session_id=session.session_id,
            payment_status="pending",
            status="initiated",
            metadata=metadata,
            customer_email=request.customer_email
        )
        
        transaction_dict = transaction.dict()
        transaction_dict['timestamp'] = transaction_dict['timestamp'].isoformat()
        await db.payment_transactions.insert_one(transaction_dict)
        
        return {
            "url": session.url,
            "session_id": session.session_id
        }
        
    except Exception as e:
        logging.error(f"Checkout session creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    try:
        # Initialize Stripe checkout
        api_key = os.environ.get('STRIPE_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="Stripe configuration error")
        
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
        
        # Get status from Stripe
        checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update database record if payment successful and not already processed
        if checkout_status.payment_status == "paid":
            # Check if already processed to prevent double processing
            existing_transaction = await db.payment_transactions.find_one({
                "session_id": session_id,
                "payment_status": "paid"
            })
            
            if not existing_transaction:
                # Update transaction status
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "payment_status": checkout_status.payment_status,
                            "status": checkout_status.status,
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                logging.info(f"Payment successful for session {session_id}")
        
        return {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "amount_total": checkout_status.amount_total,
            "currency": checkout_status.currency,
            "metadata": checkout_status.metadata
        }
        
    except Exception as e:
        logging.error(f"Checkout status error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get checkout status: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        # Get the raw body and stripe signature
        body = await request.body()
        stripe_signature = request.headers.get("Stripe-Signature")
        
        if not stripe_signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        # Initialize Stripe checkout
        api_key = os.environ.get('STRIPE_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="Stripe configuration error")
        
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        # Update transaction based on webhook event
        if webhook_response.event_type in ["checkout.session.completed", "payment_intent.succeeded"]:
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {
                    "$set": {
                        "payment_status": webhook_response.payment_status,
                        "status": "completed",
                        "webhook_processed": True,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logging.info(f"Webhook processed for session {webhook_response.session_id}")
        
        return {"status": "success"}
        
    except Exception as e:
        logging.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@api_router.get("/packages")
async def get_packages():
    """Get available pricing packages"""
    return {
        "packages": [
            {
                "id": "starter",
                "name": "Startup Launch",
                "base_price": PACKAGES["starter"]["base_price"],
                "included_pages": PACKAGES["starter"]["included_pages"],
                "additional_page_price": PACKAGES["starter"]["additional_page_price"],
                "max_pages": PACKAGES["starter"]["max_pages"],
                "price_display": f"Starting at ${PACKAGES['starter']['base_price']:.2f}",
                "features": [
                    f"{PACKAGES['starter']['included_pages']}-page modern website (base price)",
                    f"Additional pages: +${PACKAGES['starter']['additional_page_price']:.0f} each",
                    "Mobile-responsive design",
                    "Basic SEO optimization",
                    "Contact form & social links",
                    "Free domain setup help",
                    "30 days support",
                    "Perfect for new businesses"
                ]
            },
            {
                "id": "growth",
                "name": "Business Growth",
                "base_price": PACKAGES["growth"]["base_price"],
                "included_pages": PACKAGES["growth"]["included_pages"],
                "additional_page_price": PACKAGES["growth"]["additional_page_price"],
                "max_pages": PACKAGES["growth"]["max_pages"],
                "price_display": f"Starting at ${PACKAGES['growth']['base_price']:.2f}",
                "features": [
                    f"Up to {PACKAGES['growth']['included_pages']} custom pages (base price)",
                    f"Additional pages: +${PACKAGES['growth']['additional_page_price']:.0f} each",
                    "Modern animations",
                    "Blog integration",
                    "Advanced SEO setup",
                    "Social media integration",
                    "Email marketing setup",
                    "60 days support",
                    "Analytics dashboard"
                ],
                "popular": True
            },
            {
                "id": "scale",
                "name": "Scale & Expand",
                "base_price": PACKAGES["scale"]["base_price"],
                "included_pages": PACKAGES["scale"]["included_pages"],
                "additional_page_price": PACKAGES["scale"]["additional_page_price"],
                "max_pages": PACKAGES["scale"]["max_pages"],
                "price_display": f"Starting at ${PACKAGES['scale']['base_price']:.2f}",
                "features": [
                    f"Up to {PACKAGES['scale']['included_pages']} pages (base price)",
                    f"Additional pages: +${PACKAGES['scale']['additional_page_price']:.0f} each",
                    "E-commerce functionality",
                    "CMS for easy updates",
                    "Advanced integrations",
                    "Performance optimization",
                    "Security features",
                    "90 days premium support",
                    "Monthly growth consultation"
                ]
            }
        ]
    }

# Blog endpoints
@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(limit: int = 10, category: Optional[str] = None):
    try:
        filter_query = {"published": True}
        if category:
            filter_query["category"] = category
            
        posts = await db.blog_posts.find(filter_query).sort("timestamp", -1).limit(limit).to_list(limit)
        
        for post in posts:
            if isinstance(post.get('timestamp'), str):
                post['timestamp'] = datetime.fromisoformat(post['timestamp'])
        
        return [BlogPost(**post) for post in posts]
    except Exception as e:
        logging.error(f"Get blog posts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get blog posts")

@api_router.get("/blog/categories")
async def get_blog_categories():
    try:
        categories = await db.blog_posts.distinct("category", {"published": True})
        return {"categories": categories}
    except Exception as e:
        logging.error(f"Get blog categories error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get blog categories")

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    try:
        post = await db.blog_posts.find_one({"slug": slug, "published": True})
        if not post:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        if isinstance(post.get('timestamp'), str):
            post['timestamp'] = datetime.fromisoformat(post['timestamp'])
            
        return BlogPost(**post)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get blog post error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get blog post")

@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(post_data: BlogPostCreate):
    try:
        # Generate slug from title
        slug = post_data.title.lower().replace(" ", "-").replace(",", "").replace(".", "")
        slug = "".join(c for c in slug if c.isalnum() or c == "-")
        
        blog_post = BlogPost(
            **post_data.dict(),
            slug=slug
        )
        
        post_dict = blog_post.dict()
        post_dict['timestamp'] = post_dict['timestamp'].isoformat()
        await db.blog_posts.insert_one(post_dict)
        
        return blog_post
    except Exception as e:
        logging.error(f"Create blog post error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create blog post")

# Social media endpoints
@api_router.post("/social/share")
async def track_social_share(post_id: str, platform: str):
    try:
        # Generate share URLs based on platform
        base_url = "https://patjc-digital.preview.emergentagent.com"
        post_url = f"{base_url}/blog/{post_id}"
        
        share_urls = {
            "facebook": f"https://www.facebook.com/sharer/sharer.php?u={post_url}",
            "twitter": f"https://twitter.com/intent/tweet?url={post_url}&text=Check out this article from PJC Web Designs!",
            "linkedin": f"https://www.linkedin.com/sharing/share-offsite/?url={post_url}",
            "instagram": f"https://www.instagram.com/",  # Instagram doesn't support direct URL sharing
            "pinterest": f"https://pinterest.com/pin/create/button/?url={post_url}",
            "reddit": f"https://reddit.com/submit?url={post_url}&title=PJC Web Designs Article",
            "whatsapp": f"https://wa.me/?text=Check out this article: {post_url}",
            "telegram": f"https://t.me/share/url?url={post_url}&text=PJC Web Designs Article"
        }
        
        if platform not in share_urls:
            raise HTTPException(status_code=400, detail="Unsupported social platform")
        
        # Track the share
        social_share = SocialShare(
            post_id=post_id,
            platform=platform,
            share_url=share_urls[platform]
        )
        
        share_dict = social_share.dict()
        share_dict['timestamp'] = share_dict['timestamp'].isoformat()
        await db.social_shares.insert_one(share_dict)
        
        # Update click count
        await db.social_shares.update_one(
            {"id": social_share.id},
            {"$inc": {"clicks": 1}}
        )
        
        return {
            "share_url": share_urls[platform],
            "platform": platform
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Social share error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create social share")

@api_router.get("/social/platforms")
async def get_social_platforms():
    """Get available social media platforms for sharing"""
    return {
        "platforms": [
            {"id": "facebook", "name": "Facebook", "icon": "facebook", "color": "#1877F2"},
            {"id": "twitter", "name": "Twitter", "icon": "twitter", "color": "#1DA1F2"},
            {"id": "linkedin", "name": "LinkedIn", "icon": "linkedin", "color": "#0A66C2"},
            {"id": "instagram", "name": "Instagram", "icon": "instagram", "color": "#E4405F"},
            {"id": "pinterest", "name": "Pinterest", "icon": "pinterest", "color": "#BD081C"},
            {"id": "reddit", "name": "Reddit", "icon": "reddit", "color": "#FF4500"},
            {"id": "whatsapp", "name": "WhatsApp", "icon": "whatsapp", "color": "#25D366"},
            {"id": "telegram", "name": "Telegram", "icon": "telegram", "color": "#0088CC"}
        ]
    }

@api_router.get("/social/stats")
async def get_social_stats():
    """Get social media sharing statistics"""
    try:
        stats = await db.social_shares.aggregate([
            {
                "$group": {
                    "_id": "$platform",
                    "total_shares": {"$sum": 1},
                    "total_clicks": {"$sum": "$clicks"}
                }
            }
        ]).to_list(None)
        
        return {"stats": stats}
    except Exception as e:
        logging.error(f"Social stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get social stats")

# PayPal Payment Endpoints
@api_router.post("/paypal/orders")
async def create_paypal_order(request: PayPalOrderRequest):
    try:
        # Validate package exists
        if request.package_id not in PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package selected")
        
        # Calculate amount from server-side definition only (SECURITY)
        pricing = calculate_package_price(request.package_id, request.total_pages)
        amount = pricing["final_price"]
        
        # Get PayPal client
        paypal_client = get_paypal_client()
        
        # Create PayPal order
        create_order_request = OrdersCreateRequest()
        create_order_request.prefer('return=representation')
        create_order_request.request_body = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": request.package_id,
                "amount": {
                    "currency_code": "USD", 
                    "value": f"{amount:.2f}"
                },
                "description": f"PJC Web Designs - {request.package_id.title()} Package"
            }],
            "application_context": {
                "return_url": f"{request.origin_url}/success",
                "cancel_url": f"{request.origin_url}/cancel",
                "brand_name": "PJC Web Designs",
                "landing_page": "BILLING",
                "user_action": "PAY_NOW"
            }
        }

        response = paypal_client.execute(create_order_request)
        order = response.result
        
        # Create transaction record BEFORE redirect (MANDATORY)
        transaction = PaymentTransaction(
            package_id=request.package_id,
            amount=amount,
            currency="usd",
            session_id=order.id,  # Use PayPal order ID as session ID
            payment_status="pending",
            status="initiated",
            metadata={
                "payment_method": "paypal",
                "package_id": request.package_id,
                "customer_email": request.customer_email or ""
            },
            customer_email=request.customer_email
        )
        
        transaction_dict = transaction.dict()
        transaction_dict['timestamp'] = transaction_dict['timestamp'].isoformat()
        await db.payment_transactions.insert_one(transaction_dict)
        
        # Find approval URL
        approval_url = None
        for link in order.links:
            if link.rel == "approve":
                approval_url = link.href
                break
        
        return {
            "order_id": order.id,
            "approval_url": approval_url,
            "status": order.status
        }
        
    except PayPalHttpError as e:
        logging.error(f"PayPal API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PayPal error: {str(e)}")
    except Exception as e:
        logging.error(f"PayPal order creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create PayPal order: {str(e)}")

@api_router.post("/paypal/orders/{order_id}/capture")
async def capture_paypal_order(order_id: str):
    try:
        # Get PayPal client
        paypal_client = get_paypal_client()
        
        # Capture the order
        capture_request = OrdersCaptureRequest(order_id)
        response = paypal_client.execute(capture_request)
        order = response.result
        
        # Update transaction status if payment successful and not already processed
        if order.status == "COMPLETED":
            # Check if already processed to prevent double processing
            existing_transaction = await db.payment_transactions.find_one({
                "session_id": order_id,
                "payment_status": "paid"
            })
            
            if not existing_transaction:
                # Update transaction status
                await db.payment_transactions.update_one(
                    {"session_id": order_id},
                    {
                        "$set": {
                            "payment_status": "paid",
                            "status": "completed",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                logging.info(f"PayPal payment successful for order {order_id}")
        
        return {
            "order_id": order.id,
            "status": order.status,
            "amount": order.purchase_units[0].payments.captures[0].amount.value if order.purchase_units[0].payments.captures else 0,
            "currency": order.purchase_units[0].payments.captures[0].amount.currency_code if order.purchase_units[0].payments.captures else "USD"
        }
        
    except PayPalHttpError as e:
        logging.error(f"PayPal capture error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PayPal capture error: {str(e)}")
    except Exception as e:
        logging.error(f"PayPal capture error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to capture PayPal order: {str(e)}")

@api_router.get("/paypal/orders/{order_id}")
async def get_paypal_order_status(order_id: str):
    try:
        # Get PayPal client
        paypal_client = get_paypal_client()
        
        # Get order details from PayPal
        from paypalcheckoutsdk.orders import OrdersGetRequest
        get_request = OrdersGetRequest(order_id)
        response = paypal_client.execute(get_request)
        order = response.result
        
        # Update database record if payment successful and not already processed
        if order.status == "COMPLETED":
            existing_transaction = await db.payment_transactions.find_one({
                "session_id": order_id,
                "payment_status": "paid"
            })
            
            if not existing_transaction:
                await db.payment_transactions.update_one(
                    {"session_id": order_id},
                    {
                        "$set": {
                            "payment_status": "paid",
                            "status": "completed",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
        
        return {
            "order_id": order.id,
            "status": order.status,
            "payment_status": "paid" if order.status == "COMPLETED" else "pending"
        }
        
    except PayPalHttpError as e:
        logging.error(f"PayPal order status error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PayPal order status error: {str(e)}")
    except Exception as e:
        logging.error(f"PayPal order status error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get PayPal order status: {str(e)}")

@api_router.post("/paypal/webhook")
async def paypal_webhook(request: Request):
    try:
        # Get the raw body
        body = await request.body()
        data = await request.json()
        
        # In production, you should validate the webhook signature
        # For now, we'll process the webhook events
        
        if data.get("event_type") == "PAYMENT.CAPTURE.COMPLETED":
            order_id = data["resource"]["supplementary_data"]["related_ids"]["order_id"]
            
            # Update transaction status
            await db.payment_transactions.update_one(
                {"session_id": order_id},
                {
                    "$set": {
                        "payment_status": "paid",
                        "status": "completed",
                        "webhook_processed": True,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logging.info(f"PayPal webhook processed for order {order_id}")
        
        return {"status": "success"}
        
    except Exception as e:
        logging.error(f"PayPal webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="PayPal webhook processing failed")

# Social Media Content Endpoints
@api_router.get("/social/posts", response_model=List[SocialMediaPost])
async def get_social_media_posts(limit: int = 6, featured: Optional[bool] = None):
    try:
        filter_query = {"published": True}
        if featured is not None:
            filter_query["featured"] = featured
            
        posts = await db.social_media_posts.find(filter_query).sort("timestamp", -1).limit(limit).to_list(limit)
        
        for post in posts:
            if isinstance(post.get('timestamp'), str):
                post['timestamp'] = datetime.fromisoformat(post['timestamp'])
        
        return [SocialMediaPost(**post) for post in posts]
    except Exception as e:
        logging.error(f"Get social media posts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get social media posts")

@api_router.post("/social/posts", response_model=SocialMediaPost)
async def create_social_media_post(post_data: SocialMediaPostCreate):
    try:
        social_post = SocialMediaPost(**post_data.dict())
        
        post_dict = social_post.dict()
        post_dict['timestamp'] = post_dict['timestamp'].isoformat()
        await db.social_media_posts.insert_one(post_dict)
        
        return social_post
    except Exception as e:
        logging.error(f"Create social media post error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create social media post")

@api_router.get("/social/posts/{post_id}")
async def get_social_media_post(post_id: str):
    try:
        post = await db.social_media_posts.find_one({"id": post_id, "published": True})
        if not post:
            raise HTTPException(status_code=404, detail="Social media post not found")
        
        if isinstance(post.get('timestamp'), str):
            post['timestamp'] = datetime.fromisoformat(post['timestamp'])
            
        return SocialMediaPost(**post)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get social media post error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get social media post")

@api_router.post("/social/posts/{post_id}/engage")
async def engage_with_post(post_id: str, action: str):
    """Track engagement with social media posts (like, comment, share)"""
    try:
        if action not in ["like", "comment", "share"]:
            raise HTTPException(status_code=400, detail="Invalid engagement action")
        
        # Increment the engagement counter
        update_field = f"{action}s"
        await db.social_media_posts.update_one(
            {"id": post_id},
            {"$inc": {update_field: 1}}
        )
        
        return {"message": f"Engagement tracked for {action}", "action": action}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Post engagement error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track engagement")

@api_router.get("/social/featured")
async def get_featured_social_posts():
    """Get featured social media posts for homepage display"""
    try:
        posts = await db.social_media_posts.find({
            "published": True,
            "featured": True
        }).sort("timestamp", -1).limit(3).to_list(3)
        
        for post in posts:
            if isinstance(post.get('timestamp'), str):
                post['timestamp'] = datetime.fromisoformat(post['timestamp'])
        
        return [SocialMediaPost(**post) for post in posts]
    except Exception as e:
        logging.error(f"Get featured social posts error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get featured social posts")

# SEO Endpoints
@api_router.get("/sitemap.xml")
async def get_sitemap():
    """Generate XML sitemap for SEO"""
    from fastapi.responses import Response
    
    base_url = "https://patjc-digital.preview.emergentagent.com"
    
    # Get blog posts for sitemap
    try:
        blog_posts = await db.blog_posts.find({"published": True}).to_list(1000)
    except:
        blog_posts = []
    
    sitemap_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{base_url}</loc>
        <lastmod>2025-09-09</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{base_url}/#pricing</loc>
        <lastmod>2025-09-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>{base_url}/#portfolio</loc>
        <lastmod>2025-09-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>{base_url}/#blog</loc>
        <lastmod>2025-09-09</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>{base_url}/#contact</loc>
        <lastmod>2025-09-09</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>'''
    
    # Add blog posts to sitemap
    for post in blog_posts:
        sitemap_xml += f'''
    <url>
        <loc>{base_url}/blog/{post.get('slug', post.get('id'))}</loc>
        <lastmod>{post.get('timestamp', '2025-09-09')[:10]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>'''
    
    sitemap_xml += '''
</urlset>'''
    
    return Response(content=sitemap_xml, media_type="application/xml")

@api_router.get("/robots.txt")
async def get_robots():
    """Generate robots.txt for SEO"""
    from fastapi.responses import Response
    
    robots_txt = """User-agent: *
Allow: /

# Sitemap
Sitemap: https://pjcwebdesigns.solutions/api/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow certain paths
Disallow: /api/
Disallow: /admin/
Disallow: /*.json$
Disallow: /*?*

# Allow important pages
Allow: /api/sitemap.xml
Allow: /api/robots.txt
"""
    
    return Response(content=robots_txt, media_type="text/plain")

@api_router.get("/seo/meta")
async def get_seo_meta():
    """Get SEO metadata for dynamic pages"""
    return {
        "title": "Pat Church - AI-Powered Web Design & Automation | Kansas City",
        "description": "I'm Pat Church, and I build websites that actually make money. AI integration, automation, and strategic web design for small businesses in Kansas City and beyond.",
        "keywords": "AI web design, automation, lead generation, Kansas City web designer, small business websites, AI chatbots, custom automation",
        "canonical": "https://patjc-digital.preview.emergentagent.com",
        "og_image": "https://images.unsplash.com/photo-1559028012-481c04fa702d",
        "structured_data": {
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "Pat Church - Web Design & AI Automation",
            "priceRange": "$325-$1625+"
        }
    }

@api_router.get("/calculate-price/{package_id}")
async def calculate_price_endpoint(package_id: str, pages: int = 0):
    """Calculate price for a specific package and number of pages"""
    try:
        pricing = calculate_package_price(package_id, pages)
        return pricing
    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Price calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate price")

@api_router.post("/analytics/page-view")
async def track_page_view(page: str, referrer: Optional[str] = None):
    """Track page views for SEO analytics"""
    try:
        view_data = {
            "id": str(uuid.uuid4()),
            "page": page,
            "referrer": referrer,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_agent": "",  # Could be added from request headers
        }
        await db.page_views.insert_one(view_data)
        return {"status": "tracked"}
    except Exception as e:
        logging.error(f"Analytics tracking error: {str(e)}")
        return {"status": "error"}

@api_router.get("/analytics/performance")
async def get_performance_data():
    """Get basic performance analytics for SEO"""
    try:
        # Get page view counts
        views = await db.page_views.aggregate([
            {"$group": {"_id": "$page", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(10)
        
        # Get contact form submissions count
        contacts = await db.contact_forms.count_documents({})
        
        # Get social engagement
        social_stats = await db.social_shares.aggregate([
            {"$group": {"_id": "$platform", "shares": {"$sum": 1}}}
        ]).to_list(10)
        
        return {
            "page_views": views,
            "contact_submissions": contacts,  
            "social_engagement": social_stats,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logging.error(f"Performance data error: {str(e)}")
        return {"error": "Failed to get performance data"}

# Lead Generation System Endpoints
@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate):
    """Create a new lead with automatic scoring"""
    try:
        # Calculate initial lead score
        score = calculate_lead_score(lead_data)
        
        lead = Lead(
            full_name=lead_data.full_name,
            email=lead_data.email,
            phone=lead_data.phone,
            business_type=lead_data.business_type,
            biggest_problem=lead_data.biggest_problem,
            budget_range=lead_data.budget_range,
            lead_source=lead_data.lead_source,
            utm_source=lead_data.utm_source,
            utm_medium=lead_data.utm_medium,
            utm_campaign=lead_data.utm_campaign,
            landing_page=lead_data.landing_page,
            referrer=lead_data.referrer,
            lead_score=score,
            status="new"
        )
        
        lead_dict = lead.dict()
        lead_dict['timestamp'] = lead_dict['timestamp'].isoformat()
        lead_dict['last_activity'] = lead_dict['last_activity'].isoformat()
        if lead_dict.get('booking_datetime'):
            lead_dict['booking_datetime'] = lead_dict['booking_datetime'].isoformat()
        await db.leads.insert_one(lead_dict)
        
        # Log lead creation activity
        await log_lead_activity(lead.id, "lead_created", {"source": lead_data.lead_source}, 10)
        
        return {"success": True, "lead_id": lead.id, "message": "Lead captured successfully"}
    except Exception as e:
        logging.error(f"Create lead error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create lead")

@api_router.get("/leads")
async def get_leads(status: Optional[str] = None, source: Optional[str] = None, limit: int = 100):
    """Get leads with optional filters for admin dashboard"""
    try:
        filter_query = {}
        if status:
            filter_query["status"] = status
        if source:
            filter_query["lead_source"] = source
            
        leads = await db.leads.find(filter_query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return leads
    except Exception as e:
        logging.error(f"Get leads error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get leads")

@api_router.get("/leads/{lead_id}")
async def get_lead(lead_id: str):
    """Get single lead by ID"""
    try:
        lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get lead error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get lead")

@api_router.patch("/leads/{lead_id}")
async def update_lead(lead_id: str, update_data: LeadUpdate):
    """Update lead status, notes, or booking info"""
    try:
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict['last_activity'] = datetime.now(timezone.utc).isoformat()
        
        if update_data.booking_datetime:
            update_dict['booking_datetime'] = update_data.booking_datetime.isoformat()
        
        result = await db.leads.update_one(
            {"id": lead_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
            
        return {"success": True, "message": "Lead updated"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Update lead error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update lead")

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str):
    """Delete a lead"""
    try:
        result = await db.leads.delete_one({"id": lead_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
        return {"success": True, "message": "Lead deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Delete lead error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete lead")

@api_router.get("/leads/stats/summary")
async def get_leads_stats():
    """Get lead statistics for dashboard"""
    try:
        total = await db.leads.count_documents({})
        new_count = await db.leads.count_documents({"status": "new"})
        contacted = await db.leads.count_documents({"status": "contacted"})
        booked = await db.leads.count_documents({"status": "booked"})
        closed = await db.leads.count_documents({"status": "closed"})
        
        # Source breakdown
        organic = await db.leads.count_documents({"lead_source": "organic"})
        paid = await db.leads.count_documents({"lead_source": "paid"})
        social = await db.leads.count_documents({"lead_source": "social"})
        referral = await db.leads.count_documents({"lead_source": "referral"})
        
        return {
            "total": total,
            "by_status": {
                "new": new_count,
                "contacted": contacted,
                "booked": booked,
                "closed": closed
            },
            "by_source": {
                "organic": organic,
                "paid": paid,
                "social": social,
                "referral": referral
            },
            "conversion_rate": round((closed / total * 100) if total > 0 else 0, 1)
        }
    except Exception as e:
        logging.error(f"Get lead stats error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get stats")

@api_router.post("/leads/{lead_id}/activity")
async def track_lead_activity(lead_id: str, activity_type: str, activity_data: Optional[Dict] = None):
    """Track lead activity and update score"""
    try:
        score_change = get_activity_score(activity_type)
        
        await log_lead_activity(lead_id, activity_type, activity_data, score_change)
        
        # Update lead score and last activity
        await db.leads.update_one(
            {"id": lead_id},
            {
                "$inc": {"lead_score": score_change},
                "$set": {"last_activity": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        return {"message": "Activity tracked", "score_change": score_change}
    except Exception as e:
        logging.error(f"Track activity error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track activity")

@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(email: str, name: Optional[str] = None, interests: List[str] = []):
    """Subscribe to newsletter"""
    try:
        # Check if already subscribed
        existing = await db.newsletter_subscriptions.find_one({"email": email})
        if existing:
            return {"message": "Already subscribed", "status": "existing"}
        
        subscription = NewsletterSubscription(
            email=email,
            name=name,
            interests=interests
        )
        
        sub_dict = subscription.dict()
        sub_dict['timestamp'] = sub_dict['timestamp'].isoformat()
        await db.newsletter_subscriptions.insert_one(sub_dict)
        
        # Also create/update lead
        lead_data = LeadCreate(
            email=email,
            name=name,
            lead_source="newsletter",
            lead_magnet="newsletter_signup"
        )
        
        try:
            existing_lead = await db.leads.find_one({"email": email})
            if not existing_lead:
                await create_lead(lead_data)
            else:
                await log_lead_activity(existing_lead["id"], "newsletter_signup", {}, 15)
        except:
            pass  # Don't fail if lead creation fails
        
        return {"message": "Newsletter subscription successful", "status": "subscribed"}
    except Exception as e:
        logging.error(f"Newsletter subscription error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to subscribe to newsletter")

@api_router.get("/lead-magnets")
async def get_lead_magnets():
    """Get available lead magnets"""
    try:
        magnets = await db.lead_magnets.find({"active": True}).to_list(10)
        return magnets
    except Exception as e:
        logging.error(f"Get lead magnets error: {str(e)}")
        return []

@api_router.post("/lead-magnets/{magnet_id}/download")
async def download_lead_magnet(magnet_id: str, email: str, name: Optional[str] = None):
    """Download lead magnet and capture lead"""
    try:
        # Get lead magnet
        magnet = await db.lead_magnets.find_one({"id": magnet_id, "active": True})
        if not magnet:
            raise HTTPException(status_code=404, detail="Lead magnet not found")
        
        # Create/update lead
        lead_data = LeadCreate(
            email=email,
            name=name,
            lead_source="lead_magnet",
            lead_magnet=magnet["title"]
        )
        
        existing_lead = await db.leads.find_one({"email": email})
        if not existing_lead:
            await create_lead(lead_data)
        else:
            await log_lead_activity(existing_lead["id"], "magnet_download", {"magnet": magnet["title"]}, 25)
        
        # Update download count
        await db.lead_magnets.update_one(
            {"id": magnet_id},
            {"$inc": {"download_count": 1}}
        )
        
        return {
            "message": "Lead magnet accessed successfully",
            "download_url": magnet.get("file_url", "#"),
            "title": magnet["title"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Download lead magnet error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download lead magnet")

@api_router.get("/leads/analytics")
async def get_lead_analytics():
    """Get lead generation analytics"""
    try:
        # Total leads
        total_leads = await db.leads.count_documents({})
        
        # Leads by status
        leads_by_status = await db.leads.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]).to_list(10)
        
        # Leads by source
        leads_by_source = await db.leads.aggregate([
            {"$group": {"_id": "$lead_source", "count": {"$sum": 1}}}
        ]).to_list(10)
        
        # Average lead score
        avg_score = await db.leads.aggregate([
            {"$group": {"_id": None, "avg_score": {"$avg": "$lead_score"}}}
        ]).to_list(1)
        
        # Recent leads (last 7 days)
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_leads = await db.leads.count_documents({
            "timestamp": {"$gte": seven_days_ago.isoformat()}
        })
        
        # Newsletter subscribers
        newsletter_subs = await db.newsletter_subscriptions.count_documents({"status": "active"})
        
        return {
            "total_leads": total_leads,
            "leads_by_status": leads_by_status,
            "leads_by_source": leads_by_source,
            "average_score": avg_score[0]["avg_score"] if avg_score else 0,
            "recent_leads": recent_leads,
            "newsletter_subscribers": newsletter_subs,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logging.error(f"Lead analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get lead analytics")

# Helper Functions
def calculate_lead_score(lead_data: LeadCreate) -> int:
    """Calculate initial lead score based on provided information"""
    score = 0
    
    # Basic contact info
    if lead_data.name:
        score += 10
    if lead_data.phone:
        score += 15
    if lead_data.company:
        score += 20
    if lead_data.website:
        score += 10
    
    # Budget and project info
    budget_scores = {
        "under_500": 5,
        "500_1000": 25,
        "1000_5000": 50,
        "5000_10000": 75,
        "over_10000": 100
    }
    if lead_data.budget_range and lead_data.budget_range in budget_scores:
        score += budget_scores[lead_data.budget_range]
    
    # Timeline urgency
    timeline_scores = {
        "immediate": 50,
        "1_month": 40,
        "3_months": 30,
        "6_months": 20,
        "flexible": 10
    }
    if lead_data.timeline and lead_data.timeline in timeline_scores:
        score += timeline_scores[lead_data.timeline]
    
    # Project type
    project_scores = {
        "new_website": 30,
        "redesign": 35,
        "ecommerce": 40,
        "web_app": 45,
        "maintenance": 15
    }
    if lead_data.project_type and lead_data.project_type in project_scores:
        score += project_scores[lead_data.project_type]
    
    return min(score, 100)  # Cap at 100

def get_activity_score(activity_type: str) -> int:
    """Get score change for different activities"""
    activity_scores = {
        "lead_created": 10,
        "page_view": 2,
        "pricing_view": 10,
        "contact_form": 25,
        "phone_call": 30,
        "email_open": 5,
        "email_click": 10,
        "newsletter_signup": 15,
        "magnet_download": 25,
        "quote_request": 40,
        "consultation_booked": 50
    }
    return activity_scores.get(activity_type, 0)

async def log_lead_activity(lead_id: str, activity_type: str, activity_data: Optional[Dict], score_change: int):
    """Log lead activity"""
    try:
        activity = LeadActivity(
            lead_id=lead_id,
            activity_type=activity_type,
            activity_data=activity_data,
            score_change=score_change
        )
        
        activity_dict = activity.dict()
        activity_dict['timestamp'] = activity_dict['timestamp'].isoformat()
        await db.lead_activities.insert_one(activity_dict)
    except Exception as e:
        logging.error(f"Log activity error: {str(e)}")

async def send_lead_welcome_email(email: str, name: Optional[str]):
    """Send welcome email to new lead (placeholder for email integration)"""
    try:
        # This would integrate with your email service (SendGrid, Mailgun, etc.)
        logging.info(f"Sending welcome email to {email} ({name})")
        # Email content would include:
        # - Welcome message
        # - Link to free consultation
        # - Portfolio examples
        # - Contact information
    except Exception as e:
        logging.error(f"Send welcome email error: {str(e)}")

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

@app.on_event("startup")
async def startup_event():
    await initialize_blog_posts()
    await initialize_social_posts()
    await initialize_lead_magnets()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()