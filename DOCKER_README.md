# AfterTalk Docker Setup

This guide explains how to run AfterTalk using Docker containers with PostgreSQL database.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 8000, and 5432 available

### 1. Clone and Setup
```bash
git clone <repository-url>
cd aftertalk
```

### 2. Build and Run
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432 (if needed for external access)

## 📋 Services Overview

### 🗄️ Database (PostgreSQL 15)
- **Container**: `aftertalk-database`
- **Port**: 5432
- **Database**: `aftertalk`
- **User**: `aftertalk_user`
- **Password**: `aftertalk_password`
- **Volume**: `aftertalk_postgres_data` (persistent storage)

### 🔧 Backend (FastAPI)
- **Container**: `aftertalk-backend`
- **Port**: 8000
- **Health Check**: http://localhost:8000/health
- **Features**: 
  - Automatic database table creation
  - JWT authentication
  - CORS configured for frontend

### 🌐 Frontend (React Development Server)
- **Container**: `aftertalk-frontend`
- **Port**: 3000 (mapped to container port 3000)
- **Health Check**: http://localhost:3000/health
- **Features**:
  - React Router support
  - Gzip compression
  - Static asset caching
  - Security headers

## 🛠️ Configuration

### Environment Variables
The docker-compose.yml includes default configuration. For production, modify:

```yaml
# In docker-compose.yml under backend service
environment:
  SECRET_KEY: "your-production-secret-key"
  GEMINI_API_KEY: "your-gemini-api-key"
  # Add other production variables
```

### Database Configuration
- Database initialization is automatic
- Tables are created by FastAPI on startup
- Data persists in Docker volume `aftertalk_postgres_data`

## 📝 Available Commands

### Basic Operations
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Development Commands
```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec database psql -U aftertalk_user -d aftertalk
```

### Database Management
```bash
# Access database shell
docker-compose exec database psql -U aftertalk_user -d aftertalk

# Backup database
docker-compose exec database pg_dump -U aftertalk_user aftertalk > backup.sql

# Restore database
docker-compose exec -T database psql -U aftertalk_user -d aftertalk < backup.sql
```

## 🔍 Health Checks

All services include health checks:

```bash
# Check service status
docker-compose ps

# View health check logs
docker inspect aftertalk-backend --format='{{.State.Health}}'
docker inspect aftertalk-frontend --format='{{.State.Health}}'
docker inspect aftertalk-database --format='{{.State.Health}}'
```

## 🐛 Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs backend
```

**Database connection issues:**
```bash
# Check database is running
docker-compose ps database

# Test database connection
docker-compose exec database pg_isready -U aftertalk_user
```

**Port conflicts:**
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432

# Modify ports in docker-compose.yml if needed
```

**Frontend can't reach backend:**
- Check CORS_ORIGINS in backend environment
- Verify both services are on same network
- Check backend health endpoint: http://localhost:8000/health

### Reset Everything
```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all containers and images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up --build
```

## 🔒 Security Notes

### Production Deployment
- Change default passwords
- Use environment files for secrets
- Configure proper SECRET_KEY
- Set up SSL/TLS termination
- Configure firewall rules

### Default Credentials
- **Database User**: `aftertalk_user`
- **Database Password**: `aftertalk_password`
- **Database Name**: `aftertalk`

⚠️ **Change these in production!**

## 📊 Monitoring

### Health Endpoints
- **Backend**: http://localhost:8000/health
- **Frontend**: http://localhost:3000/health
- **Database**: Built-in PostgreSQL health check

### Logs
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend
```

## 🚀 Production Deployment

For production deployment:

1. **Use environment files**:
```bash
# Create .env file with production values
cp .env.example .env
# Edit .env with your values
```

2. **Use production compose file**:
```bash
# Create docker-compose.prod.yml with production settings
docker-compose -f docker-compose.prod.yml up -d
```

3. **Set up reverse proxy** (Traefik/other)
4. **Configure SSL certificates**
5. **Set up monitoring and logging**
6. **Configure backups**

## 📝 Notes

- Database data persists in Docker volumes
- Frontend is served by Vite development server
- Backend includes automatic database table creation
- All services include health checks and proper dependency management
- CORS is configured for local development

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify all services are healthy: `docker-compose ps`
3. Check network connectivity between services
4. Ensure ports are not in use by other applications 