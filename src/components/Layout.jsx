import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

const Layout = ({ searchQuery, setSearchQuery, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="lg:col-span-2 space-y-6">
            <Outlet />
          </div>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Layout;