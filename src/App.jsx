import "./App.css";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import StudyBuddy from "./pages/StudyBuddy";

import Navbar from "./components/Navbar";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

const HomeLayout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Center Content */}
          <div className="lg:col-span-2 space-y-6">
            <Outlet />
          </div>

          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Home Layout */}
        <Route path="/home/*" element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="study-buddy" element={<StudyBuddy />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
