# AI Coding Mentor — API Contract (V1)

Base URL: http://localhost:3001/api

All requests and responses use JSON.

## 1. Run C Code

POST /code/run

Request:
{
  "code": "#include <stdio.h>\nint main(){printf(\"Hello\");return 0;}",
  "stdin": ""
}

Successful response:
{
  "success": true,
  "stdout": "Hello",
  "stderr": "",
  "compileOutput": "",
  "exitCode": 0
}

Compilation failure:
{
  "success": false,
  "stdout": "",
  "stderr": "",
  "compileOutput": "Compiler error details",
  "exitCode": 1
}

## 2. Explain an Error

POST /mentor/explain

Request:
{
  "code": "int main(){ printf(\"Hi\") }",
  "compileOutput": "Compiler error details"
}

Response:
{
  "explanation": "A beginner-friendly explanation.",
  "suggestion": "Check the statement syntax."
}

## 3. Get a Progressive Hint

POST /mentor/hint

Request:
{
  "code": "int main(){}",
  "problemId": "puzzle-001",
  "hintLevel": 1
}

Response:
{
  "hint": "Think about which condition needs to be checked.",
  "hintLevel": 1
}

Hint levels: 1, 2, 3.

## 4. Get Challenges

GET /puzzles

Response:
{
  "puzzles": [
    {
      "id": "puzzle-001",
      "title": "Fix the Missing Semicolon",
      "topic": "variables",
      "difficulty": "easy",
      "description": "Find and fix the error.",
      "starterCode": "int main(){return 0}"
    }
  ]
}

## 5. Submit a Challenge

POST /puzzles/:id/submit

Request:
{
  "code": "int main(){return 0;}"
}

Response:
{
  "passed": true,
  "feedback": "All required tests passed."
}

## General Rules

- Frontend must use these endpoint names.
- Backend must follow these response structures.
- Validate all incoming data.
- Return appropriate HTTP status codes.
- Never expose API keys.
- Only the backend communicates with Gemini and the execution service.
- Challenge correctness must be determined by tests, not AI guesses.
- Store completed puzzle IDs in frontend localStorage.
- Unlock the next topic after three distinct completed puzzles.
