import { model, Schema } from "mongoose";

const userResumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      default: "",
    },
    storageProvider: {
      type: String,
      enum: ["supabase", "pending"],
      default: "supabase",
    },
    storageWarning: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  },
);

const UserResumeModel = model("UserResume", userResumeSchema);

export default UserResumeModel;
