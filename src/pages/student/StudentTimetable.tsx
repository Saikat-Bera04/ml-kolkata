import { useState, useEffect, useCallback } from 'react';
import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getTimetableSessions, 
  createTimetableSession, 
  updateTimetableSession, 
  deleteTimetableSession,
  getUpcomingSessions,
  getSessionStatus,
  markSessionCompleted,
  type TimetableSession,
  type DayOfWeek,
  type SessionStatus,
} from '@/services/timetable';
import { recordActivity } from '@/services/activityTracker';
import { 
  notifyTimetableEvent, 
  notifyReminder,
  notifyDailySummary,
  createNotification,
} from '@/services/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { SessionForm } from '@/components/SessionForm';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Info,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function StudentTimetable() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TimetableSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<TimetableSession | null>(null);
  const [viewingSession, setViewingSession] = useState<TimetableSession | null>(null);
  const [view, setView] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [sessionStatuses, setSessionStatuses] = useState<Map<string, SessionStatus>>(new Map());

  const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  useEffect(() => {
    if (user) {
      loadSessions();
      checkDailySummary();
    }
  }, [user]);

  // Real-time status updates every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updateSessionStatuses();
      checkReminders();
    }, 60000); // Check every minute

    updateSessionStatuses();
    checkReminders();

    return () => clearInterval(interval);
  }, [sessions, user]);

  // Set up notification listener for real-time updates
  useEffect(() => {
    const handleNotificationUpdate = () => {
      window.dispatchEvent(new CustomEvent('refresh-notifications'));
    };

    const handleTimetableUpdate = () => {
      if (user) {
        loadSessions();
      }
    };

    window.addEventListener('notification-created', handleNotificationUpdate);
    window.addEventListener('notification-updated', handleNotificationUpdate);
    window.addEventListener('timetable-updated', handleTimetableUpdate);

    return () => {
      window.removeEventListener('notification-created', handleNotificationUpdate);
      window.removeEventListener('notification-updated', handleNotificationUpdate);
      window.removeEventListener('timetable-updated', handleTimetableUpdate);
    };
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const allSessions = await getTimetableSessions(user.id);
      setSessions(allSessions);
      
      const upcoming = await getUpcomingSessions(user.id);
      setUpcomingSessions(upcoming.slice(0, 5)); // Top 5 only
      
      updateSessionStatuses();
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatuses = useCallback(() => {
    const statusMap = new Map<string, SessionStatus>();
    sessions.forEach(session => {
      const status = getSessionStatus(session);
      statusMap.set(session.id || '', status);
    });
    setSessionStatuses(statusMap);
  }, [sessions]);

  const checkReminders = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDay = dayNames[now.getDay()];

    sessions.forEach(async (session) => {
      if (session.day !== todayDay) return;
      if (session.status === 'completed' || session.completed_at) return;

      const sessionTime = session.start_time.split(':').map(Number);
      const sessionStart = new Date(now);
      sessionStart.setHours(sessionTime[0], sessionTime[1], 0, 0);

      const minutesUntil = Math.floor((sessionStart.getTime() - now.getTime()) / 60000);

      // 10 minutes before reminder
      if (minutesUntil === 10) {
        await notifyReminder(user.id, session, 10);
        toast.info(`Reminder: ${session.subject} starts in 10 minutes!`, {
          description: `Time: ${formatTime(session.start_time)}`,
        });
      }

      // 2 minutes before reminder
      if (minutesUntil === 2) {
        await notifyReminder(user.id, session, 2);
        toast.warning(`Reminder: ${session.subject} starts in 2 minutes!`, {
          description: `Time: ${formatTime(session.start_time)}`,
        });
      }

      // Check if session is active
      const sessionEnd = new Date(now);
      const endTime = session.end_time.split(':').map(Number);
      sessionEnd.setHours(endTime[0], endTime[1], 0, 0);

      if (now >= sessionStart && now <= sessionEnd) {
        const status = sessionStatuses.get(session.id || '');
        if (status !== 'active') {
          toast.success(`Session Active: ${session.subject}`, {
            description: `Your ${session.subject} session is now active!`,
          });
        }
      }

      // Check if session is missed
      if (now > sessionEnd && minutesUntil < -5) {
        const status = sessionStatuses.get(session.id || '');
        if (status !== 'missed' && status !== 'completed') {
          await createNotification(user.id, {
            type: 'alert',
            title: 'Missed Session',
            message: `You missed your ${session.subject} session at ${formatTime(session.start_time)}. Want to reschedule?`,
            metadata: { sessionId: session.id, event: 'missed' },
          });
          toast.error(`Missed Session: ${session.subject}`, {
            description: `You missed your session at ${formatTime(session.start_time)}`,
          });
        }
      }
    });
  }, [sessions, user, sessionStatuses]);

  const checkDailySummary = async () => {
    if (!user) return;
    
    const today = new Date();
    const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDay = dayNames[today.getDay()];
    
    const todaySessions = sessions.filter(s => s.day === todayDay);
    
    const lastSummary = localStorage.getItem(`daily_summary_${user.id}_${today.toDateString()}`);
    if (!lastSummary && todaySessions.length > 0) {
      await notifyDailySummary(user.id, todaySessions);
      localStorage.setItem(`daily_summary_${user.id}_${today.toDateString()}`, 'true');
    }
  };

  const handleCreateSession = async (sessionData: Omit<TimetableSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const session = await createTimetableSession(user.id, sessionData);
      if (session && session.id) {
        console.log('Session created successfully:', session);
        
        // Create goal from this session if it's for today
        const now = new Date();
        const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDay = dayNames[now.getDay()];
        
        if (session.day === todayDay) {
          try {
            const { createGoalFromSession } = await import('@/services/goals');
            createGoalFromSession(session);
            // Dispatch event to update goals in dashboard
            window.dispatchEvent(new CustomEvent('goals-updated'));
          } catch (error) {
            console.error('Error creating goal from session:', error);
          }
        }
        
        // Immediately update state for instant UI feedback - this ensures the session appears right away
        setSessions(prev => {
          // Check if session already exists (avoid duplicates)
          if (prev.some(s => s.id === session.id)) {
            return prev;
          }
          const updated = [...prev, session];
          
          // Also update upcoming sessions immediately
          const tomorrowDay = dayNames[(now.getDay() + 1) % 7];
          
          const upcoming = updated
            .filter(s => {
              // Include today's future sessions and tomorrow's sessions
              if (s.day === todayDay) {
                const [hours, minutes] = s.start_time.split(':').map(Number);
                const sessionTime = new Date(now);
                sessionTime.setHours(hours, minutes, 0, 0);
                return sessionTime > now;
              }
              return s.day === tomorrowDay;
            })
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .slice(0, 5);
          setUpcomingSessions(upcoming);
          
          return updated;
        });
      
        // Toast notification
        toast.success('Session Added', {
          description: `New study session: ${session.subject} at ${formatTime(session.start_time)}`,
        });
        
        // Notification center
        await notifyTimetableEvent(user.id, 'created', session);
        
        // Trigger real-time update event
        window.dispatchEvent(new CustomEvent('timetable-updated'));
        
        setFormOpen(false);
        
        // Reload from database after a delay to ensure consistency (but don't block UI)
        setTimeout(async () => {
          const refreshed = await getTimetableSessions(user.id);
          setSessions(refreshed);
          const upcoming = await getUpcomingSessions(user.id);
          setUpcomingSessions(upcoming.slice(0, 5));
        }, 1000);
      } else {
        console.error('Session creation returned null or no ID');
        toast.error('Failed to create session', {
          description: 'Session was not created. Please check the console for details.',
        });
      }
    } catch (error: any) {
      console.error('Error creating session:', error);
      const errorMessage = error?.message || 'An unknown error occurred';
      toast.error('Failed to create session', {
        description: errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage,
      });
    }
  };

  const handleUpdateSession = async (sessionData: Omit<TimetableSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingSession?.id || !user) return;

    const updated = await updateTimetableSession(editingSession.id, sessionData);
    if (updated) {
      // Immediately update state for instant UI feedback
      setSessions(prev => {
        const updatedSessions = prev.map(s => s.id === editingSession.id ? updated : s);
        // Update upcoming sessions
        const upcoming = updatedSessions
          .filter(s => {
            const now = new Date();
            const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayDay = dayNames[now.getDay()];
            return s.day === todayDay || true;
          })
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .slice(0, 5);
        setUpcomingSessions(upcoming);
        return updatedSessions;
      });
      
      // Update session statuses
      updateSessionStatuses();
      
      // Toast notification
      toast.success('Session Updated', {
        description: `Your ${updated.subject} session has been updated`,
      });
      
      // Notification center
      await notifyTimetableEvent(user.id, 'updated', updated);
      
      // Trigger real-time update event
      window.dispatchEvent(new CustomEvent('timetable-updated'));
      
      // Reload from database after a short delay to ensure consistency
      setTimeout(async () => {
        await loadSessions();
      }, 500);
      
      setEditingSession(null);
      setFormOpen(false);
    } else {
      toast.error('Failed to update session', {
        description: 'Please try again',
      });
    }
  };

  const handleDeleteSession = async () => {
    if (!deletingSession?.id || !user) return;

    const sessionSubject = deletingSession.subject;
    const success = await deleteTimetableSession(deletingSession.id);
    if (success) {
      // Delete linked goal if it exists
      if (deletingSession.id) {
        try {
          const { getGoalBySessionId, deleteGoal } = await import('@/services/goals');
          const goal = getGoalBySessionId(deletingSession.id);
          if (goal) {
            await deleteGoal(goal.id, undefined, false); // Don't try to delete session again
            window.dispatchEvent(new CustomEvent('goals-updated'));
          }
        } catch (error) {
          console.error('Error deleting goal linked to session:', error);
        }
      }
      // Immediately update state for instant UI feedback
      setSessions(prev => {
        const updated = prev.filter(s => s.id !== deletingSession.id);
        // Update upcoming sessions
        const upcoming = updated
          .filter(s => {
            const now = new Date();
            const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const todayDay = dayNames[now.getDay()];
            return s.day === todayDay || true;
          })
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
          .slice(0, 5);
        setUpcomingSessions(upcoming);
        return updated;
      });
      
      // Update session statuses
      updateSessionStatuses();
      
      // Toast notification
      toast.success('Session Deleted', {
        description: `Study session "${sessionSubject}" has been removed`,
      });
      
      // Notification center
      await notifyTimetableEvent(user.id, 'deleted', deletingSession);
      
      // Trigger real-time update event
      window.dispatchEvent(new CustomEvent('timetable-updated'));
      
      // Reload from database after a short delay to ensure consistency
      setTimeout(async () => {
        await loadSessions();
      }, 500);
      
      setDeletingSession(null);
    } else {
      toast.error('Failed to delete session', {
        description: 'Please try again',
      });
    }
  };

  const handleCompleteSession = async (session: TimetableSession) => {
    if (!session.id) return;
    
    const success = await markSessionCompleted(session.id);
    
    // Record activity
    recordActivity('timetable_session_completed', { 
      subject: session.subject, 
      topic: session.topic,
      sessionId: session.id 
    });
    window.dispatchEvent(new CustomEvent('activity-updated'));
    if (success) {
      // Update linked goal completion status
      try {
        const { getGoalBySessionId, toggleGoal } = await import('@/services/goals');
        const goal = getGoalBySessionId(session.id);
        if (goal && !goal.completed) {
          await toggleGoal(goal.id);
          window.dispatchEvent(new CustomEvent('goals-updated'));
        }
      } catch (error) {
        console.error('Error updating goal completion:', error);
      }
      
      await loadSessions();
      
      toast.success('Session Completed!', {
        description: `Great job completing your ${session.subject} session!`,
      });
      
      if (user) {
        await createNotification(user.id, {
          type: 'timetable',
          title: 'Session Completed',
          message: `Completed: Your ${session.subject} session is done!`,
          metadata: { sessionId: session.id, event: 'completed' },
        });
      }
      
      window.dispatchEvent(new CustomEvent('timetable-updated'));
    }
  };

  const getSessionsForDay = (day: DayOfWeek): TimetableSession[] => {
    return sessions.filter(s => s.day === day).sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTimeSlotPosition = (startTime: string, endTime: string): { top: number; height: number } => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const dayStart = 6 * 60; // 6 AM
    const dayEnd = 23 * 60; // 11 PM
    const dayDuration = dayEnd - dayStart;
    
    const top = ((startMinutes - dayStart) / dayDuration) * 100;
    const height = ((endMinutes - startMinutes) / dayDuration) * 100;
    
    return { top: Math.max(0, top), height: Math.max(2, height) };
  };

  const getStatusIcon = (status: SessionStatus) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'missed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active Now</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>;
      default:
        return <Badge variant="secondary">Upcoming</Badge>;
    }
  };

  const SessionBlock = ({ session, day }: { session: TimetableSession; day: DayOfWeek }) => {
    const status = sessionStatuses.get(session.id || '') || getSessionStatus(session);
    const position = getTimeSlotPosition(session.start_time, session.end_time);
    const isActive = status === 'active';
    const isCompleted = status === 'completed';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`absolute left-0 right-0 rounded-md p-2 text-xs cursor-pointer transition-all hover:shadow-lg ${
                isActive ? 'ring-2 ring-green-500 ring-offset-2 z-10' : ''
              } ${isCompleted ? 'opacity-60' : ''}`}
              style={{
                top: `${position.top}%`,
                height: `${position.height}%`,
                backgroundColor: session.color || '#3B82F6',
                color: 'white',
              }}
              onClick={() => setViewingSession(session)}
            >
              <div className="font-semibold truncate">{session.subject}</div>
              {session.topic && (
                <div className="text-xs opacity-90 truncate">{session.topic}</div>
              )}
              <div className="text-xs opacity-75 mt-1">
                {formatTime(session.start_time)} - {formatTime(session.end_time)}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{session.subject}</p>
              {session.topic && <p className="text-sm">{session.topic}</p>}
              <p className="text-sm">{formatTime(session.start_time)} - {formatTime(session.end_time)}</p>
              <p className="text-sm">Priority: {session.priority}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const SessionCard = ({ session, compact = false }: { session: TimetableSession; compact?: boolean }) => {
    const status = sessionStatuses.get(session.id || '') || getSessionStatus(session);

    return (
      <Card 
        className={`mb-2 border-l-4 transition-all hover:shadow-lg ${
          status === 'active' ? 'ring-2 ring-green-500' : ''
        } ${status === 'completed' ? 'opacity-75' : ''}`}
        style={{ borderLeftColor: session.color || '#3B82F6' }}
      >
        <CardContent className={`p-3 ${compact ? 'p-2' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{session.subject}</h4>
                {getStatusIcon(status)}
              </div>
              {session.topic && (
                <p className="text-xs text-muted-foreground mt-1">{session.topic}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTime(session.start_time)} - {formatTime(session.end_time)}
                </div>
                <Badge 
                  variant={session.priority === 'High' ? 'destructive' : session.priority === 'Medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {session.priority}
                </Badge>
                {getStatusBadge(status)}
              </div>
            </div>
            {!compact && (
              <div className="flex gap-1">
                {status === 'active' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCompleteSession(session)}
                  >
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setEditingSession(session);
                    setFormOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => setDeletingSession(session)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Timetable
            </h1>
            <p className="text-muted-foreground">
              Manage your study schedule with real-time updates and smart reminders
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingSession(null);
              setFormOpen(true);
            }}
            className="shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Session
          </Button>
        </div>

        {/* Upcoming Sessions Sidebar */}
        {upcomingSessions.length > 0 && (
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Upcoming Sessions (Next 5)
              </CardTitle>
              <CardDescription>
                Your next study sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                {upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} compact />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={view} onValueChange={(v) => setView(v as 'weekly' | 'daily')} className="space-y-4">
          <TabsList>
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
          </TabsList>

          {/* Weekly View with Time Grid */}
          <TabsContent value="weekly" className="space-y-4">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-2 min-w-[1200px]">
                {/* Time column */}
                <div className="sticky left-0 bg-background z-10">
                  <div className="h-12"></div>
                  {timeSlots.map((hour) => (
                    <div key={hour} className="h-16 border-b text-xs text-muted-foreground p-1">
                      {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {daysOfWeek.map((day) => {
                  const daySessions = getSessionsForDay(day);
                  return (
                    <div key={day} className="relative min-h-[1152px] border rounded-lg bg-muted/20">
                      <div className="sticky top-0 bg-background z-10 p-2 border-b">
                        <div className="font-semibold text-sm">{day.substring(0, 3)}</div>
                        <div className="text-xs text-muted-foreground">
                          {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="relative h-full">
                        {daySessions.map((session) => (
                          <SessionBlock key={session.id} session={session} day={day} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Daily View */}
          <TabsContent value="daily" className="space-y-4">
            <div className="flex gap-2 mb-4">
              {daysOfWeek.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? 'default' : 'outline'}
                  onClick={() => setSelectedDay(day)}
                  className="flex-1"
                >
                  {day.substring(0, 3)}
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{selectedDay}</CardTitle>
                <CardDescription>
                  {getSessionsForDay(selectedDay).length} session{getSessionsForDay(selectedDay).length !== 1 ? 's' : ''} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getSessionsForDay(selectedDay).length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No sessions scheduled for {selectedDay}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getSessionsForDay(selectedDay).map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session Form */}
        <SessionForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditingSession(null);
          }}
          onSubmit={editingSession ? handleUpdateSession : handleCreateSession}
          initialData={editingSession}
        />

        {/* Session Details Dialog */}
        <Dialog open={!!viewingSession} onOpenChange={() => setViewingSession(null)}>
          <DialogContent>
            {viewingSession && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {viewingSession.subject}
                    {getStatusIcon(sessionStatuses.get(viewingSession.id || '') || getSessionStatus(viewingSession))}
                  </DialogTitle>
                  <DialogDescription>
                    {viewingSession.topic || 'No topic specified'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Time</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(viewingSession.start_time)} - {formatTime(viewingSession.end_time)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Day</h4>
                    <p className="text-sm text-muted-foreground">{viewingSession.day}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Priority</h4>
                    <Badge 
                      variant={viewingSession.priority === 'High' ? 'destructive' : viewingSession.priority === 'Medium' ? 'default' : 'secondary'}
                    >
                      {viewingSession.priority}
                    </Badge>
                  </div>
                  {viewingSession.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">{viewingSession.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingSession(viewingSession);
                        setViewingSession(null);
                        setFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setDeletingSession(viewingSession);
                        setViewingSession(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    {sessionStatuses.get(viewingSession.id || '') === 'active' && (
                      <Button
                        onClick={() => {
                          handleCompleteSession(viewingSession);
                          setViewingSession(null);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingSession} onOpenChange={() => setDeletingSession(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the session "{deletingSession?.subject}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
