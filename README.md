# Feedback Board Application

A real-time feedback board application built with NestJS backend and Next.js frontend, featuring WebSocket communication for live admin notifications.

## Features

- 🎯 **User Feedback**: Simple feedback form for users to submit name and message
- 🛠️ **Admin Dashboard**: Real-time dashboard to view, manage, and delete feedback
- 🔐 **Authentication**: JWT-based authentication with auto-registration
- ⚡ **Real-time Updates**: WebSocket integration for instant admin notifications
- 🐳 **Docker Support**: Full containerized setup with docker-compose
- 🌐 **CORS Enabled**: Cross-origin requests supported

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Socket.IO Client
- **Backend**: NestJS, TypeScript, TypeORM, JWT, Socket.IO
- **Database**: MySQL 8.0
- **Infrastructure**: Docker, Docker Compose

## Environment Configuration

This project uses a centralized `.env` file at the root directory that is shared across all services.

### Setup Instructions

1. **Copy the environment template**:

   ```bash
   cp .env.example .env
   ```

2. **Update the environment variables** in `.env` as needed:

   ```bash
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3307
   DB_USERNAME=feedback_user
   DB_PASSWORD=feedback_password
   DB_NAME=feedback_board

   # MySQL Root Password
   MYSQL_ROOT_PASSWORD=rootpassword

   # Application Configuration
   NODE_ENV=development

   # Backend Configuration
   BACKEND_PORT=3009
   PORT=3009

   # Frontend Configuration
   FRONTEND_PORT=3000
   FRONTEND_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3009

   # WebSocket Configuration
   WEBSOCKET_PORT=3009
   NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3009

   # JWT Configuration
   JWT_SECRET=your-secret-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   ```

3. **Frontend Environment Setup**:
   The frontend automatically loads environment variables from the root `.env` file via a symbolic link at `frontend/.env.local`. This link is already created and points to the root `.env` file.

4. **Run with Docker Compose**:

   ```bash
   # Start all services
   npm run dev

   # Or start in detached mode
   npm run dev:detach

   # View logs
   npm run logs

   # Stop all services
   npm run stop

   # Clean up (remove volumes and images)
   npm run clean
   ```

## Development

### Local Development (without Docker)

1. **Install dependencies**:

   ```bash
   npm run setup
   ```

2. **Start the database** (using Docker):

   ```bash
   docker-compose up mysql -d
   ```

3. **Start backend**:

   ```bash
   npm run backend:dev
   ```

4. **Start frontend** (in another terminal):

   ```bash
   npm run frontend:dev
   ```

### Available Scripts

- `npm run dev` - Start all services with Docker Compose
- `npm run dev:detach` - Start all services in detached mode
- `npm run stop` - Stop all Docker services
- `npm run clean` - Remove all containers, volumes, and images
- `npm run logs` - View logs from all services
- `npm run setup` - Install dependencies for both backend and frontend
- `npm run backend:dev` - Start backend in development mode
- `npm run frontend:dev` - Start frontend in development mode

## Application URLs

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:3009>
- **Database**: localhost:3307

## Default Users

The application includes default test users (for development):

**Admin Users**:

- Username: `admin1`, Password: `12`
- Username: `admin2`, Password: `12`

**Regular Users**:

- Username: `user1`, Password: `12`
- Username: `user2`, Password: `12`

## API Endpoints

- `POST /auth/login` - User authentication
- `GET /feedback` - Get all feedback (admin only)
- `POST /feedback` - Submit new feedback
- `DELETE /feedback/:id` - Delete feedback (admin only)
- `PUT /feedback/:id/mark-inappropriate` - Mark feedback as inappropriate

## WebSocket Events

- `join-admin-room` - Join admin room for notifications
- `new-feedback` - Real-time feedback notification to admins

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3307 |
| `DB_USERNAME` | Database username | feedback_user |
| `DB_PASSWORD` | Database password | feedback_password |
| `DB_NAME` | Database name | feedback_board |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | rootpassword |
| `NODE_ENV` | Node environment | development |
| `BACKEND_PORT` | Backend server port | 3009 |
| `PORT` | Alias for BACKEND_PORT | 3009 |
| `FRONTEND_PORT` | Frontend server port | 3000 |
| `FRONTEND_URL` | Frontend URL | <http://localhost:3000> |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | <http://localhost:3009> |
| `WEBSOCKET_PORT` | WebSocket server port | 3009 |
| `NEXT_PUBLIC_WEBSOCKET_URL` | Frontend WebSocket URL | <http://localhost:3009> |
| `JWT_SECRET` | JWT signing secret | your-secret-key-change-this-in-production |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |

## Project Structure

```
├── .env                    # Centralized environment configuration
├── .env.example           # Environment template
├── docker-compose.yml     # Docker services configuration
├── package.json          # Root package.json with scripts
├── init.sql              # Database initialization
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── feedback/     # Feedback module
│   │   ├── websocket/    # WebSocket gateway
│   │   └── main.ts       # Application entry point
│   └── package.json
└── frontend/             # Next.js frontend
    ├── src/
    │   ├── app/          # App router pages
    │   ├── components/   # Reusable components
    │   ├── lib/          # API clients and utilities
    │   └── types/        # TypeScript types
    └── package.json
```

## Notes

- The backend runs on port 3009 by default
- The frontend runs on port 3000 by default
- All services use the same centralized `.env` file
- WebSocket and HTTP API share the same port (3009)
- Auto-registration is enabled - users with "admin" in their username become admins
- Real-time notifications are sent to admin clients via WebSocket
