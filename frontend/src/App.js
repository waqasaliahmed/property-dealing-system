import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetail from './pages/PropertyDetail';
import PropertyList from './pages/PropertyList';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      setIsAuthenticated(!!token);
      setUserRole(role);
    };

    // Listen to storage events from other tabs
    window.addEventListener('storage', syncAuth);
    // Listen to custom event from same window (login/logout)
    window.addEventListener('auth-change', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Home */}
        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? userRole === 'admin' 
                ? <AdminDashboard /> 
                : <UserDashboard />
              : <RoleSelection />
          } 
        />
        
        {/* Public Routes */}
        {!isAuthenticated && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
          </>
        )}

        {/* User Routes */}
        {isAuthenticated && userRole === 'user' && (
          <>
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
            <Route path="/my-properties" element={<UserDashboard />} />
          </>
        )}

        {/* Admin Routes */}
        {isAuthenticated && userRole === 'admin' && (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/add-property" element={<AddProperty />} />
            <Route path="/edit-property/:id" element={<EditProperty />} />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
          </>
        )}

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
