export default function ChatHeader({ onClose }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: 600, color: "#111827" }}>
        ProjectX Assistant
      </div>

      <button
        onClick={onClose}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "18px",
          cursor: "pointer",
          color: "#6b7280",
        }}
      >
        ✕
      </button>
    </div>
  );
}
