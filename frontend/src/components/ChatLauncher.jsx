import { BotMessageSquare } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function ChatLauncher() {
  const { chatOpen, setChatOpen } = useAppStore();

  return (
    <button
      className={`secondary-btn min-h-11 px-3 py-2 ${chatOpen ? "border-gray-950 bg-gray-950 text-white" : ""}`}
      type="button"
      onClick={() => setChatOpen(!chatOpen)}
      aria-label="Toggle chatbot"
    >
      <BotMessageSquare size={19} strokeWidth={1.9} />
      <span className="hidden text-sm sm:inline">Chatbot</span>
    </button>
  );
}
