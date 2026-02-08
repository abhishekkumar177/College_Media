import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* App Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sample-profile" element={<SampleProfile />} />
            <Route path="/my-comments" element={<CommentManagement />} />
          </Routes>

          {/* Global Floating Chatbot */}
          <ChatbotWidget />
          {/* Toast Notifications */}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
