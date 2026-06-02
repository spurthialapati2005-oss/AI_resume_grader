# ResumeIQ Frontend

Frontend for the ResumeIQ AI Resume Grader built using React and Vite.

This frontend provides:

- Authentication pages
- Protected routes
- Resume upload interface
- ATS score display
- Resume analysis cards
- Missing skills display
- Suggestions section
- Profile page
- Career chatbot interface
- Responsive navigation
- Toast notifications

---

# Frontend Tech Stack

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

---

# Frontend Development Process

1. Created React app using Vite

2. Organized folder structure

3. Configured routing using React Router

4. Created protected routes for logged-in users

5. Designed reusable components for:

- Navbar
- Hero section
- Resume upload
- ATS score card
- Analysis cards
- Skills card
- Suggestions card
- Profile page
- Chat launcher
- Chat window
- Loading spinner

6. Connected frontend with backend APIs using Axios

7. Added Zustand for global app state management

8. Added authentication handling using cookie-based sessions

9. Added toast notifications using React Hot Toast

10. Added resume analysis pages for:

- Home
- Analyze
- Profile
- Login
- Register

11. Added responsive UI using Tailwind CSS

12. Added chatbot popup for career-related questions

13. Added loading states for upload and analysis actions

---

# Folder Structure

```text
frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/
│   │   ├── AnalysisCard.jsx
│   │   ├── ATSScoreCard.jsx
│   │   ├── AuthPage.jsx
│   │   ├── ChatInput.jsx
│   │   ├── ChatLauncher.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── DashboardStats.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── InterviewCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProfileCard.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── SkillsCard.jsx
│   │   ├── SuggestionsCard.jsx
│   │   └── UploadResume.jsx
│   │
│   ├── lib/
│   │   └── api.js
│   │
│   ├── store/
│   │   └── useAppStore.js
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

# Main Features

- Login page
- Register page
- Cookie-based session handling
- Protected routes
- Home page
- Resume analysis page
- Resume file upload
- Job description input
- ATS score card
- Strengths and weaknesses cards
- Missing skills card
- AI suggestions card
- Profile update page
- Career chatbot popup
- Chat history UI
- Toast messages for user feedback
- Responsive navbar
- Loading spinner for upload and analysis

---

# Frontend Pages

```text
| Page       |
|------------|
| Login      |
| Register   |
| Home       |
| Analyze    |
| Profile    |
```

---

# API Connection

Axios is used for API requests.

---

# How To Run Frontend

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

---

# Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

# UI Features

- Clean resume analysis layout
- Responsive navbar
- Protected navigation
- Resume upload panel
- ATS score progress card
- Strength and weakness cards
- Missing skills badges
- Suggestions section
- Chatbot popup
- Profile form
- Toast notifications
- Responsive cards and forms

---

# What I Learned

- React component architecture
- Routing and protected navigation
- Zustand state management
- API integration using Axios
- Cookie-based authentication from frontend
- Responsive UI development
- Tailwind CSS utility styling
- Toast notifications
- Resume analysis UI design
- Frontend build workflow
