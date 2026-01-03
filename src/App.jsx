import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import { AuthProvider } from './context/AuthContext';
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import ProfileEditForm from './components/Auth/ProfileEditForm';

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <AuthProvider>
      <Router>
        <AppContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </Router>
    </AuthProvider>
  );
};

const AppContent = ({ searchQuery, setSearchQuery, activeTab, setActiveTab }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/home") setActiveTab("Home");
    else if (location.pathname === "/messages") setActiveTab("Messages");
    else if (location.pathname === "/profile") setActiveTab("Profile");
  }, [location.pathname, setActiveTab]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />

      <Route
        path="/home"
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route index element={<Home />} />
      </Route>

      <Route
        path="/messages"
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route index element={<Messages />} />
      </Route>

      <Route
        path="/profile"
        element={
          <Layout
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        }
      >
        <Route index element={<Profile />} />
        <Route path="edit" element={<ProfileEditForm />} />
      </Route>
    </Routes>
  );
};

export default App;
