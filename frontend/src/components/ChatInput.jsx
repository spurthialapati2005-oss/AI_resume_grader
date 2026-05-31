import { useState } from "react";
import { SendHorizontal } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSend(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-3 border-t border-gray-100 pt-4">
      <input
        className="field rounded-2xl bg-white"
        placeholder="Ask for career advice..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
      />
      <button className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gray-950 text-white transition hover:-translate-y-0.5 disabled:opacity-50" type="submit" disabled={disabled || !value.trim()} aria-label="Send message">
        <SendHorizontal size={18} />
      </button>
    </form>
  );
}
