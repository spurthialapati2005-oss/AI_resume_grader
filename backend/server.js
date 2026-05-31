import "dotenv/config";
import exp from "express";
import { connect } from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authRouter } from "./APIs/authAPI.js";
import { resumeRouter } from "./APIs/resumeAPI.js";
import { analysisRouter } from "./APIs/analysisAPI.js";
import { aiRouter } from "./APIs/aiAPI.js";

const app = exp();


// Allowed Origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "https://ai-resume-grader-seven.vercel.app",
].filter(Boolean);


// CORS
app.use(
  cors({
    origin: function (origin, callback) {

      // Allow Postman, mobile apps, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// Middlewares
app.use(exp.json({ limit: "10mb" }));
app.use(cookieParser());


// Static Uploads
app.use("/uploads", exp.static("uploads"));


// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ResumeIQ AI Backend Running",
  });
});


// Routes
app.use("/auth-api", authRouter);
app.use("/resume-api", resumeRouter);
app.use("/analysis-api", analysisRouter);
app.use("/ai-api", aiRouter);


// Port
const PORT = process.env.PORT || 5000;


// Database Connection
const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URL);

    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });

  } catch (err) {

    console.error(
      "Database Connection Error:",
      err
    );

    process.exit(1);
  }
};


// Start Server
connectDB();