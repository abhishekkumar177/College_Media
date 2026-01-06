import React from "react";
import { Link, useLocation } from "react-router-dom";

function LeftSidebar({ activeTab, setActiveTab }) {
  const location = useLocation();
  
  const menuItems = [
    { 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: "Feed",
      badge: "10",
      path: "/home"
    },
    { 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: "Trending",
      path: "/trending"
    },
    { 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Explore",
      path: "/explore"
    },
    { 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      label: "Stories",
      path: "/stories"
    },
    { 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      label: "Reels",
      path: "/reels"
    },
    { 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: "Messages",
      badge: "3",
      path: "/messages"
    },
    { 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: "Profile",
      path: "/profile"
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          
          </div>
          <span className="text-xl font-bold">
            <span className="text-gray-800">College</span>
            <span className="text-indigo-600">Media</span>
          </span>
        </div>
      

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                location.pathname === item.path
                  ? "bg-gray-100 font-semibold"
                  : "hover:bg-gray-50 font-normal"
              }`}
            >
              <div className="relative">
                <span className={location.pathname === item.path ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"}>
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-base ${
                location.pathname === item.path
                  ? "text-gray-900 font-semibold" 
                  : "text-gray-700 group-hover:text-gray-900"
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="space-y-1">
          <Link to="/more" className="w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-gray-50 group">
            <svg className="w-7 h-7 text-gray-700 group-hover:text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-base text-gray-700 group-hover:text-gray-900">More</span>
          </Link>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <Link to="/settings" className="w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-gray-50 group">
          <svg className="w-7 h-7 text-gray-700 group-hover:text-gray-900" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-base text-gray-700 group-hover:text-gray-900">Settings</span>
        </Link>
      </div>
    </aside>
  );
}

export default LeftSidebar;
