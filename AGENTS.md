# AI Coding Mentor — Project Instructions

## Project Goal
Build a beginner-friendly C programming learning platform.

The platform should help students understand their mistakes,
debug code, and improve their problem-solving skills.

## Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, Monaco Editor
- Backend: Node.js, Express, TypeScript
- AI: Gemini API (backend only)
- Code execution: Isolated sandbox API
- Progress storage: Browser localStorage (V1)

## Agent Responsibilities

### Antigravity — Frontend
- Work primarily inside frontend/
- Build the user interface and interactive components
- Create the code editor, challenges, and dashboard
- Connect the frontend to backend API endpoints

### Codex CLI — Backend
- Work primarily inside backend/
- Build Express API endpoints
- Integrate the isolated C execution service
- Integrate Gemini AI explanations and hints
- Implement puzzle validation and backend tests

## Shared Rules
- Do not modify the other agent's folder without approval.
- Coordinate changes to shared/ and docs/.
- Never expose API keys in frontend code.
- Never execute untrusted C code directly on the backend server.
- Keep the implementation beginner-friendly and maintainable.
- Do not create Git commits unless requested.

## Teaching Philosophy
Don't just fix the code. Teach the programmer how to fix it.

Give progressive hints instead of immediately revealing solutions.
