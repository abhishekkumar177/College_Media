import React from "react";
import { useNavigate } from "react-router-dom";

function LeftSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const menuItems = [
    { icon: "🏠", label: "Home", active: activeTab === "Home", path: "/" },
    { icon: "💬", label: "Messages", active: activeTab === "Messages", path: "/messages" },
    {
      icon: "🔔",
      label: "Notifications",
      active: activeTab === "Notifications",
    },
  ];

  const handleTabClick = (item) => {
    setActiveTab(item.label);
    if (item.path) {
      navigate(item.path);
    }
  };
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(item)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-slate-800 ${
                item.active
                  ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 shadow-sm"
                  : "text-gray-600"
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
