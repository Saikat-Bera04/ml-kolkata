import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { SupportModal } from '@/components/SupportModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MentorNavbar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [supportOpen, setSupportOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/mentor/dashboard' },
    { label: 'Students', path: '/mentor/students' },
    { label: 'Analytics', path: '/mentor/analytics' },
    { label: 'Alerts', path: '/mentor/alerts' },
    { label: 'Resources', path: '/mentor/resources' },
  ];

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo */}
          <div className="font-bold text-lg">SkillHive Mentor</div>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-sm font-medium hover:text-primary-foreground/80 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right: Theme Toggle, Notifications, Support, Profile */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary/90 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                5
              </span>
            </Button>

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
                <DropdownMenuItem onClick={() => navigate('/mentor/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/mentor/settings')}>
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
