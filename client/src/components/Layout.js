// client/src/components/Layout.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Layout = ({ children }) => {
  const { user, logout: doLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await doLogout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 text-white flex justify-between items-center shadow-lg">
        <div className='flex items-center'>
          <img src={logo} alt="Logo" className="h-10 w-10 mr-3" />
          <Link to="/" className="text-2xl font-bold tracking-wide hover:text-gray-300 transition">Online Compiler</Link>
        </div>
        <nav className="flex items-center space-x-5">
          <Link to="/history" className="hover:text-gray-300 transition">History</Link>
          {/* <Link to="/profile" className="hover:text-gray-300 transition">profile</Link> */}
          <span onClick={handleLogout} className="cursor-pointer hover:text-red-300 transition">Logout</span>
        </nav>
      </header>
      <main className="mx-auto p-3">
        {children}
      </main>
    </div>
  );
};

export default Layout;