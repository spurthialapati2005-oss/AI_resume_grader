import { CheckCircle2, CircleAlert, ClipboardCheck } from "lucide-react";
import { motion } from "framer-motion";

const toneMap = {
  emerald: {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  rose: {
    icon: CircleAlert,
    className: "bg-rose-50 text-rose-700",
  },
  sky: {
    icon: ClipboardCheck,
    className: "bg-sky-50 text-sky-700",
  },
};

export default function AnalysisCard({ title, items = [], tone = "emerald" }) {
  const Icon = toneMap[tone]?.icon || CheckCircle2;
  const visibleItems = items?.length ? items : ["Run an analysis to populate this section."];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-panel rounded-[2rem] p-6"
    >
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-full ${toneMap[tone]?.className}`}>
          <Icon size={20} />
        </span>
        <h3 className="card-title">{title}</h3>
      </div>
      <ul className="mt-5 grid gap-3">
        {visibleItems.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 rounded-2xl border border-gray-100 bg-white/75 p-4 text-sm leading-6 text-gray-700">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${tone === "rose" ? "bg-rose-500" : tone === "sky" ? "bg-sky-500" : "bg-emerald-500"}`} />
            {item}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
