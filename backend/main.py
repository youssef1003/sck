from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from api.routes import consultation, contact, blog, ai_chat

load_dotenv()

app = FastAPI(
    title="SCK Consulting Platform API",
    description="Backend API for SCK Administrative Consulting Platform",
    version="1.0.0"
)

# CORS Configuration from environment
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers
app.include_router(consultation.router, prefix="/api/consultation", tags=["Consultation"])
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(blog.router, prefix="/api/blog", tags=["Blog"])
app.include_router(ai_chat.router, prefix="/api/ai", tags=["AI Chatbot"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to SCK Consulting Platform API",
        "version": "1.0.0",
        "status": "active",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }
