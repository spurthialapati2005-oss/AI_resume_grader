import { BarChart3, BrainCircuit, FileCheck2 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function DashboardStats() {
  const { analysis, interviewQuestions } = useAppStore();
  const questionCount = interviewQuestions
    ? Object.values(interviewQuestions).reduce((total, list) => total + (list?.length || 0), 0)
    : 0;
  const suggestionCount = analysis?.aiSuggestions?.length || 0;

  const stats = [
    {
      label: "Analyses",
      value: analysis ? "1" : "0",
      icon: FileCheck2,
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "ATS score",
      value: analysis?.atsScore ? `${analysis.atsScore}%` : "--",
      icon: BarChart3,
      color: "text-sky-700 bg-sky-50",
    },
    {
      label: "AI items",
      value: String(suggestionCount + questionCount),
      icon: BrainCircuit,
      color: "text-indigo-700 bg-indigo-50",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="glass-panel rounded-[1.5rem] p-4">
          <span className={`grid h-10 w-10 place-items-center rounded-full ${color}`}>
            <Icon size={18} />
          </span>
          <p className="mt-4 text-3xl font-black text-gray-950">{value}</p>
          <p className="mt-1 text-sm font-bold text-gray-500">{label}</p>
        </div>
      ))}
    </section>
  );
}
