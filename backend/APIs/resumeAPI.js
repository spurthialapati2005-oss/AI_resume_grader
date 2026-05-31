import exp from "express";
import { upload } from "../middlewares/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { extractTextFromBuffer } from "../utils/extractText.js";

export const resumeRouter = exp.Router();

// Upload Resume
resumeRouter.post("/upload", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const resumeText = await extractTextFromBuffer(
      req.file.buffer,
      req.file.mimetype,
    );

    const safeOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${req.user._id}/${Date.now()}-${safeOriginalName}`;
    const fileUrl = `local-upload://${path}`;

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: {
        _id: path,
        resumeName: req.file.originalname,
        fileUrl,
        path,
        storageProvider: "local",
        createdAt: new Date().toISOString(),
      },
      fileUrl,
      path,
      resumeText,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({
      success: false,
      message: "Resume upload failed",
      error: err.message,
    });
  }
});
