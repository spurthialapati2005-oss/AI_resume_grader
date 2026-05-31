import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, ScanSearch } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppStore } from "../store/useAppStore";

export default function UploadResume({ compact = false }) {
  const [jobDescription, setJobDescription] = useState("");
  const {
    user,
    resumeFile,
    uploadedResume,
    setResumeFile,
    analyzeResume,
    loading,
  } = useAppStore();

  const canAnalyze = useMemo(
    () => Boolean(user && resumeFile),
    [user, resumeFile],
  );

  const handleAnalyze = async () => {
    try {
      await analyzeResume(jobDescription);
      toast.success("Resume analyzed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className="glass-panel rounded-[2rem] p-5 sm:p-7"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Resume scan</p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-gray-950 sm:text-4xl">
            Upload. Compare. Improve.
          </h2>
        </div>
        {uploadedResume && (
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            Uploaded
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-4">
        <label className="group grid cursor-pointer place-items-center rounded-[1.5rem] border border-dashed border-gray-300 bg-white/80 px-4 py-8 text-center transition hover:border-gray-950">
          <input
            className="sr-only"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
          />
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gray-950 text-white transition group-hover:scale-105">
            <FileUp size={24} />
          </span>
          <span className="mt-4 text-lg font-black text-gray-950">
            {resumeFile?.name || "Choose your resume PDF"}
          </span>
          <span className="mt-1 text-sm text-gray-500">PDF or DOCX resumes are scanned for ATS-ready feedback.</span>
        </label>

        <textarea
          className={`field resize-none ${compact ? "min-h-40" : "min-h-52"}`}
          placeholder="Paste a job description here for a role-specific score. Optional: leave blank and ResumeIQ will detect the profession automatically."
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
        />

        <button className="primary-btn w-full sm:w-fit" type="button" onClick={handleAnalyze} disabled={!canAnalyze || loading.upload || loading.analyze}>
          <ScanSearch size={18} />
          {loading.upload || loading.analyze ? "Analyzing..." : "Analyze"}
        </button>
      </div>
    </motion.section>
  );
}
