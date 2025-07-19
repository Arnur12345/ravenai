import { Routes, Route, useLocation } from 'react-router-dom'
import Header from '../../modules/landing/components/header'
import Landing from '../../modules/landing'
import Auth from '../../modules/auth'
import Dashboard from '../../modules/dashboard'
import MeetingWorkspace from '../../modules/meeting'
import Legal from '../../modules/legal'
import { MeetingSummaryPage } from '../../modules/meeting/pages/MeetingSummaryPage'
import GoogleCallback from '../../modules/auth/components/google-callback'
import GoogleSuccess from '../../modules/auth/components/google-success'
import { SlackCallbackPage } from '../../modules/dashboard/pages/SlackCallbackPage'
import { LanguageProvider } from '../../shared/contexts/LanguageContext'
import { AuthProvider } from '../../shared/contexts/AuthContext'
import { ThemeProvider } from '../../shared/contexts/ThemeContext'
import { ProtectedRoute, PublicRoute } from '../../shared/components/PrivateRoute'

function App() {
  const location = useLocation();
  
  // Don't show header on auth pages, dashboard, and meeting workspace
  const hideHeader = ['/register', '/login', '/dashboard', '/integrations', '/settings', '/meetings', '/auth/google/callback', '/auth/google/success', '/integrations/slack/callback'].includes(location.pathname) || location.pathname.startsWith('/meetings/');

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {!hideHeader && <Header />}
          <main>
            <Routes>
              {/* Public routes - accessible without authentication */}
              <Route path="/" element={<Landing />} />
              
              {/* Legal routes - accessible to everyone */}
              <Route path="/privacy-policy" element={<Legal />} />
              <Route path="/terms-of-service" element={<Legal />} />
              
              {/* Auth routes - redirect authenticated users to dashboard */}
              <Route path="/register" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              
              {/* OAuth callback routes - public for login flow */}
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/auth/google/success" element={<GoogleSuccess />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/meetings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/meetings/:meetingId/summary" element={<ProtectedRoute><MeetingSummaryPage /></ProtectedRoute>} />
              <Route path="/meetings/:id" element={<ProtectedRoute><MeetingWorkspace /></ProtectedRoute>} />
              
              {/* Slack integration callback - protected */}
              <Route path="/integrations/slack/callback" element={<ProtectedRoute><SlackCallbackPage /></ProtectedRoute>} />
            </Routes>
          </main>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
