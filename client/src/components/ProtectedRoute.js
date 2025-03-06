// client/src/components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute: user:', user);
  console.log('ProtectedRoute: loading:', loading);
  console.log('ProtectedRoute: token:', token);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;