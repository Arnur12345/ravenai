# AfterTalk Backend API

FastAPI-based backend for the AfterTalk AI Meeting Summarization Platform with comprehensive authentication system.

## Features

- 🔐 **Complete Authentication System**
  - User registration and login
  - JWT-based authentication (access + refresh tokens)
  - Secure password hashing with bcrypt
  - Password reset functionality
  - User profile management

- 🚀 **Modern Technology Stack**
  - FastAPI for high-performance async API
  - SQLAlchemy with async support
  - PostgreSQL database
  - Pydantic for data validation
  - Comprehensive error handling

- 🛡️ **Security Features**
  - JWT tokens with proper expiration
  - Password strength validation
  - CORS protection
  - Input validation and sanitization
  - Protection against common attacks

## Quick Start

### 1. Prerequisites

- Python 3.8+
- PostgreSQL database
- Git

### 2. Installation

```bash
# Clone the repository
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# Update DATABASE_URL, SECRET_KEY, and other settings
```

### 4. Database Setup

```bash
# Make sure PostgreSQL is running
# Create your database (replace with your database name)
createdb aftertalk

# The application will automatically create tables on startup
```

### 5. Run the Application

```bash
# Start the FastAPI server
cd src
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/me` | Update user profile |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/verify-token` | Verify token validity |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

## API Usage Examples

### Register User

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Login User

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Access Protected Endpoint

```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Response Format

### Successful Authentication Response

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=john@example.com",
    "is_active": true,
    "is_email_verified": false,
    "created_at": "2024-12-19T10:30:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Error Response

```json
{
  "detail": "Invalid email or password",
  "message": "Authentication failed"
}
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL database connection string | Yes | - |
| `SECRET_KEY` | JWT signing secret key | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key | No | - |
| `SMTP_SERVER` | Email server for password reset | No | - |
| `SMTP_PORT` | Email server port | No | 587 |
| `SMTP_USERNAME` | Email username | No | - |
| `SMTP_PASSWORD` | Email password | No | - |

## Development

### Project Structure

```
backend/src/
├── main.py                 # FastAPI application entry point
├── settings.py             # Configuration management
├── database.py             # Database connection and session management
└── auth/
    ├── models.py           # SQLAlchemy database models
    ├── schemas.py          # Pydantic request/response schemas
    ├── crud.py             # Database operations
    ├── service.py          # Business logic layer
    ├── api.py              # FastAPI route handlers
    ├── utils.py            # JWT and password utilities
    ├── dependencies.py     # Authentication middleware
    └── exceptions.py       # Custom exception classes
```

### Adding New Endpoints

1. Define Pydantic schemas in `schemas.py`
2. Add database operations in `crud.py`
3. Implement business logic in `service.py`
4. Create API routes in `api.py`
5. Add route to main application in `main.py`

### Testing

The API includes comprehensive error handling and validation. Use the interactive documentation at `/docs` to test endpoints.

## Production Deployment

### Security Checklist

- [ ] Change `SECRET_KEY` to a strong, random value
- [ ] Use environment variables for all sensitive configuration
- [ ] Set up proper database with connection pooling
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper logging and monitoring
- [ ] Implement rate limiting
- [ ] Review CORS settings for production domains

### Docker Support

```dockerfile
# Example Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **Import Errors**
   - Ensure virtual environment is activated
   - Check all dependencies are installed
   - Verify Python path includes src directory

3. **Token Errors**
   - Check SECRET_KEY is set
   - Verify token hasn't expired
   - Ensure proper Authorization header format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the AfterTalk platform. See main project for license information. 