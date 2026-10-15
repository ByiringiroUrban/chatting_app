from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.all_schemas import MessageEditRequest, ReactionRequest, ForwardRequest
from app.core.dependencies import get_current_user
from app.websocket.manager import manager

router = APIRouter(prefix="/messages", tags=["Messages"])

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

@router.patch("/{message_id}")
async def edit_message(
    message_id: str,
    req: MessageEditRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    msg.text = req.text
    msg.is_edited = True
    await db.commit()
    await db.refresh(msg)

    # Broadcast message update via WS
    await manager.broadcast_to_conversation(
        conversation_id=msg.conversation_id,
        message={"event": "chat.message_edited", "data": format_message_dict(msg)}
    )
    return format_message_dict(msg)

@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    conv_id = msg.conversation_id
    await db.delete(msg)
    await db.commit()

    # Broadcast message deletion via WS
    await manager.broadcast_to_conversation(
        conversation_id=conv_id,
        message={"event": "chat.message_deleted", "data": {"messageId": message_id, "conversationId": conv_id}}
    )
    return {"success": True, "messageId": message_id}

@router.post("/{message_id}/reaction")
async def toggle_reaction(
    message_id: str,
    req: ReactionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    reactions = list(msg.reactions or [])
    found = False
    
    for r in reactions:
        if r.get("emoji") == req.emoji:
            found = True
            users = r.get("users", [])
            if current_user.id in users:
                users.remove(current_user.id)
                r["count"] = max(0, r["count"] - 1)
            else:
                users.append(current_user.id)
                r["count"] = r["count"] + 1
            r["users"] = users
            break
            
    if not found:
        reactions.append({
            "emoji": req.emoji,
            "count": 1,
            "users": [current_user.id]
        })
        
    # Filter out empty reactions
    msg.reactions = [r for r in reactions if r.get("count", 0) > 0]
    await db.commit()
    await db.refresh(msg)

    # Broadcast reaction via WS
    await manager.broadcast_to_conversation(
        conversation_id=msg.conversation_id,
        message={"event": "chat.reaction", "data": {"messageId": msg.id, "reactions": msg.reactions}}
    )
    return {"messageId": msg.id, "reactions": msg.reactions}

@router.patch("/{message_id}/pin")
async def toggle_pin_message(
    message_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Message).where(Message.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    msg.is_pinned = not msg.is_pinned
    await db.commit()
    return {"id": msg.id, "isPinned": msg.is_pinned}

@router.post("/{message_id}/forward")
async def forward_message(
    message_id: str,
    req: ForwardRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Message).where(Message.id == message_id))
    orig_msg = result.scalar_one_or_none()
    if not orig_msg:
        raise HTTPException(status_code=404, detail="Message not found")

    now = datetime.utcnow()
    time_str = now.strftime("%I:%M %p")
    new_msg_id = f"msg_fwd_{int(now.timestamp() * 1000)}"

    forwarded_msg = Message(
        id=new_msg_id,
        conversation_id=req.targetChatId,
        sender_id=current_user.id,
        sender_name=current_user.name,
        sender_avatar=current_user.avatar,
        text=orig_msg.text,
        timestamp=time_str,
        date="Today",
        status="delivered",
        type=orig_msg.type,
        media_url=orig_msg.media_url,
        file_name=orig_msg.file_name,
        file_size=orig_msg.file_size,
        duration=orig_msg.duration,
        caption=orig_msg.caption,
        is_forwarded=True,
        reactions=[]
    )
    db.add(forwarded_msg)
    
    # Update target conversation timestamp
    conv_result = await db.execute(select(Conversation).where(Conversation.id == req.targetChatId))
    target_conv = conv_result.scalar_one_or_none()
    if target_conv:
        target_conv.updated_at = now

    await db.commit()
    await db.refresh(forwarded_msg)
    return format_message_dict(forwarded_msg)
