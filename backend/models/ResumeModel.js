import { model, Schema } from "mongoose";

const resumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeUrl: {
      type: String,
      required: true,
    },

    resumeName: {
      type: String,
      default: "",
    },

    resumeText: {
      type: String,
      required: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    summary: {
      type: String,
      default: "",
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    aiSuggestions: {
      type: [String],

      default: [],
    },

    analyzedRole: {
      type: String,
      default: "",
    },

    detectedIndustry: {
      type: String,
      default: "",
    },

    experienceLevel: {
      type: String,
      default: "",
    },

    extractedSkills: {
      type: [String],
      default: [],
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    matchedSkills: {
      type: [String],
      default: [],
    },
  },

  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  }
);

const ResumeModel = model(
  "ResumeAnalysis",
  resumeSchema
);

export default ResumeModel;
