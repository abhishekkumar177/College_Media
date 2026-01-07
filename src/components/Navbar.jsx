import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";
import { Link, useNavigate, } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import ProfileMenu from './ProfileMenu';
import ThemeToggle from './ThemeToggle';

function Navbar({ searchQuery, setSearchQuery }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="h-full">
      <div className="h-full px-6 flex items-center gap-6">
        
        {/* SEARCH */}
        <div className="flex-1 max-w-xl">
          <div className="relative h-11 flex items-center">
            <svg
              className="absolute left-4 h-5 w-5 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for friends, groups, pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full h-full pl-12 pr-4
                bg-[#0B0D18]/80
                text-white text-sm placeholder-white/40
                border border-white/15
                backdrop-blur-xl
                rounded-full
                focus:outline-none
                focus:ring-2 focus:ring-orange-500/60
              "
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 ml-auto">
          <Link
            to="/create-post"
            className="
              hidden lg:flex
              h-11 px-6
              items-center gap-2
              bg-gradient-to-r from-orange-500 to-orange-600
              rounded-full text-sm font-medium
              shadow-lg
              hover:from-orange-600 hover:to-orange-700
            "
          >
            <span className="text-lg">+</span>
            Add New Post
          </Link>

           <Link
            to="/notifications"
            className="
              relative
              h-11 w-11
              flex items-center justify-center
              rounded-full
              hover:bg-white/10
              transition
            "
          >
            <svg
              className="h-6 w-6 text-white/80"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
            </svg>

            {/* DOT FIXED */}
            <span className="
              absolute top-1.5 right-1.5
              w-2.5 h-2.5
              bg-red-500
              rounded-full
              ring-2 ring-[#0B0D18]
            " />
          </Link>

          {user && (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-11 w-11 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <svg className="h-6 w-6 text-white/80" fill="none" stroke="currentColor" strokeWidth={2}
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
              {isProfileOpen && (
                <div className="absolute top-14 right-0">
                  <ProfileMenu setIsProfileOpen={setIsProfileOpen} />
                </div>
              )}
            </div>
          )}
    <nav className="top-0 z-50 ml-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-center gap-6">
          {/* SEARCH BAR - CENTERED */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search for friends, groups, pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-800 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-300 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* ACTIONS - RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {/* Create Post Button */}
            <Link 
              to="/create-post" 
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 shadow-sm"
            >
              <span className="text-lg">+</span>
              <span>Create Post</span>
            </Link>
            
            {/* Notifications */}
            <Link 
              to="/notifications" 
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <svg 
                className="w-6 h-6 text-gray-700 dark:text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={2} 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Menu - Only show if user is logged in */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-300"
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
                {isProfileOpen && (
                  <div className="absolute top-14 right-2">
                    <ProfileMenu setIsProfileOpen={setIsProfileOpen} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
