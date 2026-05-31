import exp from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import Groq from "groq-sdk";
import ChatModel from "../models/ChatModel.js";
import ResumeModel from "../models/ResumeModel.js";

export const aiRouter = exp.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const scopeReply =
  "I'm a career-focused AI assistant. I currently answer questions related to resumes, ATS optimization, jobs, internships, interview preparation, skills, learning roadmaps, career growth, placements, and technology careers. This question is outside my current scope.";

const careerKeywords = [
  "resume",
  "ats",
  "job",
  "jobs",
  "internship",
  "internships",
  "career",
  "interview",
  "mock",
  "skills",
  "skill",
  "roadmap",
  "salary",
  "placement",
  "placements",
  "technology",
  "tech",
  "non-tech",
  "developer",
  "engineer",
  "engineering",
  "software",
  "mern",
  "frontend",
  "backend",
  "fullstack",
  "ai",
  "ml",
  "data",
  "cloud",
  "devops",
  "portfolio",
  "linkedin",
  "github",
  "recruiter",
  "hr",
  "human resources",
  "nutrition",
  "diet",
  "dietary",
  "healthcare",
  "teacher",
  "teaching",
  "finance",
  "accounting",
  "marketing",
  "sales",
  "operations",
  "security",
  "design",
  "experience",
  "rewrite",
  "project",
  "projects",
  "bullet",
  "bullets",
  "education",
  "summary",
  "work",
  "history",
  "grade",
  "score",
  "strength",
  "strengths",
  "weakness",
  "weaknesses",
  "suggestion",
  "suggestions",
  "advice",
  "improve",
  "improvement",
  "improvements",
];

const parseAIJSON = (content) => {
  try {
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON Parse Error:", content);
    throw new Error("AI returned invalid JSON");
  }
};

const isCareerRelatedLocal = (prompt = "", history = []) => {
  const text = `${history.map((message) => message.content).join(" ")} ${prompt}`.toLowerCase();

  if (!text.trim()) return false;
  if (/^(hi|hello|hey|hii|help|start|thanks|thank you)$/i.test(prompt.trim())) return true;

  return careerKeywords.some((keyword) => text.includes(keyword));
};

const isCareerRelated = async (prompt, history = []) => {
  try {
    const response =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "system",
            content: `
You are a classifier.

Return ONLY:
YES
or
NO

YES if query is about:
- Resume
- ATS
- Jobs
- Internships
- Career advice
- Interview preparation
- Skills
- Learning roadmap
- Salary
- Placement preparation
- Technology careers
- Software engineering
- AI/ML careers
- Web development careers
- Any tech/non-tech role

NO otherwise.
`,
          },
          {
            role: "user",
            content: `Recent context: ${history.map((message) => `${message.role}: ${message.content}`).join("\n")}\n\nCurrent query: ${prompt}`,
          },
        ],

        temperature: 0,
      });

    return response.choices[0]
      .message.content
      .trim()
      .toUpperCase() === "YES";
  } catch (err) {
    console.error("Career Classifier Fallback:", err.message);
    return isCareerRelatedLocal(prompt, history);
  }
};

