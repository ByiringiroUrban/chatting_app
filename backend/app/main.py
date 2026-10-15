import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.seed_data import seed_all_data
from app.websocket.manager import manager
from app.routers import (
    auth_router,
    conversations_router,
    messages_router,
    groups_router,
    statuses_router,
    channels_router,
    business_router,
    calls_router,
    ads_router,
    subscriptions_router,
    upload_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure upload folder exists, initialize DB tables, seed initial data
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await init_db()
    if settings.AUTO_SEED:
        async with AsyncSessionLocal() as session:
            await seed_all_data(session)
    yield
    # Shutdown logic (if any)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API and Real-Time WebSocket Service for Muraho Rwandan Chatting & Business Suite",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local vite and network clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads (voice notes, photos, documents)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount REST API Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(conversations_router, prefix=settings.API_V1_STR)
app.include_router(messages_router, prefix=settings.API_V1_STR)
app.include_router(groups_router, prefix=settings.API_V1_STR)
app.include_router(statuses_router, prefix=settings.API_V1_STR)
app.include_router(channels_router, prefix=settings.API_V1_STR)
app.include_router(business_router, prefix=settings.API_V1_STR)
app.include_router(calls_router, prefix=settings.API_V1_STR)
app.include_router(ads_router, prefix=settings.API_V1_STR)
app.include_router(subscriptions_router, prefix=settings.API_V1_STR)
app.include_router(upload_router, prefix=settings.API_V1_STR)

# ----------------- REAL-TIME WEBSOCKET ROUTE -----------------

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            event = data.get("event")
            payload = data.get("data", {})

            # 1. Real-time typing indicators
            if event == "chat.typing":
                conv_id = payload.get("conversationId")
                if conv_id:
                    await manager.broadcast_to_conversation(
                        conversation_id=conv_id,
                        message={
                            "event": "chat.typing",
                            "data": {
                                "conversationId": conv_id,
                                "userId": user_id,
                                "isTyping": payload.get("isTyping", True)
                            }
                        },
                        exclude_user_id=user_id
                    )

            # 2. Room membership
            elif event == "room.join":
                conv_id = payload.get("conversationId")
                if conv_id:
                    manager.join_room(conv_id, user_id)

            elif event == "room.leave":
                conv_id = payload.get("conversationId")
                if conv_id:
                    manager.leave_room(conv_id, user_id)

            # 3. WebRTC Call Signaling (Audio & Video Calling)
            elif event in ["call.offer", "call.answer", "call.ice_candidate", "call.reject", "call.end"]:
                target_user_id = payload.get("targetUserId")
                if target_user_id:
                    await manager.send_personal_message(
                        message={"event": event, "data": payload, "fromUserId": user_id},
                        user_id=target_user_id
                    )

    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"[WebSocket Error] {e}")
        await manager.disconnect(websocket, user_id)

# ----------------- HEALTH & ROOT CHECK -----------------

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "documentation": "/docs",
        "database": "Neon PostgreSQL (or local SQLite development fallback)"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
