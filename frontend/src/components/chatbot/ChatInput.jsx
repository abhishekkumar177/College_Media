import { useState } from "react";
import { useChat } from "../../context/ChatContext";

export default function ChatInput() {
  const [text, setText] = useState("");
  const { sendMessage } = useChat();

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "14px",
        borderTop: "1px solid #e5e7eb",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px",
          borderRadius: "999px",
          border: "1px solid #d1d5db",
          background: "#ffffff",
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about ProjectX..."
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: "14px",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#111827",
          }}
        />

        <button
          type="submit"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
        >
          ➤
        </button>
      </div>
    </form>
  );
}
