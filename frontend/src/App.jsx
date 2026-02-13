import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import Profile from "./pages/Profile";
import SampleProfile from "./pages/SampleProfile";
import CommentManagement from "./pages/CommentManagement";

import ChatbotWidget from "./components/chatbot/ChatbotWidget";


import "./styles/theme.css";
import "./styles/main.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ChatProvider>
      <AuthProvider>
        <Router>
          {/* App Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>

          {/* Global Floating Chatbot */}
          <ChatbotWidget />
        </Router>
      </AuthProvider>
    </ChatProvider>
  );
}