const buildInterviewQuestions = (role, experience = "0-1") => {
  const levelNote = experience ? ` for ${experience} years experience` : "";
  const base = String(role || "target role").trim();

  return {
    easy: [
      {
        question: `What are the core responsibilities of a ${base}${levelNote}?`,
        answer: "Explain daily tasks, collaboration, debugging, feature work, and ownership expectations.",
      },
      {
        question: `Which skills should a ${base} highlight first?`,
        answer: "Prioritize role-specific tools, projects, APIs, debugging, deployment, and measurable outcomes.",
      },
      {
        question: "How do you explain a project from your resume?",
        answer: "Cover problem, tech stack, your contribution, challenges, and measurable impact.",
      },
      {
        question: "How do you handle feedback during development?",
        answer: "Show openness, iteration, communication, and examples of improving work after review.",
      },
      {
        question: "Why are you interested in this role?",
        answer: "Connect company needs with your skills, projects, learning goals, and career direction.",
      },
    ],
    medium: [
      {
        question: `How would you improve performance in a ${base} project?`,
        answer: "Discuss profiling, reducing unnecessary work, caching, optimized queries, and measuring before/after.",
      },
      {
        question: "Describe a difficult bug you solved.",
        answer: "Use STAR: situation, debugging steps, root cause, fix, and prevention.",
      },
      {
        question: "How do you decide what to include on a resume?",
        answer: "Prioritize relevant projects, measurable impact, target keywords, and recent technical depth.",
      },
      {
        question: "How do you learn a new technology for a job requirement?",
        answer: "Build a small project, read docs, compare patterns, and apply it to real use cases.",
      },
      {
        question: "How do you communicate technical tradeoffs?",
        answer: "Compare cost, risk, scalability, maintainability, user impact, and timeline clearly.",
      },
    ],
    hard: [
      {
        question: `Design a scalable project architecture for a ${base} role.`,
        answer: "Explain modules, data flow, APIs, auth, deployment, monitoring, and scaling bottlenecks.",
      },
      {
        question: "How would you prepare for interviews in 14 days?",
        answer: "Audit resume, revise projects, practice fundamentals, mock interviews, and review target job keywords.",
      },
      {
        question: "How do you prove impact without professional experience?",
        answer: "Use project metrics: users, response time, features, test coverage, deployments, or automation saved.",
      },
      {
        question: "What would you do if production breaks after your change?",
        answer: "Rollback, communicate, inspect logs, isolate root cause, patch safely, and document prevention.",
      },
      {
        question: "How do you stand out among similar candidates?",
        answer: "Show specific niche skills, deployed projects, strong resume bullets, and clear role alignment.",
      },
    ],
  };
};

const fallbackCareerReply = (prompt, history = []) => {
  const text = `${history.map((message) => message.content).join(" ")} ${prompt}`.toLowerCase();
  const promptText = prompt.toLowerCase();

  if (!isCareerRelatedLocal(prompt, history)) {
    return scopeReply;
  }

  if (promptText.includes("trend") || promptText.includes("trending") || promptText.includes("in demand")) {
    return [
      "Trending job skills right now:",
      "1. AI literacy: useful across tech, marketing, HR, finance, and operations.",
      "2. Data analysis: Excel, SQL, dashboards, and decision-making with metrics.",
      "3. Cloud and automation: valuable for technical and operations roles.",
      "4. Cybersecurity awareness: important for almost every organization.",
      "5. Communication with tools: writing, reporting, documentation, and stakeholder updates.",
      "Pick skills based on your target role, not random trends.",
    ].join("\n");
  }

  if (promptText.includes("interview") || promptText.includes("mock question") || promptText.includes("mock questions")) {
    const roleMatch = prompt.match(/for\s+(.+?)(?:role)?$/i);
    const role = roleMatch?.[1]?.trim() || "your target role";

    return [
      `Here are quick interview questions for ${role}:`,
      "1. Tell me about a project you built and the impact.",
      "2. What technical challenge did you solve recently?",
      "3. How do you debug production or deployment issues?",
      "4. How do you prioritize features under a deadline?",
      "5. Which skills make you job-ready for this role?",
    ].join("\n");
  }

  if (promptText.includes("roadmap")) {
    return [
      "Here is a focused roadmap:",
      "1. Learn the core tools required by the role.",
      "2. Build 2 portfolio projects with real deployment.",
      "3. Add measurable resume bullets for each project.",
      "4. Practice interview questions weekly.",
      "5. Apply with tailored resumes for each job.",
    ].join("\n");
  }

  if (promptText.includes("resume") || promptText.includes("ats")) {
    return [
      "Improve your resume by:",
      "- Adding measurable results to project bullets.",
      "- Matching important job-description keywords naturally.",
      "- Keeping formatting simple for ATS parsing.",
      "- Moving strongest skills and links near the top.",
    ].join("\n");
  }

  if (/^(hi|hello|hey|hii|help|start)$/i.test(prompt.trim())) {
    return "Hi, I'm your ResumeIQ career coach. Ask me about resume improvements, ATS score, internships, job search, interview prep, trending skills, or a learning roadmap.";
  }

  return "Tell me your target role, experience level, and current skills. I can suggest resume fixes, interview prep, job search steps, and skills to learn next.";
};

