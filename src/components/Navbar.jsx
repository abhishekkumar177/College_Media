import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProfileMenu from './ProfileMenu'

function Navbar({ searchQuery, setSearchQuery }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="top-0 z-50 ml-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {user ? (
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for friends, groups, pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300 text-sm"
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
            >
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <svg
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
              ) : null}
              {isProfileOpen && (
                <div className="absolute top-14 right-2">
                  <ProfileMenu setIsProfileOpen={setIsProfileOpen} />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 mr-4">
              <Link to="/create-post" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center space-x-2 shadow-sm">
                <span className="text-lg">+</span>
                <span>Add New Post</span>
              </Link>

              <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-300">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
