# Adapti-Learn: Conceptual Architecture Diagram

## High-Level Overview

```mermaid
graph LR
    subgraph "Users"
        S[👤 Students]
        M[👨‍🏫 Mentors]
    end

    subgraph "Adapti-Learn Platform"
        FE[Frontend<br/>React + TypeScript]
        Services[Services Layer<br/>12 Core Services]
        AI[AI Engine<br/>Adaptive Learning]
    end

    subgraph "Data & External"
        DB[(Supabase<br/>Database)]
        Ext[External APIs<br/>YouTube, Jobs, AI]
    end

    S --> FE
    M --> FE
    FE --> Services
    Services --> AI
    Services --> DB
    Services --> Ext
    AI --> Services
```

## System Overview

```mermaid
graph TB
    subgraph "User Layer"
        Student[👤 Student]
        Mentor[👨‍🏫 Mentor]
        Admin[👨‍💼 Admin]
    end

    subgraph "Frontend Application"
        subgraph "React + TypeScript + Vite"
            UI[UI Components<br/>shadcn-ui + Tailwind]
            Pages[Pages & Routes<br/>React Router]
            Context[Context Providers<br/>Auth, Query]
        end
    end

    subgraph "Core Features"
        subgraph "Student Features"
            Dashboard[📊 Student Dashboard]
            Learning[📚 Learning Module]
            Practice[✏️ Practice & Quizzes]
            Notes[📝 Study Notes]
            Timetable[📅 Timetable]
            Podcasts[🎧 Podcasts]
            Jobs[💼 Job Search]
            Exams[🎯 Competitive Exams]
            Profile[👤 Profile & Settings]
        end

        subgraph "Mentor Features"
            MentorDash[📊 Mentor Dashboard]
            Students[👥 Student Management]
            Reports[📈 Detailed Reports]
            Analytics[📉 Analytics & Insights]
        end
    end

    subgraph "Services Layer"
        AuthService[🔐 Authentication Service]
        QuizService[📝 Quiz Service]
        QuizResults[📊 Quiz Results & Analytics]
        Recommendations[🤖 Personalized Recommendations]
        ActivityTracker[📈 Activity Tracker]
        StudyNotes[📚 Study Notes Service]
        TimetableService[📅 Timetable Service]
        Chatbot[💬 AI Chatbot Service]
        JobSearch[🔍 Job Search Service]
        YouTube[🎥 YouTube Integration]
        Gemini[🧠 Gemini AI Integration]
        Notifications[🔔 Notifications Service]
        MentorStudents[👨‍🏫 Mentor-Student Service]
    end

    subgraph "Data Layer"
        Supabase[(🗄️ Supabase<br/>PostgreSQL Database)]
        LocalStorage[(💾 Local Storage<br/>Client-side Cache)]
    end

    subgraph "External Integrations"
        OpenRouter[🌐 OpenRouter API<br/>LLM Provider]
        YouTubeAPI[📺 YouTube API]
        JobAPIs[💼 Job Search APIs]
    end

    subgraph "AI & ML Components"
        AdaptiveAlgo[⚙️ Adaptive Learning Algorithm<br/>Elo-style Difficulty Adjustment]
        GapDetection[🔍 Learning Gap Detection]
        PersonalizedPaths[🛤️ Personalized Learning Paths]
        PerformanceAnalysis[📊 Performance Analysis]
    end

    %% User to Frontend
    Student --> Pages
    Mentor --> Pages
    Admin --> Pages

    %% Frontend to Features
    Pages --> Dashboard
    Pages --> Learning
    Pages --> Practice
    Pages --> Notes
    Pages --> Timetable
    Pages --> Podcasts
    Pages --> Jobs
    Pages --> Exams
    Pages --> Profile
    Pages --> MentorDash
    Pages --> Students
    Pages --> Reports
    Pages --> Analytics

    %% Features to Services
    Dashboard --> Recommendations
    Dashboard --> ActivityTracker
    Dashboard --> QuizResults
    Practice --> QuizService
    Practice --> QuizResults
    Learning --> Recommendations
    Learning --> YouTube
    Notes --> StudyNotes
    Timetable --> TimetableService
    Jobs --> JobSearch
    Chatbot --> Chatbot
    MentorDash --> MentorStudents
    Students --> MentorStudents
    Reports --> QuizResults
    Reports --> ActivityTracker
    Reports --> Recommendations

    %% Services to Data Layer
    AuthService --> Supabase
    QuizService --> Supabase
    QuizResults --> LocalStorage
    QuizResults --> Supabase
    Recommendations --> LocalStorage
    Recommendations --> QuizResults
    ActivityTracker --> LocalStorage
    StudyNotes --> LocalStorage
    StudyNotes --> Supabase
    TimetableService --> Supabase
    Chatbot --> Gemini
    JobSearch --> JobAPIs
    YouTube --> YouTubeAPI
    MentorStudents --> Supabase
    Notifications --> Supabase

    %% Services to External
    Gemini --> OpenRouter
    Chatbot --> OpenRouter
    StudyNotes --> OpenRouter

    %% AI Components
    Recommendations --> AdaptiveAlgo
    Recommendations --> GapDetection
    Recommendations --> PersonalizedPaths
    Recommendations --> PerformanceAnalysis
    QuizResults --> PerformanceAnalysis

    %% Styling
    classDef userClass fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef featureClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef serviceClass fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef dataClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef aiClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class Student,Mentor,Admin userClass
    class Dashboard,Learning,Practice,Notes,Timetable,Podcasts,Jobs,Exams,Profile,MentorDash,Students,Reports,Analytics featureClass
    class AuthService,QuizService,QuizResults,Recommendations,ActivityTracker,StudyNotes,TimetableService,Chatbot,JobSearch,YouTube,Gemini,Notifications,MentorStudents serviceClass
    class Supabase,LocalStorage dataClass
    class AdaptiveAlgo,GapDetection,PersonalizedPaths,PerformanceAnalysis aiClass
```

