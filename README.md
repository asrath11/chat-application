# Real-Time Chat Application

> **Full-Stack Developer Assignment Submission**

A production-ready real-time chat application similar to WhatsApp, featuring user authentication, friend request system, and real-time messaging with WebSocket and Redis Pub/Sub.

## 🧩 Assignment Overview

This project demonstrates a complete implementation of a real-time chat application following modern development practices and clean architecture principles. Built as a monorepo using Turborepo, it showcases:

- **Monorepo Architecture**: Clear separation of concerns across frontend, backend, and WebSocket services
- **Real-time Communication**: WebSocket integration with Redis Pub/Sub for scalable messaging
- **Modern Tech Stack**: Next.js 15, Express.js, Socket.IO, PostgreSQL, and Redis
- **Production-Ready Features**: JWT authentication, friend request system, typing indicators, and message persistence

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

### ✅ Core Features (Assignment Requirements)

All required features have been fully implemented:

- ✅ **User Authentication**: Complete signup/login flow with JWT-based authentication
- ✅ **Friend Request System**:
  - Send friend requests to other users
  - Receive and view incoming friend requests
  - Accept or reject friend requests
  - View sent friend requests with status tracking
- ✅ **Real-time Notifications**:
  - Toast notifications for incoming friend requests
  - Real-time updates when friend requests are accepted
  - WebSocket-based notification delivery
- ✅ **Real-time Messaging**:
  - Live chat with accepted friends using WebSocket
  - Redis Pub/Sub for scalable multi-instance messaging
  - Message persistence in PostgreSQL
  - Message history retrieval
- ✅ **WhatsApp-like Dashboard**:
  - Friend list sidebar
  - Chat interface with message bubbles
  - Responsive design for mobile and desktop

### 🎁 Bonus Features Implemented

- ✅ **Typing Indicators**: Real-time typing status for active conversations
- ✅ **Unread Message Count**: Track and display unread messages per conversation
- ✅ **Message Timestamps**: Display when messages were sent
- ✅ **Toast Notifications**: User-friendly notifications using shadcn/ui toast component

### 💡 Creative Feature: Enhanced Friend Request Management

**Unique Implementation**: Comprehensive friend request tracking system with:

- Separate views for sent and received friend requests
- Real-time status updates (pending → accepted/declined)
- Visual indicators for request states
- Ability to view all sent requests and their current status
- Automatic friend list updates when requests are accepted

This goes beyond basic friend request functionality by providing complete visibility and management of the entire friend request lifecycle.

### 🏗️ Technical Highlights

- 🔐 **Security**: JWT authentication with HTTP-only cookies, password hashing with bcryptjs
- 🔄 **Real-time**: Socket.IO with Redis adapter for horizontal scaling
- 📡 **Scalability**: Redis Pub/Sub enables multiple WebSocket server instances
- 💾 **Data Persistence**: PostgreSQL with Prisma ORM for type-safe database operations
- 🎨 **Modern UI**: Tailwind CSS with shadcn/ui component library
- 📱 **Responsive**: Mobile-first design approach
- 🧩 **Monorepo**: Turborepo for efficient build orchestration and code sharing
- 🔍 **Type Safety**: Full TypeScript implementation across all services
- ✅ **Validation**: Zod schemas for runtime type validation

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
git clone https://github.com/asrath11/chat-application.git
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
- `friend_request_sent` - Notify when friend request is sent
- `friend_request_accepted` - Notify when friend request is accepted

### Server → Client

- `receive_message` - Receive a new message
- `friend_request_received` - Receive a friend request notification
- `friend_request_accepted` - Receive friend request acceptance notification

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

## ✅ Assignment Checklist

### Required Components

- ✅ **apps/frontend**: Next.js App Router with TypeScript and Tailwind CSS
- ✅ **apps/backend**: Express.js REST API with JWT authentication
- ✅ **apps/ws**: WebSocket server with Socket.IO and Redis Pub/Sub
- ✅ **packages/database**: Shared Prisma client and schema

### Required Features

- ✅ Signup/Login functionality
- ✅ Friend request flow (send, receive, accept, reject)
- ✅ Notification system for incoming requests
- ✅ Real-time messaging using WebSocket and Redis Pub/Sub
- ✅ Dashboard with friend list and chat interface

### Bonus Features

- ✅ Unread message tracking
- ✅ Enhanced friend request management (creative feature)

### Code Quality

- ✅ Clean monorepo architecture with Turborepo
- ✅ TypeScript throughout the entire codebase
- ✅ Proper separation of concerns
- ✅ Environment variable configuration
- ✅ Database migrations with Prisma
- ✅ Comprehensive README documentation

## 🚧 Future Enhancements

Potential features for production deployment:

- [ ] Group chats
- [ ] File/image sharing
- [ ] Voice messages
- [ ] Video calls
- [ ] Message reactions
- [ ] Read receipts (double-tick system)
- [ ] Online/offline status indicators
- [ ] Message search functionality
- [ ] User profiles with bio and settings
- [ ] Dark mode theme
- [ ] Message encryption (E2E)
- [ ] Push notifications
- [ ] Message deletion/editing

## 📄 License

This project is part of a skill evaluation assignment.

## 👥 ASRATH

Built as part of a Full-Stack Developer assignment submission.

---

**Note**: This is a demonstration project showcasing full-stack development skills including real-time communication, database design, authentication, and modern web development practices.
