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
from paypalcheckoutsdk.core import SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalhttp import HttpError as PayPalHttpError

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

class PaymentStatusRequest(BaseModel):
    session_id: str

class PayPalOrderRequest(BaseModel):
    package_id: str
    origin_url: str
    customer_email: Optional[str] = None

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

# Fixed pricing packages (SECURITY: Never allow frontend to set prices)
PACKAGES = {
    "essential": 599.99,
    "professional": 2999.99,
    "enterprise": 10000.0
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

# Sample blog posts data
SAMPLE_BLOG_POSTS = [
    {
        "title": "The Future of Web Design: Urban Tech Aesthetics",
        "excerpt": "Explore how urban technology influences modern web design and creates engaging digital experiences.",
        "content": "Urban tech aesthetics represent the convergence of metropolitan energy and cutting-edge technology. In web design, this translates to bold gradients, architectural imagery, and interactive elements that mirror the dynamism of city life...",
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

# Stripe Payment Endpoints
@api_router.post("/checkout/session")
async def create_checkout_session(request: CheckoutRequest, http_request: Request):
    try:
        # Validate package exists
        if request.package_id not in PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package selected")
        
        # Get amount from server-side definition only (SECURITY)
        amount = PACKAGES[request.package_id]
        
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
                "id": "essential",
                "name": "Essential Web Presence",
                "price": PACKAGES["essential"],
                "features": [
                    "5-page responsive website",
                    "Mobile-optimized design",
                    "Basic SEO setup",
                    "Contact form integration",
                    "Social media integration",
                    "30 days support"
                ]
            },
            {
                "id": "professional",
                "name": "Professional Business Suite",
                "price": PACKAGES["professional"],
                "features": [
                    "Up to 15 custom pages",
                    "Advanced animations & interactions",
                    "E-commerce integration",
                    "CMS for easy updates",
                    "Advanced SEO & analytics",
                    "90 days premium support",
                    "Performance optimization",
                    "Security features"
                ],
                "popular": True
            },
            {
                "id": "enterprise",
                "name": "Enterprise Digital Ecosystem",
                "price": PACKAGES["enterprise"],
                "features": [
                    "Unlimited custom pages",
                    "Custom web application",
                    "API integrations",
                    "Advanced user management",
                    "Custom dashboard & analytics",
                    "1 year premium support",
                    "Dedicated project manager",
                    "Training & documentation",
                    "Regular maintenance & updates"
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

@api_router.get("/blog/categories")
async def get_blog_categories():
    try:
        categories = await db.blog_posts.distinct("category", {"published": True})
        return {"categories": categories}
    except Exception as e:
        logging.error(f"Get blog categories error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get blog categories")

# Social media endpoints
@api_router.post("/social/share")
async def track_social_share(post_id: str, platform: str):
    try:
        # Generate share URLs based on platform
        base_url = "https://pjc-pricing-tiers.preview.emergentagent.com"
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()