import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ParkingAccessPage from './pages/ParkingAccessPage';
import ParkingMonitoringPage from './pages/ParkingMonitoringPage';
import GuidancePaymentPage from './pages/GuidancePaymentPage';
import AdministrationPage from './pages/AdministrationPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const protect = (element, adminOnly = false) => {
    if (!isLoggedIn) return <Navigate to="/login" />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" />;
    return (
      <Layout user={user} onLogout={handleLogout}>
        {element}
      </Layout>
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to={user?.role === 'admin' ? '/administration' : '/dashboard'} />
              : <LoginPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
          }
        />
        <Route path="/login"    element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard"        element={protect(<DashboardPage />)} />
        <Route path="/monitoring"       element={protect(<ParkingMonitoringPage />)} />
        <Route path="/guidance-payment" element={protect(<GuidancePaymentPage />)} />
        <Route path="/profile"          element={protect(<ProfilePage user={user} />)} />
        <Route path="/parking-access"   element={protect(<ParkingAccessPage />, true)} />
        <Route path="/administration"   element={protect(<AdministrationPage />, true)} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
