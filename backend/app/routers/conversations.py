from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.all_schemas import (
    ConversationResponse, ConversationCreateRequest,
    MessageResponse, MessageSendRequest
)
from app.core.dependencies import get_current_user
from app.websocket.manager import manager

router = APIRouter(prefix="/conversations", tags=["Conversations"])

def format_message_dict(m: Message) -> dict:
    return {
        "id": m.id,
        "conversationId": m.conversation_id,
        "senderId": m.sender_id,
        "senderName": m.sender_name,
        "senderAvatar": m.sender_avatar,
        "text": m.text,
        "timestamp": m.timestamp,
        "date": m.date or "Today",
        "status": m.status,
        "type": m.type,
        "mediaUrl": m.media_url,
        "fileName": m.file_name,
        "fileSize": m.file_size,
        "duration": m.duration,
        "caption": m.caption,
        "isPinned": m.is_pinned,
        "isEdited": m.is_edited,
        "isForwarded": m.is_forwarded,
        "replyTo": m.reply_to,
        "reactions": m.reactions or []
    }

def format_conversation_dict(c: Conversation, last_msg: Optional[Message] = None) -> dict:
    last_msg_dict = format_message_dict(last_msg) if last_msg else None
    return {
        "id": c.id,
        "type": c.type,
        "participantId": c.participant_id,
        "groupId": c.group_id,
        "name": c.name,
        "avatar": c.avatar,
        "memberCount": c.member_count,
        "isPinned": c.is_pinned,
        "isMuted": c.is_muted,
        "unreadCount": c.unread_count,
        "isTyping": False,
        "typingUser": None,
        "lastMessage": last_msg_dict,
        "draft": c.draft or "",
        "tags": c.tags or []
    }

@router.get("", response_model=List[dict])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Conversation).order_by(desc(Conversation.is_pinned), desc(Conversation.updated_at))
    )
    conversations = result.scalars().all()
    
    response = []
    for c in conversations:
        # Get latest message
        msg_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == c.id)
            .order_by(desc(Message.created_at))
            .limit(1)
        )
        last_msg = msg_result.scalar_one_or_none()
        response.append(format_conversation_dict(c, last_msg))

    return response

@router.post("", response_model=dict)
async def create_conversation(
    req: ConversationCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conv_id = f"conv_{int(datetime.utcnow().timestamp())}"
    new_conv = Conversation(
        id=conv_id,
        type=req.type,
        participant_id=req.participantId,
        name=req.name,
        avatar=req.avatar,
        tags=req.tags or []
    )
    db.add(new_conv)
    await db.commit()
    await db.refresh(new_conv)
    return format_conversation_dict(new_conv)

@router.get("/{conversation_id}", response_model=dict)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    msg_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(desc(Message.created_at))
        .limit(1)
    )
    last_msg = msg_result.scalar_one_or_none()
    return format_conversation_dict(conv, last_msg)

@router.patch("/{conversation_id}/pin")
async def toggle_pin_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conv.is_pinned = not conv.is_pinned
    await db.commit()
    return {"id": conv.id, "isPinned": conv.is_pinned}

@router.patch("/{conversation_id}/mute")
async def toggle_mute_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conv.is_muted = not conv.is_muted
    await db.commit()
    return {"id": conv.id, "isMuted": conv.is_muted}

@router.patch("/{conversation_id}/read")
async def mark_conversation_read(
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = result.scalar_one_or_none()
    if conv:
        conv.unread_count = 0
        await db.commit()
    return {"success": True}

@router.get("/{conversation_id}/messages", response_model=List[dict])
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    messages = result.scalars().all()
    return [format_message_dict(m) for m in messages]

@router.post("/{conversation_id}/messages", response_model=dict)
async def send_message(
    conversation_id: str,
    req: MessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conv_result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = conv_result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    now = datetime.utcnow()
    time_str = now.strftime("%I:%M %p")
    msg_id = f"msg_{int(now.timestamp() * 1000)}"

    new_msg = Message(
        id=msg_id,
        conversation_id=conversation_id,
        sender_id=current_user.id,
        sender_name=current_user.name,
        sender_avatar=current_user.avatar,
        text=req.text or req.caption or (f"Voice note ({req.duration or '0:15'})" if req.type == "audio" else req.fileName or ""),
        timestamp=time_str,
        date="Today",
        status="sent",
        type=req.type,
        media_url=req.mediaUrl,
        file_name=req.fileName,
        file_size=req.fileSize,
        duration=req.duration,
        caption=req.caption,
        reply_to=req.replyTo.dict() if req.replyTo else None,
        reactions=[]
    )
    db.add(new_msg)
    conv.updated_at = now
    await db.commit()
    await db.refresh(new_msg)

    msg_dict = format_message_dict(new_msg)

    # Real-time WebSocket broadcast to other participants
    await manager.broadcast_to_conversation(
        conversation_id=conversation_id,
        message={"event": "chat.message", "data": msg_dict},
        exclude_user_id=current_user.id
    )

    return msg_dict
