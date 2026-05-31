import { create } from "zustand";
import { api } from "../lib/api";

const initialMessages = [
  {
    role: "assistant",
    content:
      "Hi, I'm your ResumeIQ career coach. Ask me about resumes, ATS, internships, jobs, skills, interview prep, or career roadmaps.",
  },
];

export const useAppStore = create((set, get) => ({
  user: null,
  authReady: false,
  resumeFile: null,
  uploadedResume: null,
  analysis: null,
  improvement: null,
  interviewQuestions: null,
  chatOpen: false,
  messages: initialMessages,
  loading: {
    auth: false,
    upload: false,
    analyze: false,
    improve: false,
    interview: false,
    chat: false,
  },

  setResumeFile: (resumeFile) =>
    set({
      resumeFile,
      uploadedResume: null,
      analysis: null,
      improvement: null,
      interviewQuestions: null,
    }),

  setUser: (user) => set({ user }),

  setChatOpen: (chatOpen) => set({ chatOpen }),

  register: async (payload) => {
    set((state) => ({ loading: { ...state.loading, auth: true } }));
    try {
      const { data } = await api.post("/auth-api/register", payload);
      return data;
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  login: async (payload) => {
    set((state) => ({ loading: { ...state.loading, auth: true } }));
    try {
      const { data } = await api.post("/auth-api/login", payload);
      set({ user: data.user });
      return data;
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  fetchProfile: async () => {
    set((state) => ({ loading: { ...state.loading, auth: true } }));
    try {
      const { data } = await api.get("/auth-api/profile");
      set({ user: data.user, authReady: true });
      return data.user;
    } catch (error) {
      set({ user: null, authReady: true });
      throw error;
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  logout: async () => {
    try {
      await api.get("/auth-api/logout");
    } catch {
      // Local session cleanup still matters if the server cookie is already gone.
    }
    set({
      user: null,
      authReady: true,
      resumeFile: null,
      uploadedResume: null,
      analysis: null,
      improvement: null,
      interviewQuestions: null,
      messages: initialMessages,
    });
  },

  updateProfile: async (payload) => {
    set((state) => ({ loading: { ...state.loading, auth: true } }));
    try {
      const { data } = await api.put("/auth-api/profile", payload);
      set({ user: data.user });
      return data.user;
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  changePassword: async (payload) => {
    set((state) => ({ loading: { ...state.loading, auth: true } }));
    try {
      const { data } = await api.put("/auth-api/change-password", payload);
      return data;
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  uploadResume: async () => {
    const { resumeFile } = get();
    if (!resumeFile) throw new Error("Choose a PDF resume first");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    set((state) => ({ loading: { ...state.loading, upload: true } }));
    try {
      const { data } = await api.post("/resume-api/upload", formData);

      const uploadedResume = {
        name: resumeFile.name,
        url: data.fileUrl,
        path: data.path,
        resumeText: data.resumeText,
        id: data.resume?._id,
      };

      set({ uploadedResume });
      return uploadedResume;
    } finally {
      set((state) => ({ loading: { ...state.loading, upload: false } }));
    }
  },

  analyzeResume: async (jobDescription = "") => {
    let uploadedResume = get().uploadedResume;
    const { resumeFile } = get();

    if (!uploadedResume) {
      uploadedResume = await get().uploadResume();
    }

    set((state) => ({ loading: { ...state.loading, analyze: true } }));
    try {
      const { data } = await api.post("/analysis-api/analyze", {
        resumeUrl: uploadedResume.url,
        resumeName: resumeFile?.name || uploadedResume.name,
        resumeText: uploadedResume.resumeText,
        jobDescription,
      });

      set({ analysis: data.analysis });
      return data.analysis;
    } finally {
      set((state) => ({ loading: { ...state.loading, analyze: false } }));
    }
  },

  improveResume: async () => {
    const { analysis } = get();
    if (!analysis?.resumeText) {
      throw new Error("Run an analysis before requesting improvements");
    }

    set((state) => ({ loading: { ...state.loading, improve: true } }));
    try {
      const { data } = await api.post("/ai-api/resume-improve", {
        resumeText: analysis.resumeText,
        jobDescription: analysis.jobDescription || "",
      });
      set({ improvement: data.suggestions });
      return data.suggestions;
    } finally {
      set((state) => ({ loading: { ...state.loading, improve: false } }));
    }
  },

  generateInterview: async ({ role, experienceYears = "0-1", experienceArea = "" }) => {
    if (!role?.trim()) throw new Error("Enter a role to practice for");

    set((state) => ({ loading: { ...state.loading, interview: true } }));
    try {
      const { data } = await api.post("/ai-api/interview-questions", {
        role,
        experienceYears,
        experienceArea,
      });
      set({ interviewQuestions: data.questions });
      return data.questions;
    } finally {
      set((state) => ({ loading: { ...state.loading, interview: false } }));
    }
  },

  sendChat: async (prompt) => {
    if (!prompt?.trim()) return;

    const history = get().messages.slice(-8);

    set((state) => ({
      messages: [...state.messages, { role: "user", content: prompt }],
      loading: { ...state.loading, chat: true },
    }));

    try {
      const { data } = await api.post("/ai-api/career-chat", {
        prompt,
        history,
      });
      set((state) => ({
        messages: [
          ...state.messages,
          { role: "assistant", content: data.reply || "I could not answer that." },
        ],
      }));
      return data.reply;
    } finally {
      set((state) => ({ loading: { ...state.loading, chat: false } }));
    }
  },
}));

