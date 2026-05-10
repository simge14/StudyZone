import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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

/* Sayfa geçiş animasyonu — opacity fade 0→1 */
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.2,  ease: 'easeIn'  } },
};

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

/* AnimatePresence'ın location key'e ihtiyacı var — Route'ların üstüne alınır */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <Routes location={location}>
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
      </motion.div>
    </AnimatePresence>
  );
}

function AppShell() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <div className="sz-app-shell">
      {!splashDone ? (
        <SplashScreen onDone={() => setSplashDone(true)} />
      ) : (
        <>
          <TopHeader />
          <ServerBanner />
          <div className="sz-scroll-area">
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </div>
          <BottomNav />
          <OnboardingGuide />
        </>
      )}
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
