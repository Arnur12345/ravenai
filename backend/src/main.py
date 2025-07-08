from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

from settings import settings
from database import Base, async_engine
from auth.api import auth_router
from auth.two_factor_api import router as two_factor_router
from auth.two_factor import init_cleanup_task
from dashboard.api import dashboard_router
from slack.api import slack_router
from google_calendar.api import router as calendar_router
from user.api import user_router

# Import models to register them with SQLAlchemy
from auth.models import User, PasswordReset, SlackIntegration, GoogleCalendarIntegration
from dashboard.models import Meeting, Transcript


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting AfterTalk API...")
    
    # Create database tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created successfully")
    
    # Initialize 2FA cleanup task
    init_cleanup_task()
    print("✅ 2FA cleanup task initialized")
    
    yield
    
    # Shutdown
    print("🔄 Shutting down AfterTalk API...")


# Create FastAPI application
app = FastAPI(
    title="AfterTalk API",
    description="AI Meeting Summarization Platform API with 2FA Support",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify API is running"""
    return {
        "status": "healthy",
        "message": "AfterTalk API is running successfully",
        "version": "1.0.0",
        "features": ["2FA Support", "Meeting Intelligence", "AI Summaries"]
    }


# Include authentication routes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])

# Include 2FA routes
app.include_router(two_factor_router, prefix="/api", tags=["2FA Authentication"])

# Include dashboard routes
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])

# Include Slack integration routes
app.include_router(slack_router, prefix="/api/slack", tags=["Slack Integration"])

# Include calendar routes
app.include_router(calendar_router, tags=["Calendar"])

# Include user management routes
app.include_router(user_router, tags=["User Management"])


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": "Something went wrong. Please try again later."
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
