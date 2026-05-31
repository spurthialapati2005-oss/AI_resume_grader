import { Link } from "react-router-dom";
import { Mail, Pencil, Target, UserRound } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function ProfileCard() {
  const user = useAppStore((state) => state.user);

  return (
    <section className="glass-panel rounded-[2rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gray-950 text-white">
            <UserRound size={24} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Profile</p>
            <h2 className="truncate text-2xl font-black text-gray-950">{user?.username || "Guest user"}</h2>
          </div>
        </div>
        <div className="min-w-0">
          <Link className="icon-btn" to="/profile" aria-label="Edit profile">
            <Pencil size={17} />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-3 text-sm text-gray-600">
          <Mail size={17} />
          <span className="truncate">{user?.email || "Login to save analysis"}</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-3 text-sm text-gray-600">
          <Target size={17} />
          <span className="truncate">{user?.targetRole || "Software Developer"}</span>
        </div>
      </div>
    </section>
  );
}
