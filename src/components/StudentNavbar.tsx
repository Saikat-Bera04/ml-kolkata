import { Bell, User, Mic, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead, Notification } from '@/services/notifications';
import { SupportModal } from '@/components/SupportModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export function StudentNavbar() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard' },
    { label: 'About', path: '/student/about' },
    { label: 'Podcasts', path: '/student/podcasts' },
    // Jobs will be a dropdown with quick links
    { label: 'Timetable', path: '/student/timetable' },
  ];

  // loadNotifications stable via useCallback-like definition inside effect
  useEffect(() => {
    if (!user) return;

    const handleNotificationUpdate = () => {
      const allNotifications = getNotifications(user.id);
      setNotifications(allNotifications);
      setUnreadCount(getUnreadCount(user.id));
    };

    // Initial load
    handleNotificationUpdate();

    window.addEventListener('notification-created', handleNotificationUpdate as EventListener);
    window.addEventListener('notification-updated', handleNotificationUpdate as EventListener);
    window.addEventListener('refresh-notifications', handleNotificationUpdate as EventListener);

    return () => {
      window.removeEventListener('notification-created', handleNotificationUpdate as EventListener);
      window.removeEventListener('notification-updated', handleNotificationUpdate as EventListener);
      window.removeEventListener('refresh-notifications', handleNotificationUpdate as EventListener);
    };
  }, [user]);

  const loadNotifications = () => {
    if (!user) return;
    const allNotifications = getNotifications(user.id);
    setNotifications(allNotifications);
    setUnreadCount(getUnreadCount(user.id));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!user) return;
    if (!notification.read && notification.id) {
      markAsRead(user.id, notification.id);
      // Update local state
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
      setUnreadCount(getUnreadCount(user.id));
    }
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    markAllAsRead(user.id);
    loadNotifications();
  };

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Microphone Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary/90"
          >
            <Mic className="h-5 w-5" />
          </Button>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Learning Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium hover:text-primary-foreground/80 transition-colors flex items-center gap-1">
                  Learning
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => navigate('/student/learning')}>
                  Regular Learning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student/competitive-exams')}>
                  Competitive Exams
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Other Navigation Links */}
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-sm font-medium hover:text-primary-foreground/80 transition-colors"
              >
                {item.label}
              </button>
            ))}

            {/* Jobs Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium hover:text-primary-foreground/80 transition-colors flex items-center gap-1">
                  Jobs
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => navigate('/student/jobs#search')}>
                  Search Jobs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student/jobs#saved')}>
                  Saved Jobs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student/jobs#resume')}>
                  Resume Analysis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Notifications, Support, Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-primary/90 relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs rounded-full min-w-[1rem] h-4 flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2 border-b">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-96">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 cursor-pointer hover:bg-accent transition-colors ${
                            !notification.read ? 'bg-accent/50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Support Button */}
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
              onClick={() => setSupportOpen(true)}
            >
              ⚡ Support
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-primary/90 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/student/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </nav>
  );
}
