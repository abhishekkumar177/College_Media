import React from "react";
import { useNavigate } from "react-router-dom";

function LeftSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const menuItems = [
    { icon: "🏠", label: "Home", active: activeTab === "Home", path: "/home" },
    { icon: "🔍", label: "Explore", active: activeTab === "Explore", path: "/home" },
    { icon: "🎬", label: "Reels", active: activeTab === "Reels", path: "/home" },
    { icon: "💬", label: "Messages", active: activeTab === "Messages", path: "/messages" },
    {
      icon: "🔔",
      label: "Notifications",
      active: activeTab === "Notifications",
      path: "/home"
    },
    { icon: "⚙️", label: "Settings", active: activeTab === "Settings", path: "/settings" },
  ];

  const handleTabClick = (item) => {
    setActiveTab(item.label);
    if (item.path) {
      navigate(item.path);
    }
  };
  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 sticky top-24 border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(item)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                item.active
                  ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-100 shadow-sm"
                  : "text-gray-600 dark:text-slate-200"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeftSidebar;
