import { Link, useLocation } from "react-router-dom";
import collegeMediaLogo from "../assets/logos.png";

function LeftSidebar() {
  const location = useLocation();

  const items = [
    { label: "Feed", path: "/" },
    { label: "Courses", path: "/courses" },
    { label: "Trending", path: "/trending" },
    { label: "Explore", path: "/explore" },
    { label: "Stories", path: "/stories" },
    { label: "Learning", path: "/learning" },
    { label: "Reels", path: "/reels" },
    { label: "Messages", path: "/messages" },
    { label: "Profile", path: "/profile" },
  ];

  return (
    <aside className="hidden lg:flex sticky top-24 h-[calc(100vh-6rem)] flex-col w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center">
          <img
            src={collegeMediaLogo}
            alt="College Media Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                relative flex items-center
                px-4 py-3 rounded-xl
                text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-slate-100 dark:bg-slate-800 text-orange-500 font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 h-6 w-1 bg-orange-500 rounded-full" />
              )}
              <span className="ml-2">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 group"
        >
          <svg
            className="w-6 h-6 group-hover:text-slate-900 dark:group-hover:text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm font-medium group-hover:text-slate-900 dark:group-hover:text-white">
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}

export default LeftSidebar;
