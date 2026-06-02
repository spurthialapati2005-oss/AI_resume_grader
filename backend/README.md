# ResumeIQ Backend

Backend server for the ResumeIQ AI Resume Grader built using Node.js, Express.js, and MongoDB.

This backend handles:

- Authentication
- User profile management
- Resume upload handling
- Resume text extraction
- AI resume analysis
- ATS score generation
- Job description matching
- Career chatbot APIs
- Interview question APIs
- Database operations

---

# Backend Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- cookie-parser
- CORS
- dotenv
- Multer
- Groq SDK
- pdfjs-dist

---

# Backend Development Process

1. Initialized backend project

```bash
npm init -y
```

2. Installed required backend dependencies

3. Created Express server

4. Connected MongoDB using Mongoose

5. Created models and schemas for:

- User
- Resume analysis
- User resume
- Chat history

6. Added authentication using JWT

7. Added password hashing using bcryptjs

8. Added cookie-based authentication using httpOnly cookies

9. Added protected route middleware

10. Added resume upload support using Multer

11. Added PDF and DOCX resume text extraction

12. Added AI resume analysis pipeline

13. Added career chatbot and interview preparation APIs

14. Added CORS support for frontend requests

---

# Folder Structure

```text
backend/
├── APIs/
│   ├── aiAPI.js
│   ├── analysisAPI.js
│   ├── authAPI.js
│   └── resumeAPI.js
│
├── middlewares/
│   ├── authMiddleware.js
│   └── multer.js
│
├── models/
│   ├── ChatModel.js
│   ├── ResumeModel.js
│   ├── UserModel.js
│   └── UserResumeModel.js
│
├── utils/
│   ├── extractText.js
│   ├── generateToken.js
│   └── groqAI.js
│
├── req.http
├── server.js
├── package.json
└── README.md
```

---

# Main Features

- User registration
- Secure login and logout
- JWT authentication using httpOnly cookies
- Protected APIs
- Password hashing using bcryptjs
- Profile fetch and update
- Change password API
- Resume upload API
- PDF and DOCX text extraction
- AI resume fact extraction
- Automatic role and industry detection
- Industry benchmark skill generation
- ATS score generation
- Strength and weakness analysis
- Missing skills detection
- Resume suggestions
- Career chatbot API
- Resume improvement API
- Interview question generation API
- Chat history storage
- CORS configuration

---

# APIs Used

```text
| API Base       | Purpose                                      |
|----------------|----------------------------------------------|
| auth-api       | Auth, profile, password, logout              |
| resume-api     | Resume upload and text extraction            |
| analysis-api   | Resume analysis and ATS scoring              |
| ai-api         | Career chat, suggestions, interview prep     |
```

---

# How To Run Backend

Install dependencies:

```bash
npm install
```

Start server:

```bash
npm start
```

Run development server:

```bash
npm run dev
```

---

# Security Features

- Password hashing using bcryptjs
- JWT authentication
- httpOnly cookie sessions
- Protected APIs using authentication middleware
- CORS origin control
- Safe registration response without password hash
- Profile update validation
- Password change validation
- Authenticated resume upload and analysis routes

---

# Testing APIs

Used:

- REST Client extension
- `req.http` file
- Browser frontend requests

---

# What I Learned

- Express routing
- MongoDB schema design
- Mongoose models
- Cookie-based JWT authentication
- Middleware usage
- REST API development
- Resume file upload handling
- Resume text extraction
- AI API integration
- Prompt pipeline design
- Backend security practices
