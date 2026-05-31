import { GitBranch, HeartHandshake, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-950/5 bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-semibold">ResumeIQ AI. Built for focused resume iteration.</p>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2">
            <HeartHandshake size={16} />
            React + Express
          </span>
          <span className="inline-flex items-center gap-2">
            <GitBranch size={16} />
            AI resume grader
          </span>
          <a className="inline-flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-950" href="mailto:spurthialapati2005@gmail.com">
            <Mail size={16} />
            spurthialapati2005@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
