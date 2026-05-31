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


// Allowed Frontend Origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://your-frontend-domain.vercel.app",
].filter(Boolean);


// CORS Middleware
app.use( cors({ origin: (origin, callback) => {
    if (!origin || origin === "null" || allowedOrigins.includes(origin)) {
        return callback(null, true);
    }
    return callback(
        new Error(`CORS blocked for origin: ${origin}`)
    );
},
credentials: true,
}));


// Built-in Middlewares
app.use(exp.json({ limit: "10mb" }));
app.use(cookieParser());


// Static Uploads Folder
app.use("/uploads", exp.static("uploads"));


// Health Route
app.get("/", (req, res) => {
  res.send("ResumeIQ AI Backend Running");
});


// API Routes
app.use("/auth-api", authRouter);
app.use("/resume-api", resumeRouter);
app.use("/analysis-api", analysisRouter);
app.use("/ai-api", aiRouter);


// PORT
const PORT = process.env.PORT;


// Database Connection
const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URL);

    console.log("MongoDB Connection Success");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.log("Database Connection Error:", err);
  }
};

// Start Server
connectDB();
