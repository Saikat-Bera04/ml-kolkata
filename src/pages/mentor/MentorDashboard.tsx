import { MentorNavbar } from '@/components/MentorNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

export default function MentorDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <MentorNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mentor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your students' performance and insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Class Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Class Overview</CardTitle>
              <CardDescription>Current batch statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Students</span>
                  <span className="text-2xl font-bold text-primary">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Today</span>
                  <span className="text-2xl font-bold text-green-600">38</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Progress</span>
                  <span className="text-2xl font-bold text-accent">72%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* At-Risk Students Card */}
          <Card>
            <CardHeader>
              <CardTitle>At-Risk Students</CardTitle>
              <CardDescription>Needs attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                  <span className="text-sm">John Doe</span>
                  <span className="text-xs text-destructive">45% mastery</span>
                </li>
                <li className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                  <span className="text-sm">Jane Smith</span>
                  <span className="text-xs text-destructive">52% mastery</span>
                </li>
                <li className="flex justify-between items-center p-2 bg-yellow-100 rounded">
                  <span className="text-sm">Mike Johnson</span>
                  <span className="text-xs text-yellow-700">58% mastery</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Top Performers Card */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Excellent progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Sarah Williams</span>
                  <span className="text-xs text-green-700">95% mastery</span>
                </li>
                <li className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">David Brown</span>
                  <span className="text-xs text-green-700">92% mastery</span>
                </li>
                <li className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Emily Davis</span>
                  <span className="text-xs text-green-700">90% mastery</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Concept Mastery Heatmap Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Concept Mastery Heatmap</CardTitle>
              <CardDescription>Class-wide understanding by topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Algebra</span>
                    <span className="text-sm text-muted-foreground">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Calculus</span>
                    <span className="text-sm text-muted-foreground">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Geometry</span>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Statistics</span>
                    <span className="text-sm text-muted-foreground">70%</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts Card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="text-sm p-2 bg-accent/10 rounded">
                  5 students struggling with Quadratics
                </li>
                <li className="text-sm p-2 bg-accent/10 rounded">
                  Low engagement in Physics module
                </li>
                <li className="text-sm p-2 bg-accent/10 rounded">
                  Assignment completion rate: 78%
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Engagement Trends Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>Weekly activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-end justify-between gap-2">
                {[65, 72, 68, 85, 78, 82, 90].map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary rounded-t" 
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  Create Quiz
                </button>
                <button className="p-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                  View Reports
                </button>
                <button className="p-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                  Send Alert
                </button>
                <button className="p-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
                  Upload Content
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
