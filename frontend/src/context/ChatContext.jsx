import { createContext, useContext, useState } from "react";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I’m the ProjectX assistant. I can help you understand features, demos, onboarding, and how ProjectX works.",
    },
  ]);

  function sendMessage(text) {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "🚀 ProjectX helps you build, deploy, and scale digital products. Ask me about features, demos, or getting started.",
        },
      ]);
    }, 400);
  }

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
