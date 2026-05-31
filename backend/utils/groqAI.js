import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const model = "llama-3.3-70b-versatile";

const parseJsonObject = (value) => {
  const cleaned = String(value || "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  return JSON.parse(start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned);
};

const chatJSON = async ({ system, user, temperature = 0, maxTokens = 700 }) => {
  const response = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature,
    max_tokens: maxTokens,
  });

  return parseJsonObject(response.choices[0].message.content);
};

const isMissingJobDescription = (jobDescription = "") => {
  const normalized = String(jobDescription).trim();

  return (
    !normalized ||
    /^general ats resume review/i.test(normalized) ||
    /^no job description provided/i.test(normalized)
  );
};

const normalizeSkill = (skill = "") =>
  String(skill)
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, "");

const uniqueStrings = (items = []) => {
  const seen = new Set();

  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = normalizeSkill(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const skillMatches = (requiredSkill, resumeSkills = []) => {
  const required = normalizeSkill(requiredSkill);
  if (!required) return false;

  return resumeSkills.some((resumeSkill) => {
    const resume = normalizeSkill(resumeSkill);
    if (!resume) return false;
    if (resume === required) return true;
    if (required.length >= 5 && resume.includes(required)) return true;
    if (resume.length >= 5 && required.includes(resume)) return true;
    return false;
  });
};

const compareSkills = (requiredSkills = [], resumeSkills = []) => {
  const required = uniqueStrings(requiredSkills);
  const matchedSkills = required.filter((skill) => skillMatches(skill, resumeSkills));
  const missingSkills = required.filter((skill) => !skillMatches(skill, resumeSkills));

  return {
    matchedSkills,
    missingSkills,
  };
};

const calculateAtsScore = ({ requiredSkills, matchedSkills, resumeText }) => {
  const totalRequired = Math.max(requiredSkills.length, 1);
  const skillRatio = matchedSkills.length / totalRequired;
  const skillScore = Math.round(skillRatio * 75);
  const hasMetrics = /\b\d+%|\b\d+\+|\b\d+\s*(?:users|clients|patients|projects|staff|meals|menus|cases|reports|students|sales|revenue|hours)\b/i.test(resumeText);
  const hasCertifications = /certification|certified|certificate|license|training|credential/i.test(resumeText);
  const hasLinks = /linkedin|github|portfolio|https?:\/\//i.test(resumeText);
  const hasEducation = /education|university|college|bachelor|master|degree|diploma|school/i.test(resumeText);
  const hasSummary = /summary|profile|objective|professional summary/i.test(resumeText);
  const bonus =
    (hasMetrics ? 8 : 0) +
    (hasCertifications ? 6 : 0) +
    (hasLinks ? 4 : 0) +
    (hasEducation ? 4 : 0) +
    (hasSummary ? 3 : 0);

  return Math.max(25, Math.min(100, skillScore + bonus));
};

const detectResumeProfile = (resumeText) =>
  chatJSON({
    system: `Analyze this resume and identify the candidate profile.
Return ONLY JSON.

{
  "role": "",
  "industry": "",
  "experienceLevel": ""
}`,
    user: `Resume:\n${resumeText}`,
    maxTokens: 180,
  });

const extractResumeSkills = async (resumeText) => {
  const parsed = await chatJSON({
    system: `Extract all professional skills from this resume.
Include technical skills, non-technical role skills, tools, certifications, methods, and domain competencies.
Do not invent skills.
Return ONLY JSON.

{
  "skills": []
}`,
    user: `Resume:\n${resumeText}`,
    maxTokens: 650,
  });

  return uniqueStrings(parsed.skills).slice(0, 50);
};

const extractJobRequirements = async (jobDescription) =>
  chatJSON({
    system: `Analyze this job description and extract role requirements.
Return ONLY JSON.

{
  "role": "",
  "industry": "",
  "requiredSkills": [],
  "preferredSkills": []
}`,
    user: `Job Description:\n${jobDescription}`,
    maxTokens: 650,
  });

const generateRoleBenchmark = async (profile) => {
  const parsed = await chatJSON({
    system: `Generate the top 15 professional skills expected for this profession.
Never include programming, software, or web-development skills unless the profession is actually technical.
Return ONLY JSON.

{
  "skills": []
}`,
    user: `Role: ${profile.role || "Unknown"}\nIndustry: ${profile.industry || "Unknown"}\nExperience Level: ${profile.experienceLevel || "Unknown"}`,
    temperature: 0.1,
    maxTokens: 450,
  });

  return uniqueStrings(parsed.skills).slice(0, 15);
};

const generateFeedback = async ({
  resumeText,
  jobDescription,
  profile,
  resumeSkills,
  requiredSkills,
  matchedSkills,
  missingSkills,
  atsScore,
}) =>
  chatJSON({
    system: `You are ResumeIQ AI: an expert ATS scanner, recruiter, hiring manager, and career coach.

Write concise, specific resume analysis for any tech or non-tech profession.

Rules:
- Use ONLY the resume, job description, detected profile, and skill comparison provided.
- Never invent skills, projects, certifications, employers, or experience.
- Never recommend software/programming skills unless they are required for the detected role or JD.
- Strengths must reference actual resume content.
- Weaknesses must identify real gaps.
- Suggestions must be actionable and personalized.
- Return ONLY JSON.

{
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}`,
    user: `Detected Profile:
Role: ${profile.role || "Unknown"}
Industry: ${profile.industry || "Unknown"}
Experience Level: ${profile.experienceLevel || "Unknown"}

ATS Score calculated by backend: ${atsScore}/100

Resume Skills:
${resumeSkills.map((skill) => `- ${skill}`).join("\n") || "- None clearly extracted"}

Required/Benchmark Skills:
${requiredSkills.map((skill) => `- ${skill}`).join("\n") || "- None clearly extracted"}

Matched Skills:
${matchedSkills.map((skill) => `- ${skill}`).join("\n") || "- None"}

Missing Skills:
${missingSkills.map((skill) => `- ${skill}`).join("\n") || "- None"}

Resume:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}` : "No job description was provided. Use the benchmark skills only."}`,
    temperature: 0.25,
    maxTokens: 1100,
  });

export const analyzeResumeAI = async (resumeText, jobDescription = "") => {
  const missingJobDescription = isMissingJobDescription(jobDescription);
  const profile = await detectResumeProfile(resumeText);
  const resumeSkills = await extractResumeSkills(resumeText);
  const jobRequirements = missingJobDescription
    ? null
    : await extractJobRequirements(jobDescription);
  const requiredSkills = missingJobDescription
    ? await generateRoleBenchmark(profile)
    : uniqueStrings([
        ...(jobRequirements?.requiredSkills || []),
        ...(jobRequirements?.preferredSkills || []),
      ]).slice(0, 20);
  const { matchedSkills, missingSkills } = compareSkills(requiredSkills, resumeSkills);
  const atsScore = calculateAtsScore({
    requiredSkills,
    matchedSkills,
    resumeText,
  });
  const feedback = await generateFeedback({
    resumeText,
    jobDescription: missingJobDescription ? "" : jobDescription,
    profile,
    resumeSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    atsScore,
  });

  return JSON.stringify({
    atsScore,
    detectedRole: profile.role || jobRequirements?.role || "",
    detectedIndustry: profile.industry || jobRequirements?.industry || "",
    experienceLevel: profile.experienceLevel || "",
    extractedSkills: resumeSkills,
    requiredSkills,
    matchedSkills,
    missingSkills,
    summary: feedback.summary || "",
    strengths: Array.isArray(feedback.strengths) ? feedback.strengths.slice(0, 6) : [],
    weaknesses: Array.isArray(feedback.weaknesses) ? feedback.weaknesses.slice(0, 6) : [],
    suggestions: Array.isArray(feedback.suggestions) ? feedback.suggestions.slice(0, 6) : [],
  });
};
