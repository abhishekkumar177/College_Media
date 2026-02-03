import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import ChatbotWidget from "./components/chatbot/ChatbotWidget";

import "./styles/main.css";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* App Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        {/* Global Floating Chatbot */}
        <ChatbotWidget />
      </Router>
    </AuthProvider>
  );
}
