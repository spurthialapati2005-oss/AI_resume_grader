import { Layers3 } from "lucide-react";
import { motion } from "framer-motion";

export default function SkillsCard({ skills = [] }) {
  const visibleSkills = skills?.length ? skills : ["Missing skills will appear here"];

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel rounded-[2rem] p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-sky-50 text-sky-700">
          <Layers3 size={20} />
        </span>
        <h3 className="card-title">Missing skills</h3>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {visibleSkills.map((skill, index) => (
          <span key={`${skill}-${index}`} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700">
            {skill}
          </span>
        ))}
      </div>
    </motion.section>
  );
}
