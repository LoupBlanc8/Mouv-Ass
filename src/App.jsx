import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import Academy from './pages/Academy';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import AdminDashboard from './pages/admin/AdminDashboard';


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
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowDebug(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 'var(--space-4)'
    }}>
      <img 
        src="/logo-mouvbody.png" 
        alt="Mouv'Body" 
        className="app-logo app-logo--loading"
        style={{ marginBottom: 'var(--space-4)' }}
      />
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid var(--surface-container-highest)',
        borderTopColor: 'var(--primary)',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>Chargement...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      {showDebug && (
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <p className="body-sm text-muted" style={{ marginBottom: 'var(--space-3)' }}>Le chargement est inhabituellement long.</p>
          <button className="btn btn--secondary btn--sm" onClick={() => window.location.reload()}>
            Recharger la page
          </button>
        </div>
      )}
    </div>
  );
}

import Rank from './pages/Rank';
import Social from './pages/Social';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="app-shell">
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />
            <Route element={
              <ProtectedRoute><OnboardingGate><AppShell /></OnboardingGate></ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workout" element={<Workout />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/rank" element={<Rank />} />
              <Route path="/social" element={<Social />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
