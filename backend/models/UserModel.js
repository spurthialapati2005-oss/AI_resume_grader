import { model, Schema } from "mongoose";


// User Schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],

      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Duplicate email not allowed"],
      lowercase: true,
      trim: true,

      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        "Enter a valid email address",
      ],
    },


    password: {
      type: String,

      required: [true, "Password is required"],

      minlength: [ 6, "Password must be at least 6 characters",],
    },


    role: {
      type: String,
      enum: [
        "student",
        "developer",
        "recruiter",
      ],
      default: "student",
    },


    profilePicture: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    targetRole: {
      type: String,
      default: "Software Developer",
    },

    resumesAnalyzed: {
      type: Number,
      default: 0,
      min: [0, "Value cannot be negative"],
    },
  },

  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  }
);


// Export Model
const UserModel = model("User", userSchema);

export default UserModel;
