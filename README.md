# Blue Horn Tech - Mini EVV Logger

A comprehensive Mini EVV Logger designed for mobile workers to manage schedules, clock in/out with geolocation, and track task completion.

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (Required for local setup)
- **Git** (To clone the repository)

### 🐳 Docker Compose Setup (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bluehorntech
   ```

2. **Start all services with Docker Compose:**
   ```bash
   docker compose up -d
   ```

   This will start:
   - **PostgreSQL Database** on port 5432
   - **Backend API** on port 8080
   - **Frontend App** on port 3000

3. **Run database migrations:**
   ```bash
   # Wait for database to be ready, then run migrations
   docker compose exec backend make migrate-up
   ```

4. **Check service status:**
   ```bash
   docker compose ps
   ```

5. **View logs (optional):**
   ```bash
   # All services
   docker compose logs -f
   
   # Specific service
   docker compose logs -f backend
   docker compose logs -f frontend
   docker compose logs -f db
   ```

6. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **Health Check**: http://localhost:8080/health

### 🛑 Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (database data)
docker compose down -v

# Stop and remove everything
docker compose down --rmi all --volumes --remove-orphans
```

### 🔄 Development Workflow
```bash
# Start services in background
docker compose up -d

# View logs in real-time
docker compose logs -f

# Restart a specific service
docker compose restart backend

# Rebuild and restart after code changes
docker compose up -d --build
```

## 🏗️ Manual Setup (Alternative)

If you prefer to run services locally without Docker:

### Prerequisites
- **Go 1.24.4+** (Backend)
- **Node.js 18+** (Frontend)
- **PostgreSQL 13+** (Database)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Go dependencies:**
   ```bash
   go mod download
   ```

3. **Set up PostgreSQL database:**
   ```bash
   # Using default credentials from config
   createdb bluehorntech
   
   # Or update config/config.yaml with your database details
   ```

4. **Run database migrations:**
   ```bash
   # Install migrate CLI tool first
   go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
   
   # Run migrations
   make migrate-up
   ```

5. **Start the backend server:**
   ```bash
   # Development mode with hot reload
   air
   
   # Or standard Go run
   go run cmd/main.go
   ```

   The backend will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## 🌐 Live Demo

### Frontend Application
**URL**: https://bluehorntech.vercel.app/

### Backend API
**URL**: https://bluehorntech-production.up.railway.app/

### ⚠️ Database Reset
**For live demo configuration or database resets, please contact me first.**

## 🔧 Environment Configuration

### Docker Compose (Automatic)
The Docker Compose setup automatically configures:
- **Database**: PostgreSQL with proper credentials and migrations
- **Backend**: Go service with hot reload and proper networking
- **Frontend**: React app with API connection to backend
- **Networking**: All services can communicate with each other

### Manual Setup Configuration

**Backend** (`backend/config/config.yaml`):
```yaml
server:
  host: "0.0.0.0"
  port: "8080"
  env: "development"

database:
  url: "postgres://postgres:password@localhost:5432/bluehorntech?sslmode=disable"
  maxOpenConnection: 25
  maxIdleConnection: 10

service:
  maxDistanceError: 10000.0       # 10 km - very permissive for development
  maxDistanceWarning: 5000.0      # 5 km - warning threshold
  maxEarlyClockInSeconds: 900     # 15 minutes early
  maxLateClockInSeconds: 1800     # 30 minutes late
  minVisitDurationSeconds: 1800   # 30 minutes minimum
```

> **⚠️ Important**: Change the distance values in `config.yaml` to maximum numbers (e.g., 10000.0 meters) to avoid errors with random seed data coordinates. The default values are set to be very permissive for development purposes.

**Frontend** (`frontend/src/services/api.ts`):
```typescript
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080'
```

## 🏗️ Tech Stack

### Backend
- **Language**: Go 1.24.4
- **Framework**: Gin (HTTP web framework)
- **Database**: PostgreSQL with SQLx
- **Configuration**: Viper
- **Migrations**: golang-migrate
- **Development**: Air (hot reload)
- **Architecture**: Clean architecture with layers (handlers → services → repositories)

### Frontend
- **Framework**: React 19.1.1 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Date Handling**: date-fns
- **Build Tool**: Create React App

### Database Schema
- **Users**: Basic user management
- **Schedules**: Service appointments with geolocation tracking
- **Tasks**: Individual tasks within schedules
- **Audit Trail**: Comprehensive timestamp and location tracking

## 🔑 Key Features

### Core Functionality
- **Schedule Management**: Create, view, and manage service appointments
- **Geolocation Tracking**: Clock in/out with GPS coordinates
- **Task Management**: Track completion status and reasons
- **Real-time Updates**: Live status changes and notifications
- **Mobile-First Design**: Optimized for field workers

### Business Logic
- **Distance Validation**: Prevents clock-in if too far from scheduled location
- **Time Constraints**: Enforces early/late clock-in limits
- **Duration Tracking**: Minimum visit duration requirements
- **Compliance Flags**: Track validation issues and compliance

## 🤔 Assumptions Made

