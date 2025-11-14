# Real-Time Chat Application

A full-stack real-time chat application built with modern web technologies, featuring friend requests, real-time messaging, and WebSocket communication.

## 🏗️ Architecture Overview

This project follows a **monorepo architecture** using Turborepo with clear separation of concerns:

```
chat-application/
├── apps/
│   ├── frontend/          # Next.js App Router (TypeScript + Tailwind CSS)
│   ├── backend/           # Express.js REST API Server
│   └── ws/                # WebSocket Server (Socket.IO + Redis Pub/Sub)
├── packages/
│   ├── database/          # Shared Prisma Client & Schema
│   └── ui/                # Shared UI Components (shadcn/ui)
└── turbo.json             # Turborepo configuration
```

## ✨ Features

### Core Features
- ✅ **User Authentication**: Signup/Login with JWT-based authentication
- ✅ **Friend Request System**: Send, receive, accept, and reject friend requests
- ✅ **Real-time Notifications**: Instant notifications for friend requests via WebSocket
- ✅ **Real-time Messaging**: Live chat with friends using WebSocket and Redis Pub/Sub
- ✅ **Dashboard**: WhatsApp-like interface with friend list and chat interface
- ✅ **Message History**: Persistent message storage with PostgreSQL
- ✅ **Typing Indicators**: See when friends are typing

### Technical Highlights
- 🔐 JWT authentication with HTTP-only cookies
- 🔄 Real-time communication via Socket.IO
- 📡 Redis Pub/Sub for multi-instance WebSocket scaling
- 💾 PostgreSQL database with Prisma ORM
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 📱 Responsive design

## 🛠️ Tech Stack

### Frontend (`apps/frontend`)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client

### Backend (`apps/backend`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password Hashing**: bcryptjs

### WebSocket Server (`apps/ws`)
- **Runtime**: Node.js
- **WebSocket Library**: Socket.IO
- **Language**: TypeScript
- **Pub/Sub**: Redis (via ioredis)
- **Authentication**: JWT verification

### Database (`packages/database`)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrate

## 📁 Project Structure

```
apps/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   └── dashboard/         # Dashboard page
│   ├── features/              # Feature-based components
│   │   └── dashboard/
│   │       └── components/    # Chat components
│   ├── contexts/              # React contexts (WebSocket)
│   └── lib/                   # Utilities (axios config)
│
├── backend/
│   └── src/
│       ├── controllers/       # Request handlers
│       ├── routes/            # API routes
│       ├── middleware/        # Auth & validation middleware
│       ├── schemas/           # Zod validation schemas
│       └── index.ts           # Server entry point
│
├── ws/
│   └── src/
│       ├── events/            # WebSocket event handlers
│       │   ├── messageEvents.ts
│       │   ├── friendEvents.ts
│       │   └── typingEvents.ts
│       └── index.ts           # WebSocket server entry
│
└── packages/
    ├── database/
    │   └── prisma/
    │       ├── schema.prisma  # Database schema
    │       └── migrations/    # Database migrations
    └── ui/                    # Shared UI components
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Redis instance (Upstash or local)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chat-application
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Create `.env` files in each app directory based on the `.env.example` files:

**`packages/database/.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/chatapp
```

**`apps/backend/.env`**
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/chatapp
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:3000
```

**`apps/ws/.env`**
```env
WS_PORT=8000
REDIS_URL=rediss://default:password@your-redis-host:6379
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://localhost:3000
```

**`apps/frontend/.env`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

4. **Set up the database**
```bash
cd packages/database
pnpm prisma migrate dev
pnpm prisma generate
```

### Running the Application

You can run all services simultaneously from the root:

```bash
pnpm dev
```

Or run each service individually:

**Backend API Server**
```bash
cd apps/backend
pnpm dev
# Runs on http://localhost:5000
```

**WebSocket Server**
```bash
cd apps/ws
pnpm dev
# Runs on ws://localhost:8000
```

**Frontend**
```bash
cd apps/frontend
pnpm dev
# Runs on http://localhost:3000
```

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login user

### Friend Requests
- `POST /friend-request` - Send a friend request
- `GET /friend-request/sent` - Get sent friend requests
- `GET /friend-request/incoming` - Get received friend requests
- `POST /friend-request/respond` - Accept or reject a friend request

### Friends
- `GET /friends` - Get list of friends

### Messages
- `POST /messages` - Send a message
- `GET /messages/:friendId` - Get message history with a friend
- `GET /messages/unread/count` - Get unread message count

## 🔌 WebSocket Events

### Client → Server
- `send_message` - Send a message to a friend
- `typing` - Notify friend that user is typing
- `stop_typing` - Notify friend that user stopped typing
- `friend_request_sent` - Notify when friend request is sent
- `friend_request_accepted` - Notify when friend request is accepted

### Server → Client
- `receive_message` - Receive a new message
- `friend_request_received` - Receive a friend request notification
- `friend_request_accepted` - Receive friend request acceptance notification
- `typing` - Friend is typing
- `stop_typing` - Friend stopped typing

## 🗄️ Database Schema

### User
- id, name, username, email, password
- Relations: sentRequests, receivedRequests, friendships, messages

### FriendRequest
- id, fromId, toId, status (pending/accepted/declined)
- Relations: from (User), to (User)

### Friendship
- id, userAId, userBId, friendSince
- Relations: userA (User), userB (User)

### Message
- id, content, senderId, recipientId, isRead, createdAt
- Relations: sender (User), recipient (User)

## 🎨 UI Components

The application uses shadcn/ui components:
- Avatar, Button, Input, Tabs
- Dialog, Toast notifications
- Custom chat components (ChatWindow, ChatSideBar, MessageList)

## 🔐 Authentication Flow

1. User signs up with name, username, email, and password
2. Password is hashed using bcryptjs
3. JWT token is generated and stored in HTTP-only cookie
4. Token is verified on protected routes via middleware
5. WebSocket connections authenticate using the same JWT

## 🌐 Real-time Communication

1. **WebSocket Connection**: Client connects with JWT token
2. **User Rooms**: Each user joins a personal room (userId)
3. **Redis Pub/Sub**: Socket.IO adapter uses Redis for multi-instance scaling
4. **Event Broadcasting**: Events are emitted to specific user rooms
5. **Message Delivery**: Messages are stored in DB and broadcast via WebSocket

## 📝 Development Notes

### Adding New Features
1. Update Prisma schema in `packages/database/prisma/schema.prisma`
2. Run `pnpm prisma migrate dev` to create migration
3. Add backend routes and controllers in `apps/backend/src`
4. Add WebSocket events in `apps/ws/src/events`
5. Update frontend components in `apps/frontend`

### Code Quality
- TypeScript for type safety
- Zod for runtime validation
- ESLint for code linting
- Prettier for code formatting

## 🚧 Future Enhancements

Potential features to add:
- [ ] Group chats
- [ ] File/image sharing
- [ ] Voice messages
- [ ] Video calls
- [ ] Message reactions
- [ ] Read receipts
- [ ] Online/offline status
- [ ] Message search
- [ ] User profiles
- [ ] Dark mode

## 📄 License

This project is part of a skill evaluation assignment.

## 👥 Author

Built as part of a Full-Stack Developer assignment.
