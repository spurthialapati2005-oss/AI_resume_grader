import { useState } from "react";
import { MessagesSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAppStore } from "../store/useAppStore";

export default function InterviewCard() {
  const [role, setRole] = useState("");
  const { interviewQuestions, generateInterview, loading } = useAppStore();
  const levels = ["easy", "medium", "hard"];

  const handleGenerate = async () => {
    try {
      await generateInterview({ role });
      toast.success("Interview set generated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-panel rounded-[2rem] p-5 sm:p-8"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-700">
            <MessagesSquare size={21} />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-normal text-gray-950">Interview prep</h1>
            <p className="mt-1 text-sm text-gray-500">Generate clear easy, medium, and hard questions by target role.</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <input
            className="field min-w-0 sm:w-80"
            placeholder="MERN Developer"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          />
          <button className="primary-btn" type="button" onClick={handleGenerate} disabled={loading.interview}>
            <Sparkles size={18} />
            {loading.interview ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-3">
        {levels.map((level) => (
          <div key={level} className="rounded-[1.5rem] border border-gray-100 bg-white/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-black capitalize text-gray-950">{level}</p>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-500">
                {(interviewQuestions?.[level] || []).length || 0}/5
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {(interviewQuestions?.[level] || [
                {
                  question: "Questions appear after generation.",
                  answer: "Enter a role like MERN Developer, Data Analyst, or Java Developer.",
                },
              ]).map((item, index) => (
                <details key={`${level}-${index}`} className="rounded-2xl bg-gray-50 p-4 open:bg-white open:shadow-sm">
                  <summary className="cursor-pointer text-sm font-black leading-6 text-gray-800">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
