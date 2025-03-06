// client/src/App.js
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Editor from './components/Editor';
import History from './components/History';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, AuthContext } from './context/AuthContext';
import GoogleLoginButton from './components/Auth/GoogleLogin';
import { ThemeProvider } from './context/ThemeContext';
import AuthSuccess from './components/Auth/AuthSuccess';

function App() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      <Route path="/googleLogin" element={<GoogleLoginButton />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function MainApp() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default MainApp;