import React, { useState } from 'react';
import { Search, Home, Users, Briefcase, MessageSquare, Bell } from 'lucide-react';
import HeaderOption from './HeaderOption';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../Auth/LoginForm';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white flex items-center justify-between px-4 py-2 shadow-sm">
        {/* Left Side */}
        <div className="flex items-center space-x-2">
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-6">
          <HeaderOption Icon={Home} title="Home" />
          <HeaderOption Icon={Users} title="My Network" />
          <HeaderOption Icon={Briefcase} title="Jobs" />
          <HeaderOption Icon={MessageSquare} title="Messaging" />
          <HeaderOption Icon={Bell} title="Notifications" />
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 cursor-pointer group">
                <img
                  src={`https://placehold.co/32x32/3b82f6/ffffff?text=${encodeURIComponent(user?.name?.charAt(0) || 'U')}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/32x32/gray/ffffff?text=U';
                  }}
                />
                <p className="text-sm font-medium text-gray-600 group-hover:text-blue-500">{user?.name || 'User'}</p>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 ml-4"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
            >
              Login
            </button>
          )}
        </div>
      </header>
      
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Header;