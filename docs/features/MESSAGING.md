# 💬 Messaging System

## Overview
A real-time direct messaging system allowing users to communicate privately. It supports text, emojis, and file attachments.

## Features
- **Real-time Updates**: Uses Socket.io for instant message delivery.
- **Media Support**: Users can send images and documents.
- **Read Receipts**: (Planned) Indicators when messages are viewed.
- **Conversation List**: Sorts threads by most recent activity.

## Architecture
- **Frontend**: React components `MessageBubble`, `MessageInput`, `ChatList`.
- **Backend**: `Message` model stores content, timestamp, sender, and receiver.
- **Socket Events**:
    - `join_room`: specific to conversation ID.
    - `send_message`: emits payload to room.
    - `receive_message`: client listener.