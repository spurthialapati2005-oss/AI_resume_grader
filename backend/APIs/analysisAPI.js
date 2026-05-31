import exp from "express";
import ResumeModel from "../models/ResumeModel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { extractText } from "../utils/extractText.js";
import { analyzeResumeAI } from "../utils/groqAI.js";

export const analysisRouter = exp.Router();

const normalizeWords = (text = "") =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);

const unique = (items) => [...new Set(items.filter(Boolean))];

const includesAny = (text, terms) =>
  terms.some((term) => text.includes(term.toLowerCase()));

const extractMatches = (text, terms) =>
  unique(terms.filter((term) => text.includes(term.toLowerCase())));

const titleCase = (value) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

const fallbackAnalyzeResume = (resumeText = "", jobDescription = "") => {
  const lowerResume = resumeText.toLowerCase();
  const lowerTarget = jobDescription.toLowerCase();
  const hasRealJobDescription =
    jobDescription.trim() &&
    !/^general ats resume review/i.test(jobDescription.trim()) &&
    !/^no job description provided/i.test(jobDescription.trim());
  const metrics = unique(resumeText.match(/\b\d+%|\b\d+\+|\b\d+\s*(?:users|clients|patients|projects|staff|meals|menus|cases|reports|students|sales|revenue|hours)\b/gi) || []);

  const skillBank = {
    nutrition: ["clinical nutrition", "diet planning", "meal planning", "food service management", "food sanitation", "kitchen operations", "food safety", "menu planning", "dietary department", "nutrition assessment", "senior living", "staff supervision", "food production", "sanitation standards"],
    healthcare: ["patient care", "medical records", "clinical documentation", "hipaa", "care coordination", "patient assessment", "infection control", "emr", "safety protocols"],
    security: ["cctv", "access control", "incident reporting", "surveillance", "patrol", "loss prevention", "risk assessment", "emergency response", "visitor management", "physical security"],
    hr: ["recruitment", "talent acquisition", "employee relations", "payroll", "hrms", "onboarding", "performance management", "training", "compliance"],
    education: ["curriculum development", "classroom management", "lesson planning", "student assessment", "student engagement", "educational technology"],
    finance: ["accounting", "financial analysis", "budgeting", "forecasting", "reconciliation", "taxation", "audit", "financial reporting"],
    marketing: ["seo", "content strategy", "campaigns", "analytics", "social media", "copywriting", "lead generation", "branding"],
    sales: ["lead generation", "crm", "pipeline management", "negotiation", "account management", "sales targets", "customer relationship"],
    operations: ["process improvement", "vendor management", "inventory management", "logistics", "scheduling", "quality control", "procurement"],
    design: ["ui design", "ux research", "wireframing", "prototyping", "figma", "visual design", "user testing", "design systems"],
    data: ["python", "sql", "excel", "power bi", "tableau", "statistics", "machine learning", "pandas", "numpy", "analytics"],
    software: ["javascript", "typescript", "react", "node", "express", "mongodb", "sql", "python", "java", "aws", "docker", "api", "git"],
    general: ["communication", "documentation", "reporting", "team coordination", "problem solving", "customer service", "compliance", "training", "time management", "leadership"],
  };
  const roleSignals = [
    ["nutrition", ["nutrition", "dietary", "diet", "meal", "food service", "kitchen", "sanitation", "senior living"]],
    ["healthcare", ["healthcare", "patient", "clinical", "medical", "nurse", "hospital", "emr"]],
    ["security", ["security", "surveillance", "cctv", "guard", "patrol", "access control"]],
    ["hr", ["human resources", "hr", "recruitment", "talent acquisition", "payroll", "onboarding"]],
    ["education", ["teacher", "teaching", "curriculum", "classroom", "lesson", "student", "school"]],
    ["finance", ["finance", "accountant", "accounting", "audit", "tax", "budget", "forecast"]],
    ["sales", ["sales", "business development", "crm", "pipeline", "lead generation"]],
    ["operations", ["operations", "logistics", "procurement", "vendor", "inventory"]],
    ["design", ["designer", "design", "figma", "prototype", "wireframe", "ux", "ui"]],
    ["data", ["data", "analytics", "tableau", "power bi", "machine learning", "pandas"]],
    ["marketing", ["marketing", "seo", "campaign", "brand", "content", "social media"]],
    ["software", ["software", "developer", "engineer", "react", "node", "java", "api", "frontend", "backend"]],
  ];
  const domainScores = roleSignals.map(([domain, signals]) => {
    const skills = skillBank[domain] || [];
    return {
      domain,
      score:
        signals.filter((signal) => lowerResume.includes(signal)).length * 3 +
        (hasRealJobDescription ? signals.filter((signal) => lowerTarget.includes(signal)).length * 3 : 0) +
        extractMatches(lowerResume, skills).length +
        (hasRealJobDescription ? extractMatches(lowerTarget, skills).length : 0),
    };
  });
  const detectedDomain = domainScores.sort((a, b) => b.score - a.score)[0]?.score > 0
    ? domainScores[0].domain
    : "general";
  const allSkills = unique(Object.values(skillBank).flat());
  const domainSkills = skillBank[detectedDomain];
  const resumeSkills = extractMatches(lowerResume, allSkills);
  const requiredSkills = hasRealJobDescription
    ? extractMatches(lowerTarget, allSkills)
    : domainSkills.slice(0, 12);
  const requiredForScore = requiredSkills.length ? requiredSkills : domainSkills.slice(0, 8);
  const matchedSkills = requiredForScore.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = requiredForScore.filter((skill) => !resumeSkills.includes(skill)).slice(0, 8);
  const skillScore = Math.round((matchedSkills.length / Math.max(requiredForScore.length, 1)) * 75);
  const hasMetrics = metrics.length > 0;
  const hasCertifications = /certification|certified|certificate|license|training|credential/i.test(resumeText);
  const hasLinks = /linkedin|github|portfolio|https?:\/\//i.test(resumeText);
  const hasEducation = /education|university|college|bachelor|master|degree|diploma|school/i.test(resumeText);
  const hasSummary = /summary|profile|objective|professional summary/i.test(resumeText);
  const atsScore = Math.max(25, Math.min(100, skillScore + (hasMetrics ? 8 : 0) + (hasCertifications ? 6 : 0) + (hasLinks ? 4 : 0) + (hasEducation ? 4 : 0) + (hasSummary ? 3 : 0)));
  const domainLabel = {
    nutrition: "Nutrition Consultant",
    healthcare: "Healthcare Professional",
    security: "Security Officer",
    hr: "Human Resources Professional",
    education: "Teacher",
    finance: "Finance Professional",
    sales: "Sales Professional",
    operations: "Operations Professional",
    design: "Designer",
    data: "Data Analyst",
    marketing: "Marketing Specialist",
    software: "Software Developer",
    general: "Professional Specialist",
  }[detectedDomain];

  return {
    detectedRole: domainLabel,
    detectedIndustry: detectedDomain,
    extractedSkills: resumeSkills.map(titleCase),
    requiredSkills: requiredForScore.map(titleCase),
    matchedSkills: matchedSkills.map(titleCase),
    atsScore,
    summary: `${domainLabel} resume scored against ${hasRealJobDescription ? "the pasted job description" : "industry benchmark skills"}.`,
    missingSkills: missingSkills.map(titleCase),
    strengths: unique([
      matchedSkills.length > 0 && `Relevant skills found: ${matchedSkills.slice(0, 4).map(titleCase).join(", ")}.`,
      hasMetrics && `Quantified achievements are visible, including ${metrics.slice(0, 3).join(", ")}.`,
      hasCertifications && "Certifications or training strengthen role readiness.",
      hasEducation && "Education details are present for recruiter screening.",
      hasLinks && "Profile or portfolio links are available for verification.",
    ]).slice(0, 5),
    weaknesses: unique([
      !hasSummary && `Add a short ${domainLabel} summary aligned to the target role.`,
      missingSkills.length > 0 && `Missing important role keywords: ${missingSkills.slice(0, 4).map(titleCase).join(", ")}.`,
      !hasMetrics && "Add measurable outcomes to show scope and impact.",
      requiredForScore.length === 0 && "The job description has few clear skill keywords to compare.",
    ]).slice(0, 5),
    suggestions: unique([
      missingSkills.length > 0 && `Add truthful evidence for ${missingSkills.slice(0, 4).map(titleCase).join(", ")}.`,
      "Rewrite bullets as action + responsibility + measurable result.",
      `Place strongest ${domainLabel} skills in a dedicated Core Skills section.`,
      hasRealJobDescription ? "Mirror the job description's exact role keywords naturally." : "Tailor the resume to one target role before applying.",
    ]).slice(0, 5),
  };
};

