# Adapti-Learn: Setup & Installation Guide

This guide will help you set up and run the Adapti-Learn platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** or **bun**
- **Git** - [Download Git](https://git-scm.com/)
- **Supabase Account** (free tier works) - [Sign up at Supabase](https://supabase.com/)

### Verify Installation

```bash
node --version    # Should be v18.x.x or higher
npm --version     # Should be 9.x.x or higher
git --version     # Any recent version
```

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd adapti-learn-spark-38-main
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# OR using yarn
yarn install

# OR using bun (if you have bun installed)
bun install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following environment variables to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# YouTube API (Optional - for video recommendations)
VITE_YOUTUBE_API_KEY=your_youtube_api_key

# OpenRouter API (Optional - for AI chatbot)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

**Note:** The YouTube API key and OpenRouter API key are currently hardcoded in the service files. For production, you should move them to environment variables.

### Step 4: Set Up Supabase

#### 4.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Adapti-Learn (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region
4. Click "Create new project" and wait for it to initialize

#### 4.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_PUBLISHABLE_KEY`

#### 4.3 Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Run the migration files in order:

**Migration 1: Create Profiles and Roles** (`20251113224903_5949e669-dc2d-42e2-82e1-1aea3d5df43c.sql`)
```sql
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'mentor', 'admin');

-- Create profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.app_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create user_roles table for detailed role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  );
$$;

-- Policy for mentors to view student profiles
CREATE POLICY "Mentors can view student profiles"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'mentor'::public.app_role) OR
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );
```

**Migration 2: Create Timetable** (`20250101000000_create_timetable.sql`)
```sql
-- Create enum for priority levels
CREATE TYPE public.priority_level AS ENUM ('High', 'Medium', 'Low');

-- Create enum for days of week
CREATE TYPE public.day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Create timetable_sessions table
CREATE TABLE public.timetable_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  day public.day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  priority public.priority_level NOT NULL DEFAULT 'Medium',
  notes TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.timetable_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own timetable sessions"
  ON public.timetable_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timetable sessions"
  ON public.timetable_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetable sessions"
  ON public.timetable_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetable sessions"
  ON public.timetable_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_timetable_sessions_user_day ON public.timetable_sessions(user_id, day);
CREATE INDEX idx_timetable_sessions_user_time ON public.timetable_sessions(user_id, start_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_timetable_sessions_updated_at
  BEFORE UPDATE ON public.timetable_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

**Migration 3: Additional Schema** (`20251113224913_ca3e2a91-52cf-41d7-8b71-9d098a5d4eaa.sql`)
- Check the file in `supabase/migrations/` for the complete SQL

#### 4.4 Configure Supabase Authentication

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates if needed
4. Set up redirect URLs:
   - Add `http://localhost:8080` to allowed redirect URLs
   - Add your production URL when deploying

### Step 5: Set Up Optional API Keys

#### YouTube API Key (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **YouTube Data API v3**
4. Create credentials (API Key)
5. Add the key to your `.env` file as `VITE_YOUTUBE_API_KEY`

#### OpenRouter API Key (Optional - for AI Chatbot)

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add the key to your `.env` file as `VITE_OPENROUTER_API_KEY`

**Note:** Currently, these keys are hardcoded in the service files. You may need to update the service files to use environment variables.

### Step 6: Start the Development Server

```bash
# Start the development server
npm run dev

# The app will be available at:
# http://localhost:8080
```

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📁 Project Structure

```
adapti-learn-spark-38-main/
├── src/
│   ├── components/          # React components
│   ├── contexts/            # React contexts (Auth, etc.)
│   ├── data/                # Static data files
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # External integrations (Supabase)
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components
│   │   ├── student/         # Student pages
│   │   └── mentor/          # Mentor pages
│   └── services/            # Business logic services
├── supabase/
│   └── migrations/          # Database migration files
├── public/                  # Static assets
├── .env                     # Environment variables (create this)
├── package.json
└── vite.config.ts
```

## 🔧 Configuration

### Port Configuration

The default port is `8080`. To change it, edit `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080, // Change this to your preferred port
  },
  // ...
});
```

### Path Aliases

The project uses `@/` as an alias for the `src/` directory. This is configured in:
- `vite.config.ts` (for Vite)
- `tsconfig.json` (for TypeScript)

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/...'"

**Solution:** Make sure your `tsconfig.json` has the path alias configured:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Supabase connection errors

**Solutions:**
1. Verify your `.env` file has the correct Supabase URL and key
2. Check that your Supabase project is active
3. Ensure you've run all database migrations
4. Check browser console for specific error messages

### Issue: Authentication not working

**Solutions:**
1. Verify Supabase Auth is enabled in your project
2. Check that redirect URLs are configured correctly
3. Ensure the `handle_new_user()` trigger is created
4. Check browser console for authentication errors

### Issue: Port 8080 already in use

**Solution:** Change the port in `vite.config.ts`:
```typescript
server: {
  port: 3000, // or any other available port
}
```

### Issue: Dependencies installation fails

**Solutions:**
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install` again
4. Try using a different package manager (yarn, bun)

### Issue: TypeScript errors

**Solutions:**
1. Make sure all dependencies are installed
2. Restart your IDE/editor
3. Run `npm run lint` to see specific errors
4. Check that `tsconfig.json` is properly configured

## 🧪 Testing the Setup

After installation, test the following:

1. **Homepage**: Visit `http://localhost:8080` - should show the landing page
2. **Student Signup**: Go to `/student/signup` and create a test student account
3. **Student Login**: Log in with your test account
4. **Student Dashboard**: Should show the dashboard with recommendations
5. **Mentor Signup**: Go to `/mentor/signup` and create a test mentor account
6. **Mentor Dashboard**: Should show the mentor dashboard

## 📚 Next Steps

1. **Create Test Accounts**: Set up test student and mentor accounts
2. **Explore Features**: Try out quizzes, study notes, timetable, etc.
3. **Configure APIs**: Set up YouTube and OpenRouter APIs for full functionality
4. **Customize**: Modify the UI, add features, or customize the learning algorithm

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Vercel/Netlify

1. Push your code to GitHub
2. Connect your repository to Vercel/Netlify
3. Add environment variables in the deployment platform
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_YOUTUBE_API_KEY` (optional)
- `VITE_OPENROUTER_API_KEY` (optional)

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the error messages in the browser console
3. Check Supabase dashboard for database/auth errors
4. Verify all environment variables are set correctly

## 📝 Notes

- The project uses **localStorage** for caching quiz results and activity data
- Some features may require API keys to function fully
- The AI chatbot uses OpenRouter API (free tier available)
- YouTube API has daily quota limits (free tier: 10,000 units/day)

---

**Happy Learning! 🎓**

