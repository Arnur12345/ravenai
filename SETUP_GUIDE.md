# AfterTalk Setup Guide

This guide will help you set up AfterTalk with real meeting transcription and AI functionality.

## Required API Keys

AfterTalk requires the following API keys to function properly:

### 1. Vexa.ai API Key (Required for Google Meet Integration)

**What it does**: Enables real-time transcription and bot joining for Google Meet meetings.

**How to get it**:
1. Visit [Vexa.ai](https://vexa.ai/get-started)
2. Sign up for an account
3. Navigate to your dashboard
4. Generate an API key
5. Copy the API key

**How to configure**:
```bash
# In docker-compose.yml, uncomment and set:
VEXA_ADMIN_KEY: your-actual-vexa-api-key-here
```

### 2. OpenAI API Key (Required for AI Summaries)

**What it does**: Generates intelligent meeting summaries and comprehensive notes.

**How to get it**:
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the API key

**How to configure**:
```bash
# In docker-compose.yml, uncomment and set:
OPENAI_API_KEY: your-actual-openai-api-key-here
```

### 3. Gemini API Key (Optional Alternative to OpenAI)

**What it does**: Alternative AI provider for summaries and notes generation.

**How to get it**:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

**How to configure**:
```bash
# In docker-compose.yml, uncomment and set:
GEMINI_API_KEY: your-actual-gemini-api-key-here
```

## Environment Configuration

### Docker Compose Setup (Recommended)

1. **Edit `docker-compose.yml`**:
   ```yaml
   backend:
     environment:
       # API Keys - UNCOMMENT AND SET FOR PRODUCTION
       VEXA_ADMIN_KEY: your-actual-vexa-api-key-here
       OPENAI_API_KEY: your-actual-openai-api-key-here
       # GEMINI_API_KEY: your-actual-gemini-api-key-here  # Optional
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

### Manual Environment Setup

If you prefer to use environment variables:

1. **Create `.env` file in the backend directory**:
   ```bash
   # Backend API Keys
   VEXA_ADMIN_KEY=your-actual-vexa-api-key-here
   OPENAI_API_KEY=your-actual-openai-api-key-here
   GEMINI_API_KEY=your-actual-gemini-api-key-here

   # Database
   DATABASE_URL=postgresql://aftertalk_user:aftertalk_password@localhost:5433/aftertalk

   # Security
   SECRET_KEY=your-super-secret-key-change-this-in-production
   ```

2. **Start services individually**:
   ```bash
   # Start database
   docker-compose up database -d

   # Start backend (from backend directory)
   cd backend
   python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

   # Start frontend (from aftertalk directory)
   cd aftertalk
   npm run dev
   ```

## Feature Overview

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Fully functional |
| Meeting Creation | ✅ Fully functional |
| Meeting Dashboard | ✅ Fully functional |
| Live Transcription | ✅ Real-time via Vexa.ai |
| Google Meet Integration | ✅ Real bot joining |
| AI Meeting Summaries | ✅ AI-powered analysis |
| Comprehensive Notes | ✅ AI-generated |
| Real-time Updates | ✅ Live sync |

## Troubleshooting

### Meeting Shows "Static Text" or "Starting..." Status

**Cause**: Missing or invalid API key configuration.

**Solution**:
1. Check if `VEXA_ADMIN_KEY` is set in your environment
2. Verify the API key is valid
3. Restart the backend service after setting the key

### Transcripts Not Updating

**Cause**: API key not configured or Vexa.ai service issues.

**Solution**: 
1. Verify `VEXA_ADMIN_KEY` is configured
2. Check backend logs for Vexa API errors
3. Ensure the Google Meet URL is accessible

### AI Summaries Not Generated

**Cause**: Missing OpenAI or Gemini API key.

**Solution**:
1. Configure `OPENAI_API_KEY` or `GEMINI_API_KEY`
2. Verify the API key has sufficient credits
3. Check backend logs for API errors

### Database Connection Issues

**Solution**:
```bash
# Reset the database
docker-compose down -v
docker-compose up database -d
# Wait for database to be ready, then start other services
```

## Application Features

- **Real Google Meet Integration**: Bot joins meetings automatically
- **Live Transcription**: Real-time speech-to-text from meeting audio
- **AI-Powered Summaries**: Intelligent analysis of meeting content
- **Comprehensive Notes**: AI-generated meeting documentation
- **User Authentication**: Secure login and user management
- **Real-time Dashboard**: Live updates and meeting management

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use secure methods to set production environment variables
3. **Database**: Change default database passwords in production
4. **Secret Key**: Generate a strong, unique secret key for production
5. **HTTPS**: Use HTTPS in production environments
6. **CORS**: Configure CORS origins for your production domain

## Support

If you encounter issues:

1. **Check the logs**:
   ```bash
   # Backend logs
   docker-compose logs backend

   # Frontend logs
   docker-compose logs frontend
   ```

2. **Verify configuration**:
   ```bash
   # Check environment variables
   docker-compose exec backend env | grep -E "(VEXA|OPENAI|GEMINI)"
   ```

3. **Database status**:
   ```bash
   # Check database connection
   docker-compose exec backend python -c "
   from src.database import engine
   from sqlalchemy import text
   with engine.connect() as conn:
       result = conn.execute(text('SELECT 1'))
       print('Database connected successfully')
   "
   ```

For additional support, please check the project documentation or create an issue in the repository. 