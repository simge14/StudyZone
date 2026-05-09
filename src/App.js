import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import TopHeader from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import BarterDashboard from './components/BarterDashboard';
import Pomodoro from './components/Pomodoro';
import LocationGuide from './components/LocationGuide';
import Learnership from './components/Learnership';
import OnboardingGuide from './components/OnboardingGuide';
import SplashScreen    from './components/SplashScreen';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

/* Global server-offline banner */
function ServerBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const goOff = () => setOffline(true);
    const goOn  = () => setOffline(false);
    window.addEventListener('sz-server-offline', goOff);
    window.addEventListener('sz-server-online',  goOn);
    return () => {
      window.removeEventListener('sz-server-offline', goOff);
      window.removeEventListener('sz-server-online',  goOn);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="sz-offline-banner">
      ⚠ Sunucuya bağlanılamıyor — Lütfen backend'inizi başlatın (port 3000)
    </div>
  );
}

function AppShell() {
  const [splashDone, setSplashDone] = useState(false);

  /* Render the splash screen until it calls onDone() */
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  return (
    <div className="sz-app-shell">
      <TopHeader />
      <ServerBanner />
      <div className="sz-scroll-area">
        <ErrorBoundary>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/locations" element={<LocationGuide />} />
            <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/barter"       element={<PrivateRoute><BarterDashboard /></PrivateRoute>} />
            <Route path="/learnership"  element={<PrivateRoute><Learnership /></PrivateRoute>} />
            <Route path="/pomodoro"     element={<PrivateRoute><Pomodoro /></PrivateRoute>} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
      <BottomNav />
      {/* First-login carousel guide — position:fixed, rendered above everything */}
      <OnboardingGuide />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppShell />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
