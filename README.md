# ResumeIQ - AI Resume Grader

A full stack MERN resume analysis application built to help users upload resumes, analyze ATS readiness, detect missing skills, and receive AI-powered career feedback.

ResumeIQ helps users review resumes for tech and non-tech roles using AI-based resume parsing, profession detection, industry benchmarking, ATS scoring, job description matching, suggestions, interview preparation, and career chat support.

The main goal of this project is to understand how full stack applications handle authentication, resume uploads, AI analysis, protected routes, database storage, and responsive frontend design.

---

# Project Overview

This application is designed for resume analysis and career preparation.

Users can:

- Create an account and log in securely
- Upload a resume
- Extract resume text from PDF or DOCX files
- Analyze resumes using AI
- Detect profession and industry automatically
- Compare resume skills with industry benchmarks
- Compare resumes with a job description
- View ATS score
- View strengths and weaknesses
- View missing skills
- Get resume improvement suggestions
- Update profile details
- Use an AI career chatbot
- Generate interview preparation questions

The project includes:

- Secure cookie-based JWT authentication
- Protected frontend routes
- MongoDB database integration
- Resume upload support
- Resume text extraction
- AI ATS analysis
- Industry benchmark generation
- Job description matching
- Career chatbot
- Profile management
- Toast notifications
- Responsive frontend layout

---

# Repository Structure

```text
AI_resume_grader/
├── backend/
│   ├── APIs/
│   │   ├── aiAPI.js
│   │   ├── analysisAPI.js
│   │   ├── authAPI.js
│   │   └── resumeAPI.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── multer.js
│   ├── models/
│   │   ├── ChatModel.js
│   │   ├── ResumeModel.js
│   │   ├── UserModel.js
│   │   └── UserResumeModel.js
│   ├── utils/
│   │   ├── extractText.js
│   │   ├── generateToken.js
│   │   └── groqAI.js
│   ├── req.http
│   ├── server.js
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── store/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── .gitattributes
└── README.md
```

---

# Tech Stack

## Frontend

- React 
- Vite
- React Router DOM
- Tailwind CSS
- Zustand
- Axios
- React Hot Toast
- Lucide React
- Framer Motion
- Recharts

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- cookie-parser
- CORS
- dotenv
- Multer
- Groq SDK
- pdfjs-dist

---

# Features

- User registration and login
- Secure authentication using httpOnly cookies
- Protected routes
- Resume upload
- PDF and DOCX resume text extraction
- AI resume fact extraction
- Automatic role and industry detection
- Industry benchmark skill generation
- ATS score calculation
- Job description matching
- Strength and weakness analysis
- Missing skills detection
- Resume improvement suggestions
- Profile update
- Change password support
- AI career chatbot
- Interview question generation
- Chat history storage
- Responsive frontend UI
- Toast messages for user feedback

---

# APIs Used

```text
| API Base       | Purpose                                      |
|----------------|----------------------------------------------|
| auth-api       | Register, login, logout, profile, password   |
| resume-api     | Resume upload and text extraction            |
| analysis-api   | AI resume analysis and ATS scoring           |
| ai-api         | Career chat, resume improvement, interviews  |
```

---

# How To Run Locally

## Backend

```bash
cd backend
npm install
npm start
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# What I Learned From This Project

- Building a full stack MERN application
- Connecting React frontend with Express backend
- Secure cookie-based authentication
- Protected frontend routes
- MongoDB schema design
- REST API development
- Resume upload handling
- PDF and DOCX text extraction
- AI prompt pipeline design
- ATS scoring logic
- Zustand state management
- Axios API integration
- Responsive UI development
- Debugging CORS, cookies, and backend connections
- Integrating AI features into a resume analysis application
