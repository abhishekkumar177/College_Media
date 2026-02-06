export default function ChatHeader({ onClose }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--color-border-primary)",
        background: "var(--color-card-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
        ProjectX Assistant
      </div>

      <button
        onClick={onClose}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "18px",
          cursor: "pointer",
          color: "var(--color-text-secondary)",
          transition: "color var(--transition-base)"
        }}
        onMouseOver={(e) => e.target.style.color = "var(--color-text-primary)"}
        onMouseOut={(e) => e.target.style.color = "var(--color-text-secondary)"}
      >
        ✕
      </button>
    </div>
  );
}
