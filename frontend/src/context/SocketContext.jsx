import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null); // Use a ref to keep the socket instance stable

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    // Initialize socket
    const socket = io(SOCKET_URL, {
      auth: {
        userId: user.id,
        token: localStorage.getItem("token"), // Consider getting this from useAuth state
      },
      transports: ["websocket"], // Prioritize websocket
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", (err) => console.error("Socket Error:", err.message));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id]); // Use user.id to prevent re-runs on object identity changes

  // Helper: Safely emit events
  const emit = useCallback((eventName, data) => {
    if (socketRef.current) {
      socketRef.current.emit(eventName, data);
    }
  }, []);

  // Helper: Subscribe to events with automatic cleanup
  const subscribe = useCallback((eventName, callback) => {
    if (!socketRef.current) return;
    
    socketRef.current.on(eventName, callback);
    return () => socketRef.current.off(eventName, callback);
  }, []);

  const value = {
    socket: socketRef.current,
    isConnected,
    emit,
    subscribe
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};