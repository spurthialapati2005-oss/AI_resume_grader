import exp from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export const authRouter = exp.Router();

// Cookie Options
const cookieOptions = { 
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
};

// Email Regular Expression
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;


// Serialize User
const serializeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  skills: user.skills,
  targetRole: user.targetRole,
});


// REGISTER
authRouter.post( "/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({success: false, message: "All fields are required"});
      }

      // Normalize Email
      const normalizedEmail = String(email)
          .trim()
          .toLowerCase();

      // Validate Email
      if (!emailPattern.test(normalizedEmail)) {
        return res.status(400).json({success: false, message: "Enter valid email address"});
      }

      // Existing User Check
      const existingUser = await UserModel.findOne({
          $or: [
            { email: normalizedEmail },
            { username },
          ],
        });

      if (existingUser) {
        return res.status(400).json({success: false, message:"User already exists"});
      }

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create User
      const newUser = await UserModel.create({username, email: normalizedEmail, password: hashedPassword});

      res.status(201).json({success: true, message: "User Registered Successfully", user: serializeUser(newUser)});

    } catch (err) {
      console.error("Registration Error:",err);

      res.status(500).json({success: false, message: "Registration Failed", error: err.message});

    }
  }
);


// LOGIN
authRouter.post("/login", async (req, res) => {
    try {
      const {email, password} = req.body;

      // Find User
      const user = await UserModel.findOne({email: String(email)
              .trim()
              .toLowerCase(),
        });

      // Invalid Email
      if (!user) {
        return res.status(400).json({success: false, message: "Not a registered user. Create an account."});
      }

      // Compare Password
      const isMatch = await bcrypt.compare(password, user.password);

      // Invalid Password
      if (!isMatch) {
        return res.status(400).json({success: false, message: "Invalid password"});
      }

      // Generate JWT Token
      const token = jwt.sign(
        {
          userId: user._id,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1d",
        }
      );

      // Store Cookie
      res.cookie(
        "token",

        token,

        {
          ...cookieOptions,

          maxAge:
            24 * 60 * 60 * 1000,
        }
      );

      res.status(200).json({success: true, message: "Login Successful", user: serializeUser(user)});

    } catch (err) {
      console.error("Login Error:",err);
      res.status(500).json({success: false, message: "Login Failed", error: err.message});
    }

  }
);


// GET PROFILE
authRouter.get("/profile", authMiddleware, async (req, res) => {
    try {
      res.status(200).json({success: true, message: "Profile fetched successfully", user: serializeUser(req.user)});
    } catch (err) {
      res.status(500).json({success: false, message: "Failed to fetch profile", error: err.message});
    }
  }
);


// UPDATE PROFILE
authRouter.put("/profile", authMiddleware, async (req, res) => {
    try {
      const {
        username,
        email,
        role,
        skills,
        targetRole,
      } = req.body;

      const updates = {};

      if (username !== undefined) {
        const cleanUsername = String(username).trim();

        if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
          return res.status(400).json({
            success: false,
            message: "Username must be 3-20 characters and use only letters, numbers, or underscores",
          });
        }

        const existingUser = await UserModel.findOne({
          username: cleanUsername,
          _id: { $ne: req.user._id },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Username already exists",
          });
        }

        updates.username = cleanUsername;
      }

      if (email !== undefined) {
        const normalizedEmail = String(email).trim().toLowerCase();

        if (!emailPattern.test(normalizedEmail)) {
          return res.status(400).json({
            success: false,
            message: "Enter valid email address",
          });
        }

        const existingUser = await UserModel.findOne({
          email: normalizedEmail,
          _id: { $ne: req.user._id },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }

        updates.email = normalizedEmail;
      }

      if (role !== undefined) {
        const allowedRoles = ["student", "developer", "recruiter"];

        if (!allowedRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: "Invalid role",
          });
        }

        updates.role = role;
      }

      if (skills !== undefined) {
        updates.skills = Array.isArray(skills)
          ? skills.map((skill) => String(skill).trim()).filter(Boolean)
          : String(skills)
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean);
      }

      if (targetRole !== undefined) {
        updates.targetRole = String(targetRole).trim();
      }

      const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true },
      ).select("-password");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: serializeUser(user),
      });
    } catch (err) {
      console.error("Profile Update Error:", err);
      res.status(500).json({
        success: false,
        message: "Profile update failed",
        error: err.message,
      });
    }
  }
);


// CHANGE PASSWORD
authRouter.put("/change-password", authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      if (String(newPassword).length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }

      const user = await UserModel.findById(req.user._id);

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (err) {
      console.error("Change Password Error:", err);
      res.status(500).json({
        success: false,
        message: "Password change failed",
        error: err.message,
      });
    }
  }
);


// LOGOUT
authRouter.get("/logout", authMiddleware, async (req, res) => {
    try {
      res.clearCookie("token", cookieOptions);
      res.status(200).json({success: true, message: "Logout Successful"});
    } catch (err) {
      res.status(500).json({success: false, message: "Logout Failed"});
    }
  }
);
