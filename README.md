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
# Create .env file with Supabase credentials

# Start development server
npm run dev
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete installation and setup guide
- **[CONCEPTUAL_DIAGRAM.md](./CONCEPTUAL_DIAGRAM.md)** - System architecture and conceptual diagrams

## Project info

**URL**: https://lovable.dev/projects/a9f58a3c-5f7d-4176-8cdb-d1b13d6ce868

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a9f58a3c-5f7d-4176-8cdb-d1b13d6ce868) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

### Frontend
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI framework
- **React Router** - Client-side routing
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - PostgreSQL database and authentication
- **Supabase Auth** - User authentication and authorization

### AI & External Services
- **OpenRouter API** - LLM provider for AI features (Meta Llama 3.3 70B)
- **YouTube Data API** - Video content for learning
- **Job Search APIs** - Career opportunities

### Key Features
- 🔐 Role-based authentication (Student/Mentor)
- 📊 Adaptive learning with difficulty adjustment
- 🤖 AI-powered personalized recommendations
- 📈 Learning gap detection and analytics
- 📝 Quiz generation and performance tracking
- 📚 Study notes management
- 📅 Timetable and session scheduling
- 💬 AI chatbot for educational assistance
- 🎯 Competitive exam preparation
- 💼 Job search integration

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a9f58a3c-5f7d-4176-8cdb-d1b13d6ce868) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