### Technical Assumptions
1. **No Authentication Required**: This is a take-home assignment, so user authentication is simplified
2. **Geolocation Required**: Assumes modern browsers with GPS capabilities
3. **PostgreSQL Database**: Uses PostgreSQL-specific features and syntax
4. **Local Development**: Configured for local development environment
5. **Default User ID**: Uses hardcoded user ID (1) since there's no authentication system
6. **No Maps Integration**: Clock in/out locations only show coordinates, no map visualization (requires Map API integration later)

### Business Assumptions
1. **Field Service Context**: Designed for caregiver visiting client locations
2. **Time-Based Operations**: Schedules have specific start/end times
3. **Location Validation**: Workers must be within reasonable distance to clock in
4. **Task Accountability**: Workers must provide reasons for incomplete tasks
5. **Real-time Updates**: Status changes should be reflected immediately
6. **No Overlapping Schedules**: Assumes one worker cannot have multiple schedules at the same time
7. **Task Edit Limitations**: Once tasks are saved, they cannot be edited (simplified for development, requirements to be confirmed later)

### UX Assumptions
1. **Mobile-First**: Primary users are field workers on mobile devices
2. **Simple Interface**: Clean, intuitive design for quick task completion
3. **Error Handling**: User-friendly error messages for common issues
4. **Coordinate Display**: Users can work with latitude/longitude coordinates without map visualization

### Timezone Handling
Currently using UTC for all datetime operations. In production, this would be enhanced to:
- Store creator timezone with each schedule
- Handle "today" queries in the appropriate local timezone
- Support timezone-aware scheduling across regions

## 🚧 Development Commands

### Docker Compose (Recommended)
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Restart specific service
docker compose restart backend

# Rebuild after changes
docker compose up -d --build

# Stop all services
docker compose down
```

### Backend (Manual Setup)
```bash
# Database operations
make migrate-up          # Run migrations
make migrate-down        # Rollback one migration
make migrate-reset       # Reset database
make migrate-status      # Check migration status

# Development
air                      # Hot reload development
go run cmd/main.go       # Standard run
go test ./...            # Run tests
```

### Frontend (Manual Setup)
```bash
npm start                # Development server
npm build                # Production build
npm test                 # Run tests
npm run eject            # Eject from CRA (irreversible)
```

## 🔮 Future Improvements

### Short Term
1. **User Authentication**: JWT-based auth with role-based access
2. **Real-time Notifications**: WebSocket integration for live updates
3. **Offline Support**: Service Worker for offline functionality
4. **Image Upload**: Photo evidence for completed tasks
5. **Push Notifications**: Mobile push notifications for schedule reminders

### Medium Term
1. **Multi-User Support**: Team management and supervisor views
2. **Reporting Dashboard**: Analytics and performance metrics
3. **Calendar Integration**: Sync with external calendar systems
4. **Route Optimization**: Multi-location route planning
5. **Inventory Management**: Track parts and materials used

### Long Term
1. **Mobile App**: Native iOS/Android applications
2. **AI Integration**: Predictive maintenance and scheduling
3. **Advanced Analytics**: Machine learning for optimization
4. **API Documentation**: OpenAPI/Swagger documentation
5. **Microservices**: Break down into smaller, focused services

### Technical Debt
1. **Testing Coverage**: Add comprehensive unit and integration tests
2. **Error Handling**: Implement structured error handling and logging
3. **Performance**: Add caching layers and database optimization
4. **Security**: Implement rate limiting and input validation
5. **Monitoring**: Add health checks and performance monitoring
6. **Task Editing**: Implement proper task editing workflow after requirements are confirmed
7. **Maps Integration**: Add Map API (Google Maps, Mapbox, etc.) for location visualization
8. **Schedule Validation**: Add business logic to prevent overlapping schedules
9. **User Management**: Implement proper user authentication and authorization system

## 📱 API Endpoints

### Schedules
- `GET /api/v1/schedules` - List all schedules
- `GET /api/v1/schedules/today` - Get today's schedules with stats
- `GET /api/v1/schedules/:id` - Get schedule details
- `POST /api/v1/schedules/:id/start` - Clock in
- `POST /api/v1/schedules/:id/end` - Clock out

### Tasks
- `PATCH /api/v1/tasks/:id` - Update task status

## 🐛 Troubleshooting

### Docker Compose Issues
1. **Port Conflicts**: Ensure ports 3000, 8080, and 5432 are available
2. **Service Startup**: Check logs with `docker compose logs -f`
3. **Database Connection**: Wait for database health check to complete
4. **Volume Issues**: Use `docker compose down -v` to reset volumes
5. **Network Issues**: Restart with `docker compose restart`

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and accessible
2. **Migration Errors**: Check database credentials and permissions
3. **CORS Issues**: Verify backend CORS configuration
4. **Geolocation**: Ensure HTTPS or localhost for GPS access
5. **Port Conflicts**: Check if ports 8080 (backend) and 3000 (frontend) are available

### Debug Mode
```bash
# Docker Compose debug
docker compose logs -f [service_name]

# Backend debug logging
export GIN_MODE=debug
go run cmd/main.go

# Frontend debug
REACT_APP_DEBUG=true npm start
```

## 📄 License

This project is created as a take-home assignment for Blue Horn Tech. All rights reserved.

---

**Happy Coding! 🚀** 
