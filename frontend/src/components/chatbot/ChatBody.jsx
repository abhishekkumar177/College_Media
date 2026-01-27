import { useChat } from "../../context/ChatContext";

export default function ChatBody() {
  const { messages } = useChat();

  return (
    <div
      style={{
        flex: 1,
        padding: "16px",
        overflowY: "auto",
        background: "#ffffff",
      }}
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              maxWidth: "75%",
              padding: "12px 16px",
              borderRadius: "18px",
              fontSize: "14px",
              lineHeight: "1.45",
              background: msg.sender === "user" ? "#2563eb" : "#f1f5f9",
              color: msg.sender === "user" ? "#ffffff" : "#111827",
            }}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
