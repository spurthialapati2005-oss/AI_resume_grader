import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Home, LogIn, LogOut, Menu, ScanSearch, Sparkles, UserRound, X } from "lucide-react";
import { toast } from "react-hot-toast";
import ChatLauncher from "./ChatLauncher";
import { useAppStore } from "../store/useAppStore";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAppStore();

  const pages = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Analyze", href: "/analyze", icon: ScanSearch },
  ];

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    toast.success("Signed out");
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
      isActive ? "bg-gray-950 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-950/5 bg-white/76 backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to={user ? "/home" : "/login"} className="flex min-w-0 items-center gap-2 text-sm font-black tracking-tight text-gray-950">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-950 text-white">
            <Sparkles size={17} />
          </span>
          <span className="truncate">ResumeIQ</span>
        </Link>

        {user && (
          <div className="hidden items-center gap-1 rounded-full border border-gray-200 bg-white/70 p-1 md:flex">
            {pages.map(({ label, href, icon: Icon }) => (
              <NavLink key={label} to={href} className={navClass}>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <ChatLauncher />
              <NavLink to="/profile" className={({ isActive }) => `icon-btn ${isActive ? "bg-gray-950 text-white" : ""}`} aria-label="Profile">
                <UserRound size={18} />
              </NavLink>
              <button className="icon-btn border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100" type="button" onClick={handleLogout} aria-label="Logout">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <NavLink to="/login" className="secondary-btn">
              <LogIn size={18} />
              Login
            </NavLink>
          )}
        </div>

        {user && (
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button className="icon-btn" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle pages">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <ChatLauncher />
            <NavLink to="/profile" className={({ isActive }) => `icon-btn ${isActive ? "bg-gray-950 text-white" : ""}`} aria-label="Profile">
              <UserRound size={18} />
            </NavLink>
            <button className="icon-btn border-rose-200 bg-rose-50 text-rose-700" type="button" onClick={handleLogout} aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </nav>

      <AnimatePresence>
        {open && user && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
          >
            <div className="grid gap-2 px-4 py-4">
              {pages.map(({ label, href, icon: Icon }) => (
                <NavLink key={label} to={href} className={navClass} onClick={() => setOpen(false)}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
