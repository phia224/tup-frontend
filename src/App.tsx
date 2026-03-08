import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'admin'>('home');

  // Check authentication on mount and when hash changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const authenticated = !!token;
      setIsAuthenticated(authenticated);

    const hash = window.location.hash;
      
    if (hash === '#admin' || hash === '#login') {
      setCurrentView('login');
    } else if (hash === '#dashboard') {
        if (authenticated) {
        setCurrentView('admin');
      } else {
        setCurrentView('login');
          window.location.hash = '#login';
        }
      } else {
        // If no hash, show home
        if (!hash) {
          setCurrentView('home');
      }
    }
    };

    // Check on mount
    checkAuth();

    // Listen for hash changes
    const handleHashChange = () => {
      checkAuth();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('admin');
    window.location.hash = '#dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    setIsAuthenticated(false);
    setCurrentView('home');
    window.location.hash = '';
  };

  if (currentView === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentView === 'admin') {
    if (isAuthenticated) {
      return <AdminDashboard onLogout={handleLogout} />;
    } else {
      // Redirect to login if not authenticated
      setCurrentView('login');
      window.location.hash = '#login';
      return <LoginPage onLogin={handleLogin} />;
    }
  }

  return <HomePage />;
}

export default App
