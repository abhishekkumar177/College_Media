import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

const Layout = ({ searchQuery, setSearchQuery, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {/* Main container with proper spacing */}
      <div className="flex pt-16">
        {/* Fixed Left Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto z-30">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex gap-6">
              {/* Center Feed Area */}
              <div className="flex-1 max-w-2xl mx-auto">
                <Outlet />
              </div>
              
              {/* Right Sidebar - hidden on mobile */}
              <div className="w-80 hidden xl:block">
                <RightSidebar />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;