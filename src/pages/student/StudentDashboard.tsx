import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizGenerator } from '@/components/QuizGenerator';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { getActivityStreak, recordActivity, getTotalActivityCount } from '@/services/activityTracker';
import { 
  analyzeLearnerPerformance, 
  getRecommendedVideos,
  type AdaptiveLearningInsights 
} from '@/services/personalizedRecommendations';
import { getWeakAreas, getSubjectPerformance, getQuizResults } from '@/services/quizResults';
import { type YouTubeVideo } from '@/services/youtube';
import { supabase } from '@/integrations/supabase/client';
import { getTodayGoals, addGoal, toggleGoal, deleteGoal, createGoalFromSession, type Goal } from '@/services/goals';
import { getUpcomingSessions, getSessionsByDay, type DayOfWeek } from '@/services/timetable';
import { 
  Target, 
  Clock, 
  Award, 
  AlertCircle,
  BookOpen,
  Zap,
  Video,
  PlayCircle,
  Lightbulb,
  Brain,
  BarChart3,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [streak, setStreak] = useState(0);
  const [insights, setInsights] = useState<AdaptiveLearningInsights | null>(null);
  const [recommendedVideos, setRecommendedVideos] = useState<Map<string, YouTubeVideo[]>>(new Map());
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [userName, setUserName] = useState('Student');
  const [todayGoals, setTodayGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Load user profile to get name
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0] || 'Student');
        } else if (user?.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(' ')[0] || 'Student');
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    // Load today's goals from storage and sync with timetable
    const loadTodayGoals = async () => {
      if (!user) return;
      
      try {
        const storedGoals = getTodayGoals();
        const todayDay: DayOfWeek = (() => {
          const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return dayNames[new Date().getDay()];
        })();
        
        // Get today's timetable sessions
        const todaySessions = await getSessionsByDay(user.id, todayDay);
        
        // Create goals for timetable sessions that don't have goals yet
        const sessionGoalIds = new Set(storedGoals.filter(g => g.timetableSessionId).map(g => g.timetableSessionId));
        const newGoals: Goal[] = [];
        
        for (const session of todaySessions) {
          if (session.id && !sessionGoalIds.has(session.id)) {
            const goal = createGoalFromSession(session);
            newGoals.push(goal);
          }
        }
        
        // Merge stored goals with new goals from sessions
        const allGoals = [...storedGoals, ...newGoals];
        
        // Update goals that are linked to sessions to sync completion status
        const completedSessions = JSON.parse(localStorage.getItem('completed_sessions') || '[]');
        const syncedGoals = allGoals.map(goal => {
          if (goal.timetableSessionId && completedSessions.includes(goal.timetableSessionId)) {
            return { ...goal, completed: true };
          }
          return goal;
        });
        
        setTodayGoals(syncedGoals);
      } catch (error) {
        console.error('Error loading today\'s goals:', error);
        // Fallback to just stored goals
        const goals = getTodayGoals();
        setTodayGoals(goals);
      }
    };

    // Record dashboard view activity (once per day)
    const today = new Date().toISOString().split('T')[0];
    const lastDashboardView = localStorage.getItem(`dashboard_view_${today}`);
    if (!lastDashboardView) {
      recordActivity('practice_viewed'); // Using practice_viewed as general activity
      localStorage.setItem(`dashboard_view_${today}`, 'true');
    }
    
    // Update streak from activity tracker
    const currentStreak = getActivityStreak();
    setStreak(currentStreak);
    
    // Load user profile and goals
    loadUserProfile();
    loadTodayGoals();
    
    // Load personalized insights
    loadPersonalizedInsights();
    
    // Listen for timetable updates to sync goals
    const handleTimetableUpdate = () => {
      loadTodayGoals();
    };
    
    // Listen for goals updates
    const handleGoalsUpdate = () => {
      loadTodayGoals();
    };
    
    // Listen for activity updates
    const handleActivityUpdate = () => {
      setStreak(getActivityStreak());
      setRefreshTrigger(prev => prev + 1); // Trigger recalculation of XP
    };
    
    // Listen for quiz completion to refresh recommendations
    const handleQuizComplete = () => {
      loadPersonalizedInsights();
      setRefreshTrigger(prev => prev + 1); // Trigger recalculation of XP
    };
    
    window.addEventListener('timetable-updated', handleTimetableUpdate);
    window.addEventListener('goals-updated', handleGoalsUpdate);
    window.addEventListener('activity-updated', handleActivityUpdate);
    window.addEventListener('quiz-completed', handleQuizComplete);
    
    return () => {
      window.removeEventListener('timetable-updated', handleTimetableUpdate);
      window.removeEventListener('goals-updated', handleGoalsUpdate);
      window.removeEventListener('activity-updated', handleActivityUpdate);
      window.removeEventListener('quiz-completed', handleQuizComplete);
    };
  }, [user]);

  const loadPersonalizedInsights = async () => {
    const adaptiveInsights = analyzeLearnerPerformance();
    setInsights(adaptiveInsights);

    // Load recommended videos for weak areas
    const weakAreas = getWeakAreas();
    if (weakAreas.length > 0) {
      setLoadingVideos(true);
      try {
        const videoMap = await getRecommendedVideos(weakAreas, 6);
        setRecommendedVideos(videoMap);
      } catch (error) {
        console.error('Error loading recommended videos:', error);
      } finally {
        setLoadingVideos(false);
      }
    }
  };

  // Calculate XP dynamically
  const xpData = useMemo(() => {
    const quizResults = getQuizResults();
    const activities = getTotalActivityCount();
    const xp = quizResults.length * 50 + activities * 10; // 50 XP per quiz, 10 XP per activity
    const currentLevel = Math.floor(xp / 350); // Level up every 350 XP
    const xpInLevel = xp % 350;
    const xpNeeded = 350 - xpInLevel;
    return { xp, currentLevel, xpInLevel, xpNeeded };
  }, [refreshTrigger]); // Recalculate when activities/quizzes update

  // Get subject performance for learning progress
  const subjectPerformance = useMemo(() => {
    return getSubjectPerformance();
  }, [refreshTrigger]); // Recalculate when quizzes update

  // Handle adding a new goal
  const handleAddGoal = async () => {
    const trimmedText = newGoalText.trim();
    if (!trimmedText) return;
    
    try {
      const newGoal = await addGoal(trimmedText, user?.id);
      setTodayGoals(prev => [...prev, newGoal]);
      setNewGoalText('');
      setIsAddingGoal(false);
      // Dispatch event to refresh timetable
      window.dispatchEvent(new CustomEvent('timetable-updated'));
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  // Handle toggling goal completion
  const handleToggleGoal = async (goalId: string) => {
    try {
      await toggleGoal(goalId);
      setTodayGoals(prev => 
        prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, completed: !goal.completed, completedAt: !goal.completed ? new Date().toISOString() : undefined }
            : goal
        )
      );
      // Dispatch event to refresh timetable
      window.dispatchEvent(new CustomEvent('timetable-updated'));
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  };

  // Handle deleting a goal
  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId, undefined, true); // Also delete timetable session
      setTodayGoals(prev => prev.filter(goal => goal.id !== goalId));
      // Dispatch event to refresh timetable
      window.dispatchEvent(new CustomEvent('timetable-updated'));
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Here's your personalized learning dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Learning Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your overall mastery by subject</CardDescription>
            </CardHeader>
            <CardContent>
              {subjectPerformance.length > 0 ? (
                <div className="space-y-4">
                  {subjectPerformance.slice(0, 5).map((subject) => (
                    <div key={subject.subject}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{subject.subject}</span>
                        <span className="text-sm text-muted-foreground">{Math.round(subject.accuracy)}%</span>
                      </div>
                      <Progress value={subject.accuracy} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Complete quizzes to see your learning progress
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Goals Card */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Goals</CardTitle>
              <CardDescription>
                {todayGoals.filter(g => g.completed).length} of {todayGoals.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayGoals.length > 0 ? (
                <ul className="space-y-2">
                  {todayGoals.map((goal) => (
                    <li key={goal.id} className="flex items-start gap-2 group">
                      <button
                        onClick={() => handleToggleGoal(goal.id)}
                        className="flex-shrink-0 hover:opacity-80 transition-opacity mt-0.5"
                        aria-label={goal.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm block ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.text}
                        </span>
                        {goal.startTime && goal.endTime && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {goal.startTime === '00:00' && goal.endTime === '23:59' 
                              ? 'All day' 
                              : `${goal.startTime} - ${goal.endTime}`}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive mt-0.5"
                        aria-label="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No goals set for today. Add one below to get started!
                </div>
              )}
              
              {isAddingGoal ? (
                <form 
                  className="flex gap-2 pt-2 border-t"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddGoal();
                  }}
                >
                  <Input
                    type="text"
                    placeholder="Enter a new goal..."
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGoal();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setIsAddingGoal(false);
                        setNewGoalText('');
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!newGoalText.trim()}>
                    Add
                  </Button>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsAddingGoal(false);
                      setNewGoalText('');
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsAddingGoal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Goal
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Adaptive Learning Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Adaptive Insights
              </CardTitle>
              <CardDescription>AI-powered personalized recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {insights ? (
                <div className="space-y-3">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Recommended Difficulty
                    </p>
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                      {insights.recommendedDifficulty} level
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Learning Pace
                    </p>
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                      {insights.learningPace} pace
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Daily Study Goal
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insights.studyPlan.dailyGoal} minutes
                    </p>
                  </div>
                  {insights.focusAreas.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <p className="text-sm font-medium flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        Focus Areas
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                        {insights.focusAreas.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Take a quiz to get personalized insights
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Streak</CardTitle>
              <CardDescription>Keep it up!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">{streak}</div>
                <p className="text-sm text-muted-foreground">Days in a row</p>
              </div>
            </CardContent>
          </Card>

          {/* XP Card */}
          <Card>
            <CardHeader>
              <CardTitle>Experience Points</CardTitle>
              <CardDescription>Level up!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Level {xpData.currentLevel + 1}</span>
                  <span className="text-sm text-muted-foreground">
                    {xpData.xp.toLocaleString()} / {(xpData.currentLevel + 1) * 350} XP
                  </span>
                </div>
                <Progress value={(xpData.xpInLevel / 350) * 100} />
                <p className="text-xs text-muted-foreground">
                  {xpData.xpNeeded} XP to next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>What would you like to do?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Take Quiz
                </button>
                <button 
                  onClick={() => navigate('/student/learning')}
                  className="p-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                >
                  Watch Video
                </button>
                <button 
                  onClick={() => navigate('/student/study-notes')}
                  className="p-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                >
                  Study Notes
                </button>
                <button 
                  onClick={() => navigate('/student/practice')}
                  className="p-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
                >
                  Practice
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personalized Recommendations Section */}
        {insights && insights.recommendations.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  Hyper-personalized content based on your quiz performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {insights.recommendations.slice(0, 4).map((rec, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        rec.priority === 'high'
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                          : 'border-border bg-accent/5'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {rec.type === 'video' && <Video className="h-4 w-4 text-primary" />}
                          {rec.type === 'practice' && <Target className="h-4 w-4 text-primary" />}
                          {rec.type === 'review' && <BookOpen className="h-4 w-4 text-primary" />}
                          {rec.type === 'study_plan' && <BarChart3 className="h-4 w-4 text-primary" />}
                          <h4 className="font-semibold text-sm">{rec.title}</h4>
                        </div>
                        <Badge
                          variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {rec.subject && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {rec.subject}
                            </span>
                          )}
                          {rec.estimatedTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {rec.estimatedTime}
                            </span>
                          )}
                        </div>
                        {rec.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(rec.actionUrl!)}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* YouTube Video Recommendations Section */}
        {recommendedVideos.size > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Recommended YouTube Videos
                </CardTitle>
                <CardDescription>
                  Personalized video suggestions based on your weak areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingVideos ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading recommended videos...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Array.from(recommendedVideos.entries()).map(([key, videos]) => {
                      const [subject, topic] = key.split('::');
                      return (
                        <div key={key} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <h4 className="font-semibold">
                              {topic} ({subject})
                            </h4>
                            <Badge variant="destructive" className="text-xs">
                              Weak Area
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            {videos.map((video) => (
                              <div
                                key={video.id.videoId}
                                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                              >
                                <div className="relative aspect-video bg-muted">
                                  <img
                                    src={video.snippet.thumbnails.medium.url}
                                    alt={video.snippet.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                                    <a
                                      href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-white hover:scale-110 transition-transform"
                                    >
                                      <PlayCircle className="h-12 w-12" />
                                    </a>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <h5 className="font-medium text-sm line-clamp-2 mb-1">
                                    {video.snippet.title}
                                  </h5>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {video.snippet.channelTitle}
                                  </p>
                                  <a
                                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-2 inline-block"
                                  >
                                    Watch on YouTube →
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Study Plan Card */}
        {insights && insights.studyPlan.focusSubjects.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Personalized Study Plan
                </CardTitle>
                <CardDescription>
                  Customized based on your performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Daily Goal</span>
                    </div>
                    <p className="text-2xl font-bold">{insights.studyPlan.dailyGoal}</p>
                    <p className="text-xs text-muted-foreground">minutes per day</p>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Weekly Goal</span>
                    </div>
                    <p className="text-2xl font-bold">{insights.studyPlan.weeklyGoal}</p>
                    <p className="text-xs text-muted-foreground">quizzes per week</p>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Focus Subjects</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {insights.studyPlan.focusSubjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {insights.strengths.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                      <Award className="h-4 w-4" />
                      Your Strengths
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {insights.strengths.map((strength) => (
                        <Badge key={strength} variant="outline" className="text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-400">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Heatmap - Full Width */}
        <div className="mt-6">
          <ActivityHeatmap />
        </div>
      </main>

      {showQuiz && <QuizGenerator onClose={() => setShowQuiz(false)} />}
    </div>
  );
}
