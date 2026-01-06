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
        </Link>
      </div>
    </div>
  );
}

export default LeftSidebar;
