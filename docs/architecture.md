# AI Coding Mentor — Architecture

## Project Overview
AI Coding Mentor is a beginner-friendly platform for learning C programming through coding challenges, debugging puzzles, and AI-guided hints.

## Frontend
Technology: React + TypeScript + Vite + Tailwind CSS + Monaco Editor

Main pages:
1. Home
2. Playground
3. Challenges
4. Dashboard
5. Profile

## Backend
Technology: Node.js + Express + TypeScript

Responsibilities:
- Validate incoming requests
- Send C programs to an isolated execution service
- Return compiler errors and program output
- Request explanations and hints from Gemini
- Validate challenge submissions

## Application Flow

Student
   |
   v
React Frontend
   |
   v
Express Backend
   |
   +----> Isolated C Execution Service
   |          |
   |          v
   |      Compiler Results
   |
   +----> Gemini API
              |
              v
         AI Explanations

## MVP Features
1. C code editor
2. Run code and view output
3. Compiler error explanations
4. Progressive AI hints
5. Debug-the-Code puzzles
6. Topic unlocking
7. Local progress dashboard

## Learning Progression
Stage 1: Variables and Operators
Stage 2: Conditional Statements
Stage 3: Loops
Stage 4: Mixed Logic

Unlock the next stage after correctly solving three distinct puzzles in the current stage.

## Security Rules
- Keep Gemini API keys on the backend.
- Never run student code directly on the backend server.
- Validate requests and limit code size.
- Apply execution time and output limits.
- Treat submitted code as untrusted input.

## Future Features
V2: Accounts, Supabase, XP, badges
V3: GitHub repository analysis
V4: Advanced agentic debugging
