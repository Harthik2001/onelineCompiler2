// client/src/components/Auth/AuthSuccess.js
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthSuccess: Token from URL:', token);
    if (token) {
      localStorage.setItem('token', token);
      console.log('AuthSuccess: Token stored in localStorage:', localStorage.getItem('token'));
      console.log('AuthSuccess: localStorage content:', localStorage);
      navigate('/');
    } else {
      if (error) {
        console.error('Authentication error:', error);
        alert(`Authentication failed: ${decodeURIComponent(error)}`);
      }
      navigate('/login');
    }
  }, [navigate, token, error]);

  return <div>Authenticating...</div>;
};

export default AuthSuccess;