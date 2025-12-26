import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && userRole) {
      // Redirect authenticated users to their dashboard
      if (userRole === 'student') {
        navigate('/student/dashboard');
      } else if (userRole === 'mentor') {
        navigate('/mentor/dashboard');
      }
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">SkillHive</h1>
          <Button variant="ghost" onClick={() => navigate('/student/login')}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Adaptive Learning Powered by AI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Personalized education that adapts to your pace, identifies your gaps, 
            and recommends the perfect learning path.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            title="Real-Time Adaptation"
            subtitle="Difficulty adjusts based on your performance"
            description="Our Elo-style algorithm continuously adjusts content difficulty to keep you in the optimal learning zone."
          />
          <FeatureCard
            title="Learning Gap Detection"
            subtitle="Identify weak concepts instantly"
            description="Advanced analytics detect where you're struggling and recommend targeted interventions."
          />
          <FeatureCard
            title="Personalized Paths"
            subtitle="Your unique learning journey"
            description="AI-generated study plans based on your goals, pace, and learning style."
          />
        </div>

        {/* CTA Section */}
        <div className="bg-card rounded-lg shadow-card-lg p-12 text-center">
          <h3 className="text-3xl font-bold text-foreground mb-8">
            Get Started Today
          </h3>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => navigate('/student/signup')}
            >
              Login as Student
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/mentor/signup')}
            >
              Login as Professor
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
