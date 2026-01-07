import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import gsap from "gsap";

import Navbar from "./Navbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import ProBackground from "./ProBackground";

const Layout = ({ searchQuery, setSearchQuery }) => {
  const isPro = true;

  useEffect(() => {
    gsap.fromTo(
      ".pro-entrance",
      { opacity: 0, y: 12, filter: "blur(12px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
      }
    );
  }, []);

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-gradient-to-br from-[#05050A] via-[#0B0C17] to-[#120B2E]">
      {isPro && <ProBackground />}

      <div className="flex relative z-10">
        {/* LEFT SIDEBAR */}
        <aside className="
          hidden lg:block
          fixed left-0 top-0 bottom-0
          w-64 z-40
          backdrop-blur-xl bg-black/40
          border-r border-white/10
        ">
          <LeftSidebar />
        </aside>

        {/* MAIN */}
        <div className="flex-1 lg:ml-64">
          {/* NAVBAR */}
          <header className="
            fixed top-0 left-0 lg:left-64 right-0
            h-20 z-50
            backdrop-blur-xl bg-black/40
            border-b border-white/10
          ">
            <Navbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </header>

          {/* CONTENT */}
          <main className="pt-24 px-6 pb-10 relative pro-entrance">
            <div className="
              max-w-7xl mx-auto
              bg-[#0F1118]/90 backdrop-blur-xl
              border border-white/10
              rounded-2xl shadow-2xl
              p-6
            ">
              <div className="flex gap-6">
                <div className="flex-1 max-w-3xl mx-auto">
                  <Outlet />
                </div>
                <div className="hidden xl:block w-80">
                  <RightSidebar />
                </div>
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
