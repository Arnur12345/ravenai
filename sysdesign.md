# Vexa System Design & Frontend Architecture

## System Overview

Vexa is a microservices-based real-time meeting transcription platform that allows users to create bots that join meetings and provide live transcriptions. The system consists of 6 main microservices orchestrated through Docker containers.

## Architecture Components

### Core Services

1. **API Gateway** (`services/api-gateway`) - Port 18056
   - Main entry point for all user operations
   - Routes requests to appropriate microservices
   - Handles CORS and request forwarding

2. **Admin API** (`services/admin-api`) - Port 18057  
   - User management and authentication (backend operations)
   - API token generation and management
   - Administrative operations

3. **Bot Manager** (`services/bot-manager`) - Port 8080
   - Meeting lifecycle management
   - Docker container orchestration for bots
   - Bot status monitoring

4. **Transcription Collector** (`services/transcription-collector`) - Port 8000
   - Transcript data aggregation
   - Meeting data management
   - Redis + PostgreSQL data merging

5. **WhisperLive** (`services/WhisperLive`)
   - Real-time speech-to-text transcription
   - WebSocket-based communication
   - CPU/GPU variants available

6. **Vexa Bot** (`services/vexa-bot`)
   - Meeting bot instances
   - Platform-specific implementations (Google Meet, Zoom, Teams)
   - Audio capture and transmission

### Supporting Infrastructure

- **PostgreSQL**: Primary database for persistent data
- **Redis**: Real-time data streaming and caching
- **Traefik**: Load balancer and reverse proxy
- **Docker**: Container orchestration

## User Workflow & API Endpoints

All user-facing operations go through **localhost:18056** (API Gateway). Admin operations for user management use **localhost:18057** (Admin API).

### 1. Landing Page → Sign Up/Login → Dashboard

#### Authentication Options

**Option A: Self-Service Sign Up (Recommended)**
```bash
# Backend creates user and generates API key automatically
POST http://localhost:18057/admin/users
Headers: X-Admin-API-Key: qP4zo7lWA84W2iIqa6dtI884K3slfPli61mFlr5v
Body: {
  "email": "user@example.com",
  "name": "John Doe"
}
Response: { "id": 1, "email": "user@example.com", ... }

# Then immediately generate token
POST http://localhost:18057/admin/users/1/tokens
Headers: X-Admin-API-Key: qP4zo7lWA84W2iIqa6dtI884K3slfPli61mFlr5v
Response: { "id": 1, "token": "EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx", ... }
```

**Option B: Login with Existing API Key**
```bash
# User enters their existing API key
# Validate by making a test request
GET http://localhost:18056/bots/status
Headers: X-API-Key: USER_PROVIDED_API_KEY
Response: { "running_bots": [...] } # Success means valid key
```

**Option C: Find User by Email (for Login)**
```bash
# Find user and generate new token
GET http://localhost:18057/admin/users/email/user@example.com
Headers: X-Admin-API-Key: qP4zo7lWA84W2iIqa6dtI884K3slfPli61mFlr5v
Response: { "id": 1, "email": "user@example.com", ... }

# Generate new token for login
POST http://localhost:18057/admin/users/1/tokens
Headers: X-Admin-API-Key: qP4zo7lWA84W2iIqa6dtI884K3slfPli61mFlr5v
Response: { "token": "NEW_API_TOKEN", ... }
```

### 2. Dashboard → Create New Meeting → Meeting Page

#### Create Meeting & Start Bot
```bash
# Create meeting and launch bot
POST http://localhost:18056/bots
Headers: 
  X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
  Content-Type: application/json
Body: {
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "language": "en",
  "bot_name": "MyMeetingBot"
}
Response: {
  "id": 1,
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "status": "requested",
  "bot_container_id": "container_123",
  ...
}
```

#### Get Bot Status
```bash
# Check running bots
GET http://localhost:18056/bots/status
Headers: X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
Response: {
  "running_bots": [
    {
      "container_id": "container_123",
      "platform": "google_meet",
      "native_meeting_id": "abc-defg-hij",
      "status": "running"
    }
  ]
}
```

### 3. Meeting Page - Live Transcriptions (Update Every 8 Seconds)

#### Get Real-time Transcripts
```bash
# Fetch live transcriptions
GET http://localhost:18056/transcripts/google_meet/abc-defg-hij
Headers: X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
Response: {
  "id": 1,
  "platform": "google_meet",
  "native_meeting_id": "abc-defg-hij",
  "status": "active",
  "segments": [
    {
      "start_time": 0.0,
      "end_time": 2.5,
      "text": "Hello everyone, welcome to the meeting",
      "speaker": "John",
      "absolute_start_time": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Update Bot Configuration (Language Change)
```bash
# Change language mid-meeting
PUT http://localhost:18056/bots/google_meet/abc-defg-hij/config
Headers: 
  X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
  Content-Type: application/json
Body: {
  "language": "es"
}
Response: { "status": "accepted", "message": "Configuration updated" }
```

#### Update Meeting Metadata
```bash
# Update meeting name, participants, etc.
PATCH http://localhost:18056/meetings/google_meet/abc-defg-hij
Headers: 
  X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
  Content-Type: application/json
Body: {
  "data": {
    "name": "Weekly Team Meeting",
    "participants": ["John", "Jane", "Mike"],
    "languages": ["en"],
    "notes": "Regular sync meeting"
  }
}
```

### 4. Meeting Page → End Meeting

#### Stop Bot & End Meeting
```bash
# Stop the bot and end meeting
DELETE http://localhost:18056/bots/google_meet/abc-defg-hij
Headers: X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
Response: {
  "id": 1,
  "status": "stopping",
  "end_time": "2024-01-15T11:00:00Z"
}
```

### 5. Dashboard → Meetings → List All Meetings

#### Get User's Meetings
```bash
# List all meetings for user
GET http://localhost:18056/meetings
Headers: X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
Response: {
  "meetings": [
    {
      "id": 1,
      "platform": "google_meet",
      "native_meeting_id": "abc-defg-hij",
      "status": "completed",
      "start_time": "2024-01-15T10:00:00Z",
      "end_time": "2024-01-15T11:00:00Z",
      "data": {
        "name": "Weekly Team Meeting",
        "participants": ["John", "Jane", "Mike"]
      }
    }
  ]
}
```

#### Set Webhook URL
```bash
# Configure webhook for notifications
PUT http://localhost:18056/user/webhook
Headers: 
  X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
  Content-Type: application/json
Body: {
  "webhook_url": "https://your-app.com/webhook"
}
```

#### Delete Meeting (Optional)
```bash
# Permanently delete meeting and transcripts
DELETE http://localhost:18056/meetings/google_meet/abc-defg-hij
Headers: X-API-Key: EggpZ7qSxDDsQM97mhbKl7pBL8R07Qxwpdx3wLhx
Response: { "message": "Meeting and transcripts deleted successfully" }
```

## Frontend Architecture Recommendations (Feature-Sliced Design)

Based on the Feature-Sliced Design (FSD) methodology, the frontend architecture should be organized into a clear hierarchy of layers, slices, and segments. This structure promotes scalability, maintainability, and a clear separation of concerns.

### FSD Layers Overview

The application is structured into the following layers, from lowest to highest abstraction:

1.  **`shared`**: Reusable code without any business logic. (e.g., UI-kit, helper functions, API client).
2.  **`entities`**: Business entities. (e.g., `user`, `meeting`, `transcription`).
3.  **`features`**: User interaction logic. (e.g., `create-meeting`, `login-by-email`, `poll-transcription`).
4.  **`widgets`**: Compositional blocks of UI that combine entities and features. (e.g., `meeting-list`, `live-transcription-feed`).
5.  **`pages`**: Entry points for routes, composed of widgets. (e.g., `dashboard-page`, `meeting-page`).
6.  **`processes`**: Complex, multi-page business scenarios. (e.g., a multi-step meeting setup process).
7.  **`app`**: Application-wide setup and configuration (routing, store, global styles).

### Component Structure (FSD)

```
src/
├── app/
│   ├── providers/          # React Router, Redux Provider
│   ├── styles/             # Global styles
│   └── index.tsx           # App entry point
│
├── pages/
│   ├── dashboard/          # DashboardPage.tsx
│   ├── meeting/            # MeetingPage.tsx
│   └── login/              # LoginPage.tsx
│
├── widgets/
│   ├── header/
│   ├── meeting-list/
│   └── live-transcription/
│
├── features/
│   ├── create-meeting/
│   │   ├── ui/               # CreateMeetingModal.tsx
│   │   ├── model/            # State for the modal
│   │   └── api/              # createMeeting API call
│   ├── auth-by-email/
│   └── poll-transcription/
│
├── entities/
│   ├── meeting/
│   │   ├── ui/               # MeetingCard.tsx
│   │   ├── model/            # meetingSlice, selectors, types
│   │   └── api/              # getMeetings API call
│   └── user/
│       ├── model/            # authSlice, selectors, types
│       └── api/              # User-related API calls
│
└── shared/
    ├── ui/                   # Button, Input, Spinner
    ├── lib/                  # Helper functions, hooks
    ├── config/               # API config, routes
    └── api/                  # Base API client configuration
```

### API & State Management (FSD)

#### `shared/api/base.ts` (Base API Client)
```typescript
// shared/api/base.ts
import { API_CONFIG } from '@/shared/config';

// Base client for user operations (port 18056)
export async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('apiToken');
  return fetch(`${API_CONFIG.USER_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': token || '',
      ...options.headers,
    },
  });
}

// Base client for admin operations (port 18057)
export async function adminRequest(endpoint: string, options: RequestInit = {}) {
  return fetch(`${API_CONFIG.ADMIN_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-API-Key': API_CONFIG.ADMIN_API_KEY,
      ...options.headers,
    },
  });
}
```

#### `entities/user/` (User Entity)
```typescript
// entities/user/model/slice.ts (Auth State)
const authSlice = createSlice({
  name: 'auth',
  initialState, // { user, apiToken, isAuthenticated, ... }
  // ...reducers for login, logout, etc.
});

// entities/user/api/userApi.ts
import { adminRequest } from '@/shared/api';

export const userApi = {
  findUserByEmail: (email: string) => adminRequest(`/admin/users/email/${email}`),
  generateToken: (userId: number) => adminRequest(`/admin/users/${userId}/tokens`, { method: 'POST' }),
  createUser: (data: { email: string, name: string }) => adminRequest('/admin/users', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  })
};
```

#### `entities/meeting/` (Meeting Entity)
```typescript
// entities/meeting/model/slice.ts
const meetingSlice = createSlice({
  name: 'meetings',
  initialState, // { meetings: [], status: 'idle' }
  // ...reducers for loading meetings
});

// entities/meeting/api/meetingApi.ts
import { request } from '@/shared/api';

export const meetingApi = {
  getMeetings: () => request('/meetings'),
  getMeetingById: (platform: string, id: string) => request(`/transcripts/${platform}/${id}`),
};
```

#### `features/create-meeting/` (Create Meeting Feature)
```typescript
// features/create-meeting/api/createMeetingApi.ts
import { request } from '@/shared/api';

export const createMeetingApi = (data: { platform: string; native_meeting_id: string; }) => {
  return request('/bots', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// features/create-meeting/ui/CreateMeetingModal.tsx
import { createMeetingApi } from '../api/createMeetingApi';

const CreateMeetingModal = () => {
  // ... form logic
  const handleSubmit = async (data) => {
    await createMeetingApi(data);
    // ... close modal, update meeting list
  }
  // ... return JSX for the modal
}
```

This FSD structure isolates business logic (`entities`, `features`) from UI composition (`widgets`, `pages`) and reusable utilities (`shared`), making the codebase easier to navigate, test, and scale. 
