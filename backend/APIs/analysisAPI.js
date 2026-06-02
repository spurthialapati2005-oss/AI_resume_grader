import exp from "express";
import ResumeModel from "../models/ResumeModel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { extractText } from "../utils/extractText.js";
import { analyzeResumeAI } from "../utils/groqAI.js";

export const analysisRouter = exp.Router();

const parseAIResponse = (aiResponse) => {
  const cleanedResponse = String(aiResponse || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleanedResponse.indexOf("{");
  const end = cleanedResponse.lastIndexOf("}");

  if (start >= 0 && end >= 0) {
    return JSON.parse(cleanedResponse.slice(start, end + 1));
  }

  return JSON.parse(cleanedResponse);
};

const uniqueStrings = (items = []) => {
  const seen = new Set();

  return items
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const fallbackAnalyzeResume = (resumeText = "") => {
  const hasMetrics = /\b\d+%|\b\d+\+|\b\d+\s*(?:users|clients|patients|projects|staff|cases|reports|students|sales|revenue|hours)\b/i.test(resumeText);
  const hasEducation = /education|university|college|bachelor|master|degree|diploma|school/i.test(resumeText);
  const hasCertifications = /certification|certified|certificate|license|training|credential/i.test(resumeText);
  const hasSummary = /summary|profile|objective|professional summary/i.test(resumeText);

  return {
    atsScore: 55,
    detectedRole: "",
    detectedIndustry: "",
    experienceLevel: "",
    extractedSkills: [],
    requiredSkills: [],
    matchedSkills: [],
    missingSkills: [],
    summary:
      "AI analysis was unavailable, so ResumeIQ could only run a basic resume completeness check.",
    strengths: uniqueStrings([
      hasEducation && "Education details are present.",
      hasCertifications && "Certifications or training are included.",
      hasMetrics && "Some measurable achievements are present.",
      hasSummary && "A resume summary or profile section is present.",
    ]),
    weaknesses: uniqueStrings([
      !hasSummary && "Add a clear professional summary aligned to your target role.",
      !hasMetrics && "Add measurable outcomes to show scope and impact.",
      "Run the AI analysis again to compare this resume against a profession-specific benchmark.",
    ]),
    suggestions: [
      "Add a dedicated skills section with truthful role-specific keywords.",
      "Rewrite bullets using action, responsibility, and measurable result.",
      "Paste a job description for a more accurate ATS match.",
    ],
  };
};

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

      if (!resumeUrl) {
        return res.status(400).json({
          success: false,
          message: "Resume URL is required",
        });
      }

      const extractedResumeText =
        resumeText || (await extractText(resumeUrl));

      if (!extractedResumeText) {
        return res.status(400).json({
          success: false,
          message: "Could not extract text from resume",
        });
      }

      const targetJobDescription =
        jobDescription?.trim() ||
        "No job description provided";

      let parsedResponse;

      try {
        const aiResponse =
          await analyzeResumeAI(
            extractedResumeText,
            targetJobDescription,
          );

        parsedResponse = parseAIResponse(aiResponse);
      } catch (aiErr) {
        console.error("AI Analysis Fallback:", aiErr.message);
        parsedResponse = fallbackAnalyzeResume(extractedResumeText);
      }

      const analysis =
        await ResumeModel.create({
          userId: req.user._id,
          resumeUrl,
          resumeName,
          resumeText: extractedResumeText,
          jobDescription: targetJobDescription,
          atsScore: parsedResponse.atsScore || 0,
          analyzedRole: parsedResponse.detectedRole || "",
          detectedIndustry: parsedResponse.detectedIndustry || "",
          experienceLevel: parsedResponse.experienceLevel || "",
          extractedSkills: parsedResponse.extractedSkills || [],
          requiredSkills: parsedResponse.requiredSkills || [],
          matchedSkills: parsedResponse.matchedSkills || [],
          summary: parsedResponse.summary || "",
          missingSkills: parsedResponse.missingSkills || [],
          strengths: parsedResponse.strengths || [],
          weaknesses: parsedResponse.weaknesses || [],
          aiSuggestions: parsedResponse.suggestions || [],
        });

      res.status(200).json({
        success: true,
        message: "Resume analyzed successfully",
        analysis,
      });
    } catch (err) {
      console.error("Analysis Error:", err);

      res.status(500).json({
        success: false,
        message: "Resume analysis failed",
        error: err.message,
      });
    }
  },
);
