import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function OnboardingGate({ children }) {
  const { profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (profile && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 'var(--space-4)'
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '3px solid var(--surface-container-highest)',
        borderTopColor: 'var(--primary)',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>Chargement...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            <Route element={
              <ProtectedRoute><OnboardingGate><AppShell /></OnboardingGate></ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workout" element={<Workout />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
