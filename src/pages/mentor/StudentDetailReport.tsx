import { useParams, useNavigate } from 'react-router-dom';
import { MentorNavbar } from '@/components/MentorNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, BookOpen, Video, FileText, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getStudentReport, type StudentReport } from '@/services/mentorStudents';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { generateOpenRouterText } from '@/services/gemini';
import { useState, useEffect } from 'react';

const COLORS = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
};

export default function StudentDetailReport() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['student-report', studentId],
    queryFn: () => getStudentReport(studentId || ''),
    enabled: !!studentId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Generate AI feedback
  useEffect(() => {
    if (report && !aiFeedback && !loadingAI) {
      setLoadingAI(true);
      generateAIFeedback(report)
        .then((feedback) => {
          setAiFeedback(feedback);
          setLoadingAI(false);
        })
        .catch(() => {
          setLoadingAI(false);
        });
    }
  }, [report, aiFeedback, loadingAI]);

  const generateAIFeedback = async (report: StudentReport): Promise<string> => {
    try {
      const prompt = `You are an educational mentor AI assistant. Analyze the following student performance data and provide constructive, actionable feedback in 2-3 paragraphs.

Student: ${report.student.name}
Branch: ${report.student.branch}, Semester: ${report.student.semester}
Overall Progress: ${report.overallProgress}%
Accuracy: ${report.student.accuracy.toFixed(1)}%
Performance Status: ${report.student.performanceStatus}
Total Quizzes: ${report.student.totalQuizzes}
Weak Areas: ${report.weakTopics.map(t => t.topic).join(', ') || 'None identified'}
Strong Areas: ${report.strongTopics.map(t => t.topic).join(', ') || 'None identified'}

Provide:
1. A brief assessment of current performance
2. Specific areas that need improvement
3. Actionable recommendations for the student

Keep it professional, encouraging, and specific.`;

      const feedback = await generateOpenRouterText(prompt);
      return feedback;
    } catch (error) {
      console.error('Error generating AI feedback:', error);
      return 'AI feedback generation is currently unavailable. Please check back later.';
    }
  };

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'CSE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ECE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Civil':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Mechanical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Needs Attention':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MentorNavbar />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <MentorNavbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-lg font-medium mb-2">Student not found</p>
              <Button onClick={() => navigate('/mentor/students')}>Back to Students</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { student } = report;

  // Prepare chart data
  const quizPerformanceData = report.quizPerformance.labels.map((label, idx) => ({
    date: label,
    accuracy: report.quizPerformance.accuracy[idx] || 0,
    score: report.quizPerformance.scores[idx] || 0,
  }));

  const difficultyData = [
    { name: 'Easy', value: report.difficultyDistribution.easy, color: COLORS.easy },
    { name: 'Medium', value: report.difficultyDistribution.medium, color: COLORS.medium },
    { name: 'Hard', value: report.difficultyDistribution.hard, color: COLORS.hard },
  ];

  return (
    <div className="min-h-screen bg-background">
      <MentorNavbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/mentor/students')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>

          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.profilePicture} />
              <AvatarFallback className="text-2xl">
                {student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{student.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className={getBranchColor(student.branch)}>{student.branch}</Badge>
                <Badge variant="outline">Semester {student.semester}</Badge>
                <Badge className={getPerformanceColor(student.performanceStatus)}>
                  {student.performanceStatus}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Roll: {student.rollNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Last active: {student.lastActiveTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{report.overallProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <Progress value={report.overallProgress} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quiz Accuracy</p>
                  <p className="text-2xl font-bold">{student.accuracy.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Quizzes</p>
                  <p className="text-2xl font-bold">{student.totalQuizzes}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Timetable Adherence</p>
                  <p className="text-2xl font-bold">{report.timetableAdherence}%</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Performance Graph */}
        {quizPerformanceData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quiz Performance Over Time</CardTitle>
              <CardDescription>Accuracy and scores across recent quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={quizPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="accuracy"
                    stroke={COLORS.primary}
                    name="Accuracy %"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="score"
                    stroke={COLORS.secondary}
                    name="Score"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Difficulty Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Distribution</CardTitle>
              <CardDescription>Breakdown of quiz questions by difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Completion Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Completion Metrics</CardTitle>
              <CardDescription>Video and notes completion rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Video Completion</span>
                  </div>
                  <span className="text-sm font-bold">{report.videoCompletion}%</span>
                </div>
                <Progress value={report.videoCompletion} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Notes Completion</span>
                  </div>
                  <span className="text-sm font-bold">{report.notesCompletion}%</span>
                </div>
                <Progress value={report.notesCompletion} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Timetable Adherence</span>
                  </div>
                  <span className="text-sm font-bold">{report.timetableAdherence}%</span>
                </div>
                <Progress value={report.timetableAdherence} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weak and Strong Topics */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Weak Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Weak Topics
              </CardTitle>
              <CardDescription>Areas requiring improvement (accuracy &lt; 60%)</CardDescription>
            </CardHeader>
            <CardContent>
              {report.weakTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No weak topics identified. Great job!
                </p>
              ) : (
                <div className="space-y-3">
                  {report.weakTopics.map((topic, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{topic.topic}</p>
                          <p className="text-sm text-muted-foreground">{topic.subject}</p>
                        </div>
                        <Badge variant="destructive">{topic.accuracy}%</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{topic.attempts} attempts</span>
                      </div>
                      <Progress value={topic.accuracy} className="mt-2 h-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strong Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Strong Topics
              </CardTitle>
              <CardDescription>Areas of excellence (accuracy ≥ 80%)</CardDescription>
            </CardHeader>
            <CardContent>
              {report.strongTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No strong topics identified yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {report.strongTopics.map((topic, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{topic.topic}</p>
                          <p className="text-sm text-muted-foreground">{topic.subject}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {topic.accuracy}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{topic.attempts} attempts</span>
                      </div>
                      <Progress value={topic.accuracy} className="mt-2 h-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest student activities and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {report.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activities found.
              </p>
            ) : (
              <div className="space-y-3">
                {report.recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="mt-1">
                      {activity.type === 'quiz' && <BookOpen className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'video' && <Video className="h-5 w-5 text-purple-600" />}
                      {activity.type === 'notes' && <FileText className="h-5 w-5 text-green-600" />}
                      {activity.type === 'timetable' && <Calendar className="h-5 w-5 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      {activity.details && (
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Feedback */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI-Generated Feedback</CardTitle>
            <CardDescription>Personalized insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAI ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : aiFeedback ? (
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm">{aiFeedback}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Generating AI feedback...
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

