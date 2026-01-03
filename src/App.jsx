import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Trending from "./pages/Trending";
import Explore from "./pages/Explore";
import Stories from "./pages/Stories";
import CreateStory from "./pages/CreateStory";
import Notifications from "./pages/Notifications";
import More from "./pages/More";
import Settings from "./pages/Settings";
import Reels from "./pages/Reels";
import CreatePost from "./pages/CreatePost";
import Navbar from "./components/Navbar";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Feed");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Home />
                  </div>
                  <div className="lg:col-span-1">
                    <RightSidebar />
                  </div>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/trending" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Trending />
              </div>
            </div>
          </div>
        } />
        <Route path="/explore" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Explore />
              </div>
            </div>
          </div>
        } />
        <Route path="/stories" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Stories />
              </div>
            </div>
          </div>
        } />
        <Route path="/create-story" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <CreateStory />
              </div>
            </div>
          </div>
        } />
        <Route path="/messages" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Messages />
              </div>
            </div>
          </div>
        } />
        <Route path="/notifications" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Notifications />
              </div>
            </div>
          </div>
        } />
        <Route path="/profile" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Profile />
              </div>
            </div>
          </div>
        } />
        <Route path="/edit-profile" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <EditProfile />
              </div>
            </div>
          </div>
        } />
        <Route path="/more" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <More />
              </div>
            </div>
          </div>
        } />
        <Route path="/settings" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <Settings />
              </div>
            </div>
          </div>
        } />
        <Route path="/reels" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Reels />
            </div>
          </div>
        } />
        <Route path="/create-post" element={
          <div className="min-h-screen bg-gray-50">
            <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-64">
              <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <div className="max-w-5xl mx-auto px-6 py-8">
                <CreatePost />
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
