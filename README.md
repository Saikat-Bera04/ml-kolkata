# Adapti-Learn: AI-Powered Adaptive Learning Platform

An intelligent learning platform that adapts to each student's pace, identifies learning gaps, and provides personalized recommendations using AI and machine learning algorithms.

## 🚀 Quick Setup

**For detailed installation instructions, see [SETUP.md](./SETUP.md)**

Quick start:
```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd adapti-learn-spark-38-main

# Install dependencies
npm install

# Set up environment variables (see SETUP.md)
# Adapti‑Learn — AI‑Powered Adaptive Learning & Career Assistant

Adapti‑Learn is an AI-first ed‑tech prototype that gives students hyper‑personalized learning guidance and career recommendations. It combines dynamic quiz generation, adaptive practice, explainable resume analysis, and curated learning resources — all tracked and iterated with Weights & Biases (W&B) and powered by Google Gemini for reasoning and generation.

This README explains the system architecture, how Gemini and W&B are used, security and reproducibility practices, and how to run and test the project locally.

---

## Key Features

- Quiz & Practice System
	- Dynamic quiz generation using Google Gemini (10 MCQs per quiz; 4 options; 1 correct answer; tagged concepts).
	- Sequential quiz attempts with per-question timing, automatic evaluation, score & accuracy calculations.
	- Weak-area detection mapped to concept tags for targeted remediation.

- Hyper‑Personalized Recommendations
	- Personalized YouTube video recommendations for weak areas (title, concept, difficulty, intent).
	- Adaptive study plan and difficulty adjustment per student based on performance.

- Explainable Career Assistance
	- Resume analysis and job recommendations with match scores and human‑readable explanations (strengths, missing skills, suggestions).

- Gamification & Progress Tracking
	- XP system, levels, and real‑time updates after quiz attempts.
	- Persistent progress across topics with visual analytics (progress bars, line charts, bar charts).

- Experiment Tracking & Reproducibility
	- W&B integration for logging runs, metrics, and artifacts so experiments are auditable and reproducible.

- Privacy & Security
	- All sensitive keys and model access must be kept server-side and not committed to source control.

---

## One-line Student Benefit

Adapti‑Learn transforms vague career and study advice into concrete, verifiable guidance: students receive ranked job matches with explainable reasons, prioritized improvement steps for resumes and skills, and adaptive learning plans that update after every interaction—saving time and improving outcomes.

---

## Architecture Overview

Frontend (React + Vite):
- UI components: `src/components/*` (forms, dashboard, quiz UI)
- Pages: `src/pages/*` (StudentDashboard, StudentPractice, StudentJobs)
- Services: `src/services/*` (Gemini integration, W&B wrapper, resume analysis, personalized recommendations)

AI & Tracking:
- Google Gemini: generation of quiz questions, concept tagging, resume analysis, recommendation reasoning.
- Weights & Biases: experiment logging, run metrics, and artifacts (via `src/services/wandb.ts`).

Persistent storage:
- Supabase (or equivalent) for storing user quiz attempts, progress, and XP (see SETUP.md / `supabase/` folder).

Important: Gemini API keys and any secrets must be stored server-side and never exposed in client bundles in production.

---

## Gemini Integration (MANDATORY)

What we use Gemini for:
- Quiz question generation and concept tagging
- Weak area detection reasoning
- Resume analysis and match explanation
- Recommendation reasoning for videos / study plan

Where to look in the codebase:
- `src/services/gemini.ts` — core Gemini request/response helper and parsing logic.
- `src/services/quiz.ts` — quiz generation & evaluation (calls Gemini to create MCQs and tags).
- `src/services/resumeAnalysis.ts` — resume analysis and job match scoring (Gemini-based reasoning).

Security constraints (MUST follow):
- The Gemini API key must NOT be hardcoded anywhere in the repo.
- The API key must NOT be embedded in client-side bundles for production.
- Store your Gemini key in an environment variable and call Gemini from a trusted server-side component or secure proxy.

Recommended environment variable names (local dev):
- `GEMINI_API_KEY` (server-side only)
- **Do not** set a `VITE_*` variable for Gemini that will be available in the browser in production.

Example server-side usage (conceptual):
```
const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent?key=' + process.env.GEMINI_API_KEY, ...);
```

If you must run locally without a server proxy for quick demos, use a local environment and never commit the `.env` file. In production, implement a small server endpoint that accepts requests from the frontend and then calls Gemini using the key from `process.env`.

Model constraints (enforced in the repo):
- ✅ Gemini API: ALLOWED (mandatory)
- ❌ LLaMA 3: REMOVED
- ❌ OpenRouter: REMOVED
- ❌ Hardcoded API keys: STRICTLY FORBIDDEN

---

## Weights & Biases (W&B) Integration

Purpose:
- Track key metrics (quiz accuracies, match scores), log model prompts and outputs as artifacts, and enable experiment reproducibility.

Where:
- `src/services/wandb.ts` provides a small wrapper to send metrics and events to W&B (REST-based approach for front-end metrics). For heavy experiment tracking (training runs), use the Python W&B SDK on your training infra and link artifacts into the same project.

Configuration:
- `WANDB_API_KEY` — your W&B API key (provide it to the server or to the environment where logging occurs). Do NOT commit this key.
- W&B project is configured in `src/services/wandb.ts` (defaults to `adapti-learn-chatbot` / `adapti-learn` entity). Adjust as needed.

How to inspect runs:
1. Log into weightsandbiases.com and open the configured project and entity.
2. Look for runs named with session IDs or run IDs emitted from the app logs (the frontend emits run metadata when available).
3. For reproducibility, include run IDs and artifacts in your writeup and demo overlays.

---

## Quickstart (Local Development)

1. Clone the repo
```bash
git clone <your-repo-url>
cd adapti-learn-spark-38-main
```

2. Install dependencies
```bash
npm install
```

3. Environment
- Copy `.env.example` to `.env` and fill in server-side keys.
- IMPORTANT: Put Gemini keys ONLY in a server-side `.env` (e.g., for an Express/Next/Cloud Function). If you use `VITE_GEMINI_API_KEY` it will be bundled into client code — avoid this for production.

Example `.env` (local dev/testing only):
```
# For local dev server / proxy only
GEMINI_API_KEY=sk-<your-key>
WANDB_API_KEY=<your-wandb-key>
```

4. Start dev server
```bash
npm run dev
# OR if you run a server proxy (recommended): node server/index.js
```

5. Visit `http://localhost:5173` and navigate to Student → Practice / Jobs to try the demo.

---

## Reproducibility & Evidence for Judges

- Provide W&B run IDs and the commit hash used for the demo.
- Include a short `how-to-run` in the submission that shows how to start any local server proxy and the frontend.
- Show the Gemini prompts and the exact model outputs used to generate quizzes and recommendations when recording the demo.

---

## Removed / Deprecated Services

Per the project scope and security constraints, the following services or approaches were intentionally removed:
- Keras‑OCR / client-side Tesseract fallback (removed — resume uploads are accepted but OCR is disabled by default)
- Google Vision proxy (removed)
- LLaMA 3 and OpenRouter integrations (removed)
- Any hardcoded API keys (removed)

This keeps the codebase focused, secure, and easier to audit.

---

## Tests & Validation

- The quiz system includes logic in `src/services/quiz.ts` for deterministic question generation and evaluation; write unit tests that call `generateQuiz` and `evaluateAttempt` to ensure correctness.
- For W&B/Gemini integration tests, mock network calls and assert that prompts and outputs are shaped as expected.

---

## Contribution & Notes

- If you add any third‑party model APIs, ensure they are approved in the repo README and that keys are managed strictly through environment variables and secret management in CI/CD.
- Ensure `.env` is added to `.gitignore` and keys never appear in logs or client bundles.

---

## License

This project is MIT licensed — see the `LICENSE` file.

---

If you'd like, I can also:
- Add an example server proxy (small Express/Node example) that safely exposes a `/api/gemini` endpoint that calls Gemini using `process.env.GEMINI_API_KEY` (recommended for production), or
- Draft a short `how-to-run` demo script that includes W&B run creation and a list of artifacts to attach to your submission.

Which of these would you like me to add next?


