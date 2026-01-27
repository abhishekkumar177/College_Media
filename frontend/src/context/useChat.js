import { useContext } from "react";
import { ChatContext } from "./ChatContext";

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used inside a ChatProvider");
  }

  return context;
}
