import { useState } from "react";
import { createPortal } from "react-dom";
import { ChatProvider } from "../../context/ChatContext";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
import ChatInput from "./ChatInput";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return createPortal(
    <ChatProvider>
      {open && (
        <div
          style={{
            position: "fixed",
            right: "20px",
            bottom: "88px",
            width: "360px",
            height: "520px",
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 10000,
          }}
        >
          <ChatHeader onClose={() => setOpen(false)} />
          <ChatBody />
          <ChatInput />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "#2563eb",
          color: "#ffffff",
          fontSize: "20px",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 14px rgba(37,99,235,0.35)",
          zIndex: 10001,
        }}
      >
        💬
      </button>
    </ChatProvider>,
    document.getElementById("chatbot-root"),
  );
}
