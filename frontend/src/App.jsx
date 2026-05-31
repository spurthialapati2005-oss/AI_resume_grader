import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadResume from "./components/UploadResume";
import ATSScoreCard from "./components/ATSScoreCard";
import AnalysisCard from "./components/AnalysisCard";
import SkillsCard from "./components/SkillsCard";
import SuggestionsCard from "./components/SuggestionsCard";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import AuthPage from "./components/AuthPage";
import ProfilePage from "./components/ProfilePage";
import ChatWindow from "./components/ChatWindow";
import { useAppStore } from "./store/useAppStore";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, authReady, loading } = useAppStore();

  if (!authReady || loading.auth) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function RootRoute() {
  const { user, authReady } = useAppStore();

  if (!authReady) {
    return <LoadingSpinner />;
  }

  return <Navigate to={user ? "/home" : "/login"} replace />;
}

function Home() {
  const navigate = useNavigate();

  return (
    <main>
      <Hero onStart={() => navigate("/analyze")} />
    </main>
  );
}

function Analyze() {
  const { analysis, loading } = useAppStore();

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-12">
      <section className="grid content-start gap-6">
        <UploadResume compact />
        <ATSScoreCard score={analysis?.atsScore || 0} loading={loading.analyze} />
      </section>

      <section className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <AnalysisCard title="Strengths" items={analysis?.strengths} tone="emerald" />
          <AnalysisCard title="Weaknesses" items={analysis?.weaknesses} tone="rose" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkillsCard skills={analysis?.missingSkills} />
          <SuggestionsCard />
        </div>
      </section>
    </main>
  );
}

function App() {
  const { loading, fetchProfile, authReady, chatOpen, user } = useAppStore();

  useEffect(() => {
    if (!authReady) {
      fetchProfile().catch(() => {});
    }
  }, [authReady, fetchProfile]);

  return (
    <div className="min-h-screen overflow-hidden text-gray-950">
      <Navbar />
      <div className={`transition-[padding] duration-300 ${user && chatOpen ? "xl:pr-[28rem]" : ""}`}>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/analyze" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
      {user && chatOpen && (
        <aside className="fixed inset-x-3 bottom-3 z-30 xl:inset-y-20 xl:left-auto xl:right-4 xl:w-[26.5rem]">
          <ChatWindow popup />
        </aside>
      )}
      {(loading.upload || loading.analyze) && <LoadingSpinner />}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 18px 50px rgba(17, 24, 39, 0.14)",
          },
          success: { iconTheme: { primary: "#111827", secondary: "#ffffff" } },
        }}
      />
    </div>
  );
}

export default App;
