import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Sparkles, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppStore } from "../store/useAppStore";

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const { user, login, register, loading } = useAppStore();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const isRegister = mode === "register";

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Please enter a valid password with at least 6 characters");
      return;
    }

    try {
      if (isRegister) {
        await register(form);
        toast.success("Account created. Login to continue.");
        navigate("/login");
        return;
      }

      await login({ email: form.email, password: form.password });
      toast.success("Welcome back");
      navigate("/home");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 py-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md rounded-[2rem] p-6 sm:p-8"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gray-950 text-white">
          <Sparkles size={22} />
        </div>
        <h1 className="mt-6 text-center text-4xl font-black tracking-normal text-gray-950">
          {isRegister ? "Create account" : "Login"}
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-gray-600">
          {isRegister
            ? "Start analyzing resumes and saving your profile."
            : "Login to access your resume workspace."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 grid gap-3">
          {isRegister && (
            <input
              className="field"
              placeholder="Username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              required
            />
          )}
          <input
            className="field"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            className="field"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />

          <button className="primary-btn mt-2 w-full" type="submit" disabled={loading.auth}>
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading.auth ? "Please wait..." : isRegister ? "Create account" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? "Already have an account?" : "No account yet?"}{" "}
          <Link className="font-black text-gray-950 underline decoration-gray-300 underline-offset-4" to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Create account"}
          </Link>
        </p>
      </motion.section>
    </main>
  );
}
