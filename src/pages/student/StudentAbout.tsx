import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Linkedin } from 'lucide-react';

export default function StudentAbout() {
  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* About This Project Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              🌟 About Section
            </CardTitle>
            <CardDescription className="text-lg">Polished & Professional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">About This Project</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our platform is a next-generation AI-powered Adaptive Learning Ecosystem designed to personalize education for every learner.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional learning platforms treat all students the same — but real learning doesn't work that way. Each student has unique strengths, weaknesses, learning speeds, and engagement patterns.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                This system uses machine learning, real-time analytics, and intelligent recommendations to create a fully personalized learning path for every student.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                From difficulty adjustment and skill mastery tracking to mentor dashboards and fatigue detection, our platform transforms education into a dynamic, measurable, and deeply engaging journey.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a student who wants smarter learning or a mentor seeking deeper insights, this platform provides clarity, precision, and adaptive intelligence at every step.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Key Capabilities Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              🎯 Key Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-4 list-none space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">Hyper-personalized learning paths</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">Real-time adaptive difficulty (Elo-based)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">Intelligent recommendations (videos, quizzes, notes, PYQs)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">Mentor dashboards with heatmaps & at-risk alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">Automated study plans & readiness prediction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">Gamification (streaks, badges, XP)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">Offline access & notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-muted-foreground">AI-powered chatbot for academic assistance</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Developed By Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              👨‍💻 Developed By
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Developer 1: Anurag Dey */}
              <Card className="bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">1. Anurag Dey</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="https://github.com/anuragcode-16" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      anuragcode-16
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="https://github.com/anuragcode-16" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      LinkedIn
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Developer 2: Tiyasha Paul */}
              <Card className="bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">2. Tiyasha Paul</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="https://github.com/tiyasha-paul" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      tiyasha-paul
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="https://github.com/tiyasha-paul" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      LinkedIn
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Developer 3: Ojsweenee Saha */}
              <Card className="bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg">3. Ojsweenee Saha</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="https://github.com/ojsweenee" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      ojsweenee
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href="https://github.com/ojsweenee" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      LinkedIn
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