// ANALYZE RESUME
analysisRouter.post(
  "/analyze",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        resumeUrl,
        resumeName,
        resumeText,
        jobDescription,
      } = req.body;

      // Validation
      if (!resumeUrl) {
        return res.status(400).json({
          success: false,
          message:
            "Resume URL is required",
        });
      }

      // Extract Resume Text
      const extractedResumeText =
        resumeText || (await extractText(resumeUrl));

      if (!extractedResumeText) {
        return res.status(400).json({
          success: false,
          message:
            "Could not extract text from resume",
        });
      }

      // AI Analysis
      const targetJobDescription =
        jobDescription?.trim() ||
        "General ATS resume review. Please identify the candidate's target industry and role from the resume and grade the resume against current standard hiring practices, formatting guidelines, and key required skills for that specific role.";

      let parsedResponse;

      try {
        const aiResponse =
          await analyzeResumeAI(
            extractedResumeText,
            targetJobDescription
          );

        // Robust JSON Extraction
        const start = aiResponse.indexOf("{");
        const end = aiResponse.lastIndexOf("}");
        
        if (start >= 0 && end >= 0) {
          const jsonString = aiResponse.slice(start, end + 1);
          parsedResponse = JSON.parse(jsonString);
        } else {
          const cleanedResponse = aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          parsedResponse = JSON.parse(cleanedResponse);
        }
      } catch (aiErr) {
        console.error("AI Analysis Fallback:", aiErr.message);
        parsedResponse = fallbackAnalyzeResume(
          extractedResumeText,
          targetJobDescription,
        );
      }

      // Save Analysis
      const analysis =
        await ResumeModel.create({
          userId: req.user._id,

          resumeUrl,
          resumeName,

          resumeText: extractedResumeText,

          jobDescription: targetJobDescription,

          atsScore:
            parsedResponse.atsScore,

          analyzedRole:
            parsedResponse.detectedRole || "",

          detectedIndustry:
            parsedResponse.detectedIndustry || "",

          experienceLevel:
            parsedResponse.experienceLevel || "",

          extractedSkills:
            parsedResponse.extractedSkills || [],

          requiredSkills:
            parsedResponse.requiredSkills || [],

          matchedSkills:
            parsedResponse.matchedSkills || [],

          summary:
            parsedResponse.summary || "",

          missingSkills:
            parsedResponse.missingSkills || [],

          strengths:
            parsedResponse.strengths || [],

          weaknesses:
            parsedResponse.weaknesses || [],

          aiSuggestions:
            parsedResponse.suggestions || [],
        });

      res.status(200).json({
        success: true,
        message:
          "Resume analyzed successfully",
        analysis,
      });

    } catch (err) {

      console.error(
        "Analysis Error:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          "Resume analysis failed",
        error: err.message,
      });

    }
  }
);