## Key Components Breakdown

### 1. **User Roles**
- **Student**: Primary learner with access to learning materials, practice, and personalization
- **Mentor**: Educator who monitors student progress and provides guidance
- **Admin**: System administrator (future role)

### 2. **Core Student Features**
- **Dashboard**: Overview of progress, insights, recommendations, and activity heatmap
- **Learning Module**: Access to learning materials and resources
- **Practice & Quizzes**: AI-generated quizzes with adaptive difficulty
- **Study Notes**: Create, manage, and organize study notes
- **Timetable**: Schedule and manage study sessions
- **Podcasts**: Educational podcast content
- **Job Search**: Career opportunities and job listings
- **Competitive Exams**: Preparation materials for competitive exams
- **Profile & Settings**: User profile management

### 3. **Mentor Features**
- **Mentor Dashboard**: Overview of all students' performance
- **Student Management**: View and manage assigned students
- **Detailed Reports**: In-depth analysis of individual student performance
- **Analytics**: Class-wide insights and trends

### 4. **Services Architecture**

#### Authentication & Authorization
- Supabase Auth for user authentication
- Role-based access control (Student/Mentor)
- Protected routes implementation

#### Learning Services
- **Quiz Service**: Generates quizzes based on branch, semester, and subject
- **Quiz Results**: Tracks performance, calculates metrics, identifies weak areas
- **Personalized Recommendations**: AI-powered learning path suggestions
- **Activity Tracker**: Monitors learning activity and streaks

#### Content Services
- **Study Notes**: CRUD operations for study notes with AI generation
- **Timetable**: Session scheduling and management
- **YouTube Integration**: Video recommendations for learning topics
- **Job Search**: Career opportunity search and filtering

#### AI Services
- **Chatbot**: Educational assistant using OpenRouter API
- **Gemini Integration**: AI text generation and analysis
- **Adaptive Algorithm**: Elo-style difficulty adjustment
- **Gap Detection**: Identifies learning weaknesses

### 5. **Data Storage**
- **Supabase (PostgreSQL)**: Primary database for user data, profiles, timetables, quiz results
- **Local Storage**: Client-side caching for quiz results, activity tracking, study notes

### 6. **External Integrations**
- **OpenRouter API**: LLM provider for chatbot and AI features
- **YouTube API**: Video content for learning
- **Job Search APIs**: Career opportunities

## Data Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant UI as Frontend UI
    participant QS as Quiz Service
    participant QR as Quiz Results
    participant PR as Recommendations
    participant DB as Supabase
    participant AI as AI Services

    S->>UI: Start Practice Session
    UI->>QS: Request Quiz
    QS->>DB: Fetch Quiz Data
    DB-->>QS: Return Questions
    QS-->>UI: Display Quiz
    S->>UI: Complete Quiz
    UI->>QR: Submit Results
    QR->>DB: Save Results
    QR->>QR: Calculate Metrics
    QR->>PR: Analyze Performance
    PR->>AI: Generate Recommendations
    AI-->>PR: Return Suggestions
    PR->>QR: Get Weak Areas
    QR-->>PR: Return Data
    PR-->>UI: Display Insights
    UI-->>S: Show Dashboard with Recommendations
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **shadcn-ui** + **Tailwind CSS** for UI components
- **TanStack Query** for data fetching
- **Recharts** for data visualization

### Backend & Database
- **Supabase** (PostgreSQL) for database and authentication
- **Supabase Auth** for user management

### AI & External Services
- **OpenRouter API** (Meta Llama 3.3 70B) for AI features
- **YouTube API** for video content
- **Job Search APIs** for career opportunities

### Key Libraries
- **React Hook Form** + **Zod** for form validation
- **date-fns** for date manipulation
- **Lucide React** for icons

## Adaptive Learning Features

1. **Real-Time Difficulty Adjustment**: Elo-style algorithm adjusts quiz difficulty based on performance
2. **Learning Gap Detection**: Identifies weak concepts and topics
3. **Personalized Recommendations**: AI-generated study plans and content suggestions
4. **Performance Analytics**: Comprehensive metrics and progress tracking
5. **Activity Tracking**: Streaks, heatmaps, and engagement monitoring
6. **Mentor Insights**: Detailed reports for educators to track student progress

## Security & Access Control

- Role-based authentication (Student/Mentor)
- Protected routes with `ProtectedRoute` component
- Supabase Row Level Security (RLS) policies
- Secure API key management via environment variables

