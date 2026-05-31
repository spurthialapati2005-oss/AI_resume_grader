import { useEffect, useRef } from "react";
import { BotMessageSquare, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import ChatInput from "./ChatInput";
import { useAppStore } from "../store/useAppStore";

export default function ChatWindow({ popup = false }) {
  const { messages, sendChat, loading, user, analysis } = useAppStore();
  const setChatOpen = useAppStore((state) => state.setChatOpen);
  const scrollRef = useRef(null);

  const quickPrompts = analysis
    ? [
        "Explain my resume's weaknesses.",
        "How can I fix the missing skills?",
        "Can you rewrite my project experiences?",
        "Give me mock interview questions for this role.",
      ]
    : [
        "How can I improve my resume for internships?",
        "Give me MERN developer interview questions",
        "Roadmap for becoming an AI engineer",
        "Which tech skills are trending for jobs?",
      ];

  const formatMessage = (content = "") =>
    content
      .replace(/\s+(\d+\.)\s+/g, "\n$1 ")
      .replace(/:\n/g, ":\n")
      .trim();

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading.chat]);

  const handleSend = async (prompt) => {
    if (!user) {
      toast.error("Login to use career chat");
      return;
    }

    try {
      await sendChat(prompt);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`flex flex-col overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-2xl shadow-gray-950/10 ${popup ? "max-h-[calc(100svh-5.5rem)] min-h-[34rem] xl:h-[calc(100svh-7rem)]" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gray-950 text-white shadow-lg shadow-gray-950/15">
            <BotMessageSquare size={22} strokeWidth={1.9} />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-sky-100 text-sky-700">
              <Sparkles size={11} />
            </span>
          </span>
          <div>
            <h3 className="card-title">ResumeIQ Chatbot</h3>
            <p className="mt-0.5 text-xs font-semibold text-gray-500">Resume, jobs, skills, interviews.</p>
          </div>
        </div>
        {popup && (
          <button className="icon-btn" type="button" onClick={() => setChatOpen(false)} aria-label="Close chatbot">
            <X size={18} />
          </button>
        )}
      </div>

      <div ref={scrollRef} className={`overflow-y-auto bg-white p-5 ${popup ? "min-h-0 flex-1" : "max-h-96"}`}>
        <div className="grid gap-4">
          <div className="flex gap-3">
            <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-gray-950">
              <BotMessageSquare size={16} />
            </span>
            <div className="max-w-[88%] rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">Try asking</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-left text-[11px] font-bold leading-4 text-gray-700 transition hover:border-gray-950"
                    type="button"
                    onClick={() => handleSend(prompt)}
                    disabled={loading.chat}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-gray-200 bg-white text-gray-950">
                  <BotMessageSquare size={16} />
                </span>
              )}
              <p className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-gray-950 text-white" : "border border-gray-100 bg-gray-50 text-gray-700"}`}>
                {formatMessage(message.content)}
              </p>
            </div>
          ))}
          {loading.chat && <p className="text-sm font-semibold text-gray-500">Coach is typing...</p>}
        </div>
      </div>

      <div className="px-5 pb-5">
        <ChatInput onSend={handleSend} disabled={loading.chat} />
      </div>
    </motion.section>
  );
}
