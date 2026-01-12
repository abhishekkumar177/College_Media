import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import OfflineQueueIndicator from "./OfflineQueueIndicator";

function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 ml-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="px-6 py-4">
        <div className="flex items-center justify-center gap-6">
          {/* SEARCH BAR */}
          <div className="flex-1 max-w-2xl mx-auto">
            <SearchBar />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            {/* Offline Queue Indicator */}
            <OfflineQueueIndicator />

            {/* Create Post */}
            <Link
              to="/create-post"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium shadow-sm"
            >
              + Create Post
            </Link>

            {/* Notifications */}
            <NotificationBell />

            {/* Theme */}
            <ThemeToggle />

            {/* Profile */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
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
