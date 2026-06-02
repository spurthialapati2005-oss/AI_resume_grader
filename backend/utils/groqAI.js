import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const model = "llama-3.3-70b-versatile";

const parseJsonObject = (value) => {
  const cleaned = String(value || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start >= 0 && end >= 0) {
    return JSON.parse(cleaned.slice(start, end + 1));
  }

  return JSON.parse(cleaned);
};

const uniqueStrings = (items = []) => {
  const seen = new Set();

  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const chatJSON = async ({ system, user, temperature = 0, maxTokens = 900 }) => {
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

const hasJobDescription = (jobDescription = "") => {
  const normalized = String(jobDescription).trim();

  return (
    normalized &&
    !/^general ats resume review/i.test(normalized) &&
    !/^no job description provided/i.test(normalized)
  );
};

const extractFacts = async (resumeText) =>
  chatJSON({
    system: `You are an expert resume parser.

Analyze the resume and extract facts ONLY.
Detect the candidate's profession and industry automatically.

Rules:
- Extract only information found in the resume.
- Do not invent missing details.
- Keep unknown fields as an empty string or empty array.
- Separate skills, tools, technologies, certifications, education, projects, achievements, and soft skills.
- Return valid JSON only. No markdown. No explanation.

JSON shape:
{
  "candidateName": "",
  "currentRole": "",
  "targetRole": "",
  "industry": "",
  "yearsExperience": "",
  "skills": [],
  "tools": [],
  "technologies": [],
  "certifications": [],
  "education": [],
  "projects": [],
  "achievements": [],
  "softSkills": []
}`,
    user: `Resume text:
${resumeText}`,
    temperature: 0,
    maxTokens: 1200,
  });

const generateIndustryBenchmark = async ({ facts, jobDescription }) =>
  chatJSON({
    system: `You are an industry hiring expert and ATS keyword strategist.

Given the detected profession and industry, generate the skills recruiters normally expect.
If a job description is provided, also extract the required skills from that job description.

Rules:
- Do not use a generic software-engineering benchmark unless the detected profession is software/IT.
- For non-tech roles, use non-tech/domain skills.
- Required skills must be relevant to the detected profession and industry.
- Job-description skills must come from the job description only.
- Return valid JSON only. No markdown. No explanation.

JSON shape:
{
  "profession": "",
  "industry": "",
  "requiredSkills": [],
  "jobDescriptionSkills": []
}`,
    user: `Detected resume facts:
${JSON.stringify(facts, null, 2)}

Job description:
${hasJobDescription(jobDescription) ? jobDescription : "No job description provided."}`,
    temperature: 0.15,
    maxTokens: 900,
  });

const evaluateAts = async ({
  facts,
  benchmark,
  jobDescription,
  resumeText,
}) =>
  chatJSON({
    system: `You are a strict but fair ATS resume scoring system.

Evaluate the resume using this pipeline:
Resume facts -> detected profession -> industry benchmark -> job description match if present -> ATS score -> feedback.

Return ONLY valid JSON.

Required JSON shape:
{
  "atsScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "summary": ""
}

Rules:
1. ATS score must be based on actual resume content.
2. Missing skills must come only from the provided benchmark skills or job-description skills.
3. Never mention skills unrelated to the detected profession.
4. Do not invent technologies, certifications, projects, employers, tools, or achievements.
5. Give realistic recruiter-style feedback.
6. If a job description exists, prioritize job-description skills over general benchmark skills.
7. If no job description exists, evaluate against the industry benchmark.
8. Strengths must reference facts actually present in the resume.
9. Weaknesses must explain what is weak or missing without exaggerating.
10. Suggestions must be practical edits the candidate can make truthfully.
11. Do not include recruiterSummary.

Scoring guide:
- 90-100 = Excellent: highly aligned, strong evidence, strong keywords, measurable impact.
- 80-89 = Strong: good alignment with a few missing keywords or evidence gaps.
- 70-79 = Good: relevant background but several improvements needed.
- 60-69 = Average: partial alignment, weak keyword/evidence coverage.
- Below 60 = Needs Improvement: major gaps against role expectations.

Scoring dimensions:
- Skills and keyword alignment.
- Experience relevance.
- Projects or work evidence.
- Certifications or education relevance.
- Measurable achievements.
- ATS-friendly clarity and completeness.`,
    user: `Extracted resume facts:
${JSON.stringify(facts, null, 2)}

Industry benchmark:
${JSON.stringify(benchmark, null, 2)}

Job description:
${hasJobDescription(jobDescription) ? jobDescription : "No job description provided."}

Full resume text for evidence checking:
${resumeText}`,
    temperature: 0.2,
    maxTokens: 1300,
  });

export const analyzeResumeAI = async (resumeText, jobDescription = "") => {
  const facts = await extractFacts(resumeText);
  const benchmark = await generateIndustryBenchmark({
    facts,
    jobDescription,
  });
  const evaluation = await evaluateAts({
    facts,
    benchmark,
    jobDescription,
    resumeText,
  });

  const resumeSkills = uniqueStrings([
    ...asArray(facts.skills),
    ...asArray(facts.tools),
    ...asArray(facts.technologies),
    ...asArray(facts.softSkills),
  ]).slice(0, 60);

  const requiredSkills = uniqueStrings([
    ...asArray(benchmark.jobDescriptionSkills),
    ...asArray(benchmark.requiredSkills),
  ]).slice(0, 30);

  const missingSkills = uniqueStrings(evaluation.missingSkills)
    .filter((skill) =>
      requiredSkills.some(
        (requiredSkill) =>
          requiredSkill.toLowerCase() === skill.toLowerCase() ||
          requiredSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(requiredSkill.toLowerCase()),
      ),
    )
    .slice(0, 10);

  return JSON.stringify({
    atsScore: Math.max(0, Math.min(100, Number(evaluation.atsScore) || 0)),
    detectedRole:
      facts.targetRole ||
      facts.currentRole ||
      benchmark.profession ||
      "",
    detectedIndustry:
      facts.industry ||
      benchmark.industry ||
      "",
    experienceLevel: facts.yearsExperience || "",
    extractedSkills: resumeSkills,
    requiredSkills,
    matchedSkills: uniqueStrings(evaluation.matchedSkills).slice(0, 15),
    missingSkills,
    summary: evaluation.summary || "",
    strengths: uniqueStrings(evaluation.strengths).slice(0, 6),
    weaknesses: uniqueStrings(evaluation.weaknesses).slice(0, 6),
    suggestions: uniqueStrings(evaluation.suggestions).slice(0, 6),
  });
};
