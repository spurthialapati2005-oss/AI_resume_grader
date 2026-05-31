import { ArrowRight, BadgeCheck, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Hero({ onStart }) {
  return (
    <section className="relative mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl content-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }} className="max-w-3xl">
        <motion.p variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-2 text-sm font-bold text-gray-700">
          <Zap size={16} className="text-sky-600" />
          AI resume grading built for modern hiring
        </motion.p>
        <motion.h1 variants={fadeUp} className="text-5xl font-black leading-[0.96] tracking-normal text-gray-950 sm:text-6xl lg:text-7xl">
          Create a sharper resume for the role you want.
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
          Upload your resume, paste a job description, and get an ATS score, missing skills, targeted suggestions, interview prep, and career chat in one clean workspace.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="primary-btn" type="button" onClick={onStart}>
            Analyze resume
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.7 }}
        className="glass-panel relative overflow-hidden rounded-[2rem] p-4 sm:p-6"
      >
        <div className="rounded-[1.5rem] bg-gray-950 p-5 text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-white/55">ATS score checker</p>
              <p className="text-4xl font-black">Resume-ready</p>
            </div>
            <BadgeCheck className="text-emerald-300" size={34} />
          </div>
          <div className="mt-6 grid gap-3">
            {["Modern ATS systems reward role-specific keywords", "Recruiters scan measurable outcomes first", "Clean formatting beats decorative resume layouts"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 p-4">
                <ShieldCheck size={18} className="text-sky-300" />
                <span className="text-sm font-semibold text-white/86">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            ["Ask", "Questions"],
            ["Upload", "Resume"],
            ["24/7", "Coach"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-3xl border border-gray-100 bg-white p-4">
              <p className="text-2xl font-black">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
