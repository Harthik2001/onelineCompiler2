// client/src/components/Auth/Login.js
import React, { useState, useContext, useEffect } from 'react';
import { login } from '../../auth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GoogleLoginButton from './GoogleLogin';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: doLogin } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const urlError = searchParams.get('error');

  useEffect(() => {
    if (urlError) {
      setError(decodeURIComponent(urlError));
    }
    setEmail(''); // Clear email on mount
    setPassword(''); // Clear password on mount
    setError(''); // Clear error on mount
  }, [urlError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await login(email, password);
      doLogin(userData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600">CodeCraft</h2>
          <p className="text-gray-600">Your Online Compiler</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <GoogleLoginButton />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm">
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
        {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Login;