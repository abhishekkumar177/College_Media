import { Link, useLocation } from "react-router-dom";
import collegeMediaLogo from "../assets/logos.png";

function LeftSidebar() {
  const location = useLocation();

  const items = [
    { label: "Feed", path: "/home" },
    { label: "Trending", path: "/trending" },
    { label: "Explore", path: "/explore" },
    { label: "Stories", path: "/stories" },
    { label: "Reels", path: "/reels" },
    { label: "Messages", path: "/messages" },
    { label: "Profile", path: "/profile" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* LOGO */}
      <div className="h-20 flex items-center justify-center border-b border-white/10">
        <img src={collegeMediaLogo} alt="logo" className="h-9" />
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 flex flex-col">
      {/* Logo with Image */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <img 
            src={collegeMediaLogo} 
            alt="College Media Logo" 
            className="h-12 w-auto object-contain" 
          />
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                relative flex items-center
                px-4 py-3 rounded-xl
                text-sm font-medium transition
                ${active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"}
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

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10 text-white/50">
        <Link to="/settings" className="hover:text-white transition">
          Settings
              className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                location.pathname === item.path
                  ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800 font-normal"
              }`}
            >
              <div className="relative">
                <span className={location.pathname === item.path ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"}>
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
                  ? "text-gray-900 dark:text-gray-100 font-semibold" 
                  : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100"
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <hr className="my-4 border-gray-200 dark:border-gray-700" />

        <div className="space-y-1">
          <Link to="/more" className="w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 group">
            <svg className="w-7 h-7 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">More</span>
          </Link>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link to="/settings" className="w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 group">
          <svg className="w-7 h-7 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">Settings</span>
        </Link>
      </div>
    </div>
  );
}

export default LeftSidebar;