const fallbackResumeImprove = (resumeText) => ({
  summary: [
    "Lead with target role, strongest skills, and measurable impact.",
    "Move key credentials, contact details, and profile links near the top.",
    "Use a concise summary aligned to the exact role you want.",
  ],
  missingSkills: [
    resumeText.toLowerCase().includes("nutrition") ? "Add food safety, sanitation, or meal-planning evidence." : "Add role-specific skills from the job description.",
    "Add missing certifications, tools, or domain methods only if truthful.",
    "Include keywords from the exact job posting naturally.",
  ],
  projectImprovements: [
    "For each role/project, add responsibility, action, and outcome.",
    "Include measurable results like volume, efficiency, satisfaction, quality, or cost impact.",
    "Mention tools, systems, certifications, or processes used.",
  ],
  atsTips: [
    "Use simple headings: Skills, Projects, Education, Experience.",
    "Mirror exact role keywords from each job description.",
    "Avoid tables, graphics, and overly decorative resume layouts.",
  ],
});

// CAREER CHAT
aiRouter.post(
  "/career-chat",
  authMiddleware,
  async (req, res) => {
    try {
      const { prompt, history = [] } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: "Prompt is required",
        });
      }

      const allowed =
        await isCareerRelated(prompt, history);

      if (!allowed) {
        return res.status(200).json({
          success: true,
          reply: scopeReply,
        });
      }

      try {
        const latestResume = await ResumeModel.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

        let resumeContext = "";
        if (latestResume) {
          resumeContext = `
You have access to the user's currently uploaded and analyzed resume:
- Resume Name: "${latestResume.resumeName || "Resume"}"
- ATS Score: ${latestResume.atsScore}/100
- Detected Role: "${latestResume.analyzedRole || "Unknown"}"
- Detected Industry: "${latestResume.detectedIndustry || "Unknown"}"
- Experience Level: "${latestResume.experienceLevel || "Unknown"}"
- Target Job Description/Role: "${latestResume.jobDescription || "No job description provided"}"
- Extracted Resume Skills:
${(latestResume.extractedSkills || []).map((s) => `  * ${s}`).join("\n")}
- Required/Benchmark Skills:
${(latestResume.requiredSkills || []).map((s) => `  * ${s}`).join("\n")}
- Matched Skills:
${(latestResume.matchedSkills || []).map((s) => `  * ${s}`).join("\n")}
- Strengths:
${latestResume.strengths.map((s) => `  * ${s}`).join("\n")}
- Weaknesses:
${latestResume.weaknesses.map((w) => `  * ${w}`).join("\n")}
- Missing Skills:
${latestResume.missingSkills.map((m) => `  * ${m}`).join("\n")}
- AI Suggestions:
${latestResume.aiSuggestions.map((s) => `  * ${s}`).join("\n")}

Resume Extracted Text:
"""
${latestResume.resumeText}
"""

Guidelines for Resume Chat:
- If the user asks about their resume, score, strengths, weaknesses, missing skills, or suggestions, reference the analysis data above to give specific, accurate details.
- If the user asks to rewrite a part of their resume (e.g. project bullets, summary, experience), generate high-quality, professional, action-oriented content tailored to their actual resume context and targeted job description.
- Reference actual details from their resume when answering.
`;
        }

        const response =
          await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",

            messages: [
              {
                role: "system",
                content: `
You are CareerPilot AI, a personalized career coach and resume strategist.

You are ResumeIQ AI, an intelligent career coach and job assistant.

Your purpose is to help users with:
- Resume review
- ATS optimization
- Resume improvement
- Job search
- Internships
- Career planning
- Career switching
- Placement preparation
- Interview preparation
- Mock interviews
- Technical and non-technical skills
- Learning roadmaps
- Trending technologies and industry skills
- Certifications
- Career growth
- Salary discussions
- LinkedIn optimization
- Portfolio advice

You support both technical and non-technical careers including software, AI, data, cybersecurity, cloud, DevOps, product, HR, marketing, finance, accounting, teaching, recruiting, sales, operations, healthcare, nutrition, security, and design.

${resumeContext}

Before answering, identify the user's intent internally:
- Resume Review
- ATS Analysis
- Interview Questions
- Mock Interview
- Career Roadmap
- Trending Skills
- Internship Guidance
- Job Search
- Skill Recommendation
- Certification Advice
- Salary Guidance
- Career Advice
- Out Of Scope

Rules:
1. Sound like a real mentor.
2. Answer naturally.
3. Never repeat generic advice.
4. Understand conversation context. Use the uploaded resume data to answer user requests contextually.
5. Give direct answers.
6. Use bullets only when useful.
7. Keep responses between 100-300 words unless the user asks for something shorter.
8. If user asks for interview questions, generate role-specific questions.
9. If user asks roadmap, generate a step-by-step learning path.
10. If user asks resume advice, give resume-specific guidance.
11. Politely refuse questions outside ResumeIQ, jobs, internships, career, skills, resumes, interviews, and professional growth.
12. Never assume the user is in software or tech. Use the detected role and resume data when available.
13. Do not give interview questions unless the user asks for interview questions.
14. Do not give a roadmap unless the user asks for a roadmap.
15. If the user asks for trending skills, explain current skills, why they matter, and relevant roles.
`,
              },
              ...history.slice(-8).map((message) => ({
                role: message.role === "assistant" ? "assistant" : "user",
                content: message.content,
              })),
              {
                role: "user",
                content: prompt,
              },
            ],

            temperature: 0.7,
            max_tokens: 350,
          });

        const aiReply =
          response.choices[0].message.content;

        await ChatModel.create({
          userId: req.user._id,
          prompt,
          response: aiReply,
        });

        res.status(200).json({
          success: true,
          reply: aiReply,
        });
      } catch (aiErr) {
        console.error("Career Chat AI Fallback:", aiErr.message);
        const fallbackReply = fallbackCareerReply(prompt, history);

        await ChatModel.create({
          userId: req.user._id,
          prompt,
          response: fallbackReply,
        });

        res.status(200).json({
          success: true,
          reply: fallbackReply,
          fallback: true,
        });
      }
    } catch (err) {
      console.error("Career Chat Error:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// RESUME IMPROVEMENT
aiRouter.post(
  "/resume-improve",
  authMiddleware,
  async (req, res) => {
    try {
      const { resumeText, jobDescription } = req.body;

      if (!resumeText) {
        return res.status(400).json({
          success: false,
          message: "Resume text is required",
        });
      }

      try {
        const response =
          await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",

            messages: [
              {
                role: "user",
                content: `
Analyze the resume against the target Job Description (if provided).

Return ONLY JSON.

{
  "summary": [],
  "missingSkills": [],
  "projectImprovements": [],
  "atsTips": []
}

Rules:
- Maximum 3 points per section
- Each point under 20 words
- Mention actual technologies from resume
- Mention actual projects from resume and how to improve/tailor them
- ATS tips should be practical and tailored to the target role
- No generic advice
- Return JSON only

Resume:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}` : ""}
`,
              },
            ],

            temperature: 0.3,
          });

        const parsedSuggestions =
          parseAIJSON(
            response.choices[0].message.content
          );

        res.status(200).json({
          success: true,
          suggestions: parsedSuggestions,
        });
      } catch (aiErr) {
        console.error("Resume Improve Fallback:", aiErr.message);
        res.status(200).json({
          success: true,
          suggestions: fallbackResumeImprove(resumeText),
          fallback: true,
        });
      }
    } catch (err) {
      console.error("Resume Improve Error:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// INTERVIEW QUESTIONS
aiRouter.post(
  "/interview-questions",
  authMiddleware,
  async (req, res) => {
    try {
      const { role, experienceYears = "0-1", experienceArea = "" } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Role is required",
        });
      }

      const target = `${role}${experienceArea ? `, ${experienceArea}` : ""}, ${experienceYears} years experience`;

      try {
        const response =
          await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",

            messages: [
              {
                role: "user",
                content: `
Generate interview preparation material for:

${target}

Return ONLY JSON.

{
  "easy": [],
  "medium": [],
  "hard": []
}

Rules:

- 5 Easy Questions
- 5 Medium Questions
- 5 Hard Questions

Each object:

{
  "question":"",
  "answer":""
}

Answer should be concise.

Return JSON only.
`,
              },
            ],

            temperature: 0.5,
          });

        const parsedQuestions =
          parseAIJSON(
            response.choices[0].message.content
          );

        res.status(200).json({
          success: true,
          questions: parsedQuestions,
        });
      } catch (aiErr) {
        console.error("Interview Question Fallback:", aiErr.message);
        res.status(200).json({
          success: true,
          questions: buildInterviewQuestions(role, experienceYears),
          fallback: true,
        });
      }
    } catch (err) {
      console.error("Interview Question Error:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);
