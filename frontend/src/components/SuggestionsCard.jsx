import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";

export default function SuggestionsCard() {
  const { analysis } = useAppStore();
  const baseSuggestions = analysis?.aiSuggestions || [];

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel rounded-[2rem] p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-amber-50 text-amber-700">
          <Lightbulb size={20} />
        </span>
        <h3 className="card-title">Suggestions</h3>
      </div>

      <div className="mt-5 grid gap-3">
        {(baseSuggestions.length ? baseSuggestions : ["Analyze your resume to unlock role-specific suggestions."]).map((item, index) => (
          <div key={`${item}-${index}`} className="flex gap-3 rounded-2xl border border-gray-100 bg-white/75 p-4 text-sm leading-6 text-gray-700">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
