# Feedback Board Application

A real-time feedback board application built with NestJS backend and Next.js frontend, featuring WebSocket communication for live admin notifications.

## Features

- 🎯 **User Feedback**: Simple feedback form for users to submit name and message
- 🛠️ **Admin Dashboard**: Real-time dashboard to view, manage, and delete feedback
- 🔐 **Authentication**: JWT-based authentication with auto-registration
- ⚡ **Real-time Updates**: WebSocket integration for instant admin notifications
- 🐳 **Docker Support**: Full containerized setup with docker-compose
- 🌐 **CORS Enabled**: Cross-origin requests supported
- 🧪 **Testing**: Comprehensive unit tests for backend services with Jest

## Demo

🎥 **Live Demo**: [Watch the application in action](https://www.loom.com/share/3380c72667ab4f01953abc9ce9658840?sid=02192cca-fade-40ae-af43-e54582f80ce2)

*See the complete feedback board workflow including user registration, feedback submission, admin dashboard, and real-time notifications*

## Screenshots

### Feedback Board Dashboard

![Feedback Board](./user_feedback.png)

*User feedback interface where users can submit feedback with name, message, and category*

### Admin Dashboard

![Admin Dashboard](./admin_dashboard.png)

*Real-time admin dashboard showing all feedback with management capabilities*

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Socket.IO Client
- **Backend**: NestJS, TypeScript, TypeORM, JWT, Socket.IO
- **Database**: MySQL 8.0
- **Testing**: Jest, @testing-library/react
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

## User Registration

The application uses auto-registration - new users are automatically created on first login:

- Users with "admin" in their username are automatically granted admin privileges
- All other users are regular users who can submit feedback

## Application Flow

1. **Login Page** (`/login`): Single login form for all users
2. **User Dashboard** (`/feedback`): Submit feedback form for regular users  
3. **Admin Dashboard** (`/admin`): Real-time feedback management for admins

## API Endpoints

- `POST /auth/login` - User authentication
- `GET /feedback` - Get all feedback (admin only)
- `POST /feedback` - Submit new feedback
- `DELETE /feedback/:id` - Delete feedback (admin only)
- `PUT /feedback/:id/mark-inappropriate` - Mark feedback as inappropriate

## WebSocket Events

- `join-admin-room` - Join admin room for notifications
- `new-feedback` - Real-time feedback notification to admins

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

## Testing

The application includes comprehensive unit tests for both backend and frontend services using Jest.

### Quick Test Commands

```bash
# Run all backend tests (from root directory)
npm run test:backend

# Run backend tests with coverage
npm run test:backend:coverage

# Run backend tests in watch mode
npm run test:backend:watch

# Run frontend tests
npm run test:frontend

# Run frontend tests in watch mode  
npm run test:frontend:watch

# Run all tests (backend + frontend)
npm run test:all
```

### Backend Testing

The backend includes comprehensive unit tests covering all core services and controllers.

**Available Test Commands:**

```bash
# From root directory
npm run test:backend                    # Run all backend tests
npm run test:backend:coverage           # Run with coverage report
npm run test:backend:watch              # Run in watch mode

# From backend directory
cd backend
npm test                                # Run all tests
npm run test:watch                      # Watch mode
npm run test:cov                        # Coverage report
npm run test:debug                      # Debug mode
npm test -- --testPathPattern="auth"    # Run specific test pattern
npm test -- --verbose                   # Verbose output
```

**Test Coverage:**

- ✅ **AuthService Tests** (9 tests): Login validation, user creation, admin detection, password verification, error handling
- ✅ **FeedbackService Tests** (10 tests): CRUD operations, user filtering, inappropriate marking, WebSocket notifications
- ✅ **WebSocketGateway Tests** (6 tests): Connection handling, JWT authentication, admin room management, error scenarios
- ✅ **Controller Tests**: Auth and Feedback controllers with proper dependency injection mocking

**Current Test Results:**

```text
Backend:  ❌ FAILED (3 tests failing, 39 tests passing)
Frontend: ✅ PASSED (5 tests passing)

Issues: Controller tests need response format alignment
Status: Core functionality tested, minor fixes needed
```

**Test Files:**

- `src/auth/auth.service.spec.ts` - Authentication business logic
- `src/auth/auth.controller.spec.ts` - Authentication endpoints
- `src/feedback/feedback.service.spec.ts` - Feedback CRUD operations
- `src/feedback/feedback.controller.spec.ts` - Feedback API endpoints
- `src/websocket/websocket.gateway.spec.ts` - Real-time communication

### Frontend Testing

Frontend testing is implemented with Jest and React Testing Library for component testing.

**Available Test Commands:**

```bash
# From root directory
npm run test:frontend                   # Run all frontend tests
npm run test:frontend:watch             # Watch mode
npm run test:frontend:coverage          # Coverage report

# From frontend directory
cd frontend
npm test                                # Run all tests
npm run test:watch                      # Watch mode
npm run test:coverage                   # Coverage report
npm test -- --testNamePattern="Navigation"  # Run specific tests
```

**Test Coverage:**

- ✅ **Navigation Component Tests** (3 tests): Authentication states, user roles, navigation links
- ✅ **LoginForm Component Tests** (2 tests): Form rendering, basic form validation
- 🔄 **Additional Tests**: More comprehensive component and integration tests can be added

**Current Test Results:**

```text
Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
Coverage:    Basic component rendering and props validation
```

**Frontend Test Setup:**

- **Jest Configuration**: Optimized for Next.js 15 with TypeScript support
- **Testing Library**: React Testing Library for component interaction testing
- **Mocking**: Comprehensive mocks for Next.js router, API calls, and localStorage
- **Coverage**: Basic test coverage for core components

**Test Files:**

- `src/components/__tests__/Navigation.test.tsx` - Navigation component behavior  
- `src/components/forms/__tests__/LoginForm.test.tsx` - Login form rendering and validation

**Notes:**

- Frontend tests focus on component rendering and basic user interactions
- API calls are mocked to prevent network dependencies during testing
- Tests use simplified assertions for better maintainability
- Complex integration tests can be added as needed for additional coverage

### Test Scripts

The project includes convenient test scripts for easy execution:

```bash
# Comprehensive testing (all tests)
./test-all.sh

# Backend testing with detailed output
./test-backend.sh

# Backend testing with coverage
./test-backend.sh --coverage

# Frontend testing with detailed output
./test-frontend.sh

# Frontend testing with coverage
./test-frontend.sh --coverage

# Frontend testing in watch mode
./test-frontend.sh --watch
```

**Script Features:**

- ✅ **Colored Output**: Clear visual feedback with success/failure indicators
- 📊 **Coverage Reports**: Detailed code coverage analysis
- 👀 **Watch Mode**: Automatic re-running on file changes
- 📋 **Help Text**: Built-in command suggestions and tips
- 🎯 **Summary Reports**: Comprehensive test result summaries

## Quick Start

1. **Clone and setup**:

   ```bash
   git clone <repository-url>
   cd feedback-board
   cp .env.example .env
   # Update .env with your configuration
   ```

2. **Start the application**:

   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build and start all services (MySQL, Backend, Frontend)
   - Set up the database with initial schema
   - Make the application available at <http://localhost:3000>

3. **Run tests** (optional):

   ```bash
   npm run test:all       # All tests
   npm run test:backend   # Backend only
   npm run test:frontend  # Frontend only
   ```

**Alternative Docker Commands:**

```bash
# Start in detached mode (background)
docker-compose up --build -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Clean up (remove volumes and images)
docker-compose down -v --rmi all
```
