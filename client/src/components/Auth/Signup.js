// client/src/components/Auth/Signup.js
import React, { useState } from 'react';
import { signup } from '../../auth';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(fullname, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600">CodeCraft</h2>
          <p className="text-gray-600">Create Your Account</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="fullname" value={fullname} onChange={(e) => setFullname(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Full Name" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Email" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Password" />
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign Up</button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link></p>
        </div>
        {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Signup;