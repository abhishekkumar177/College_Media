import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

function Navbar({ searchQuery, setSearchQuery }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* LOGO */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <img
              src="/college-media-logo.svg"
              alt="College Media Logo"
              className="h-8 w-auto"
            />
          </button>

          {/* SEARCH */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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
            </div>
          </div>

          {/* PROFILE */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
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

            {isProfileOpen && (
              <div className="absolute top-14 right-2">
                <ProfileMenu setIsProfileOpen={setIsProfileOpen} />
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
