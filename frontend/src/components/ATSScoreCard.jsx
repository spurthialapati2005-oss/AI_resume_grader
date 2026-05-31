import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { motion } from "framer-motion";

export default function ATSScoreCard({ score = 0, loading = false }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const label = safeScore >= 80 ? "Strong match" : safeScore >= 55 ? "Room to tune" : "Needs targeting";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-panel rounded-[2rem] p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-gray-500">ATS Score: {safeScore}/100</p>
          <h3 className="card-title mt-1">{loading ? "Reading resume" : label}</h3>
        </div>
        <span className="rounded-full bg-gray-950 px-3 py-1 text-sm font-black text-white">{safeScore}/100</span>
      </div>
      <div className="mx-auto mt-6 h-44 w-44">
        <CircularProgressbar
          value={safeScore}
          text={`${safeScore}%`}
          styles={buildStyles({
            pathColor: safeScore >= 80 ? "#059669" : safeScore >= 55 ? "#0284c7" : "#e11d48",
            trailColor: "#e5e7eb",
            textColor: "#111827",
            textSize: "18px",
            pathTransitionDuration: 0.8,
          })}
        />
      </div>
      <p className="mt-5 text-center text-sm leading-6 text-gray-600">
        {safeScore ? "Use the cards below to close keyword gaps and improve recruiter readability." : "Your match score appears here after analysis."}
      </p>
    </motion.section>
  );
}
