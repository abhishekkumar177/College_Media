import { useChat } from "../../context/ChatContext";

export default function ChatBody() {
  const { messages } = useChat();

  return (
    <div
      style={{
        flex: 1,
        padding: "16px",
        overflowY: "auto",
        background: "var(--color-bg-primary)",
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
              background: msg.sender === "user" ? "var(--color-primary)" : "var(--color-bg-secondary)",
              color: msg.sender === "user" ? "white" : "var(--color-text-primary)",
            }}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}
