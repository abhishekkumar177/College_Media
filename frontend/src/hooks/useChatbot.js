import { useState } from "react";

export function useChatbot() {
  const [messages, setMessages] = useState(() => [
    {
      sender: "bot",
      text: "👋 Hi! I’m the ProjectX assistant. I can help you understand features, demos, onboarding, and how ProjectX works.",
    },
  ]);

  function send(text) {
    const userMessage = { sender: "user", text };

    setMessages((prev) => [...prev, userMessage]);

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

  return { messages, send };
}
