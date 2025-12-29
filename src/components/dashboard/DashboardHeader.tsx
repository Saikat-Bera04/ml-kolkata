import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Star, Trophy } from 'lucide-react';

interface DashboardHeaderProps {
    userName: string;
    streak: number;
    xpData: {
        xp: number;
        currentLevel: number;
        xpInLevel: number;
        xpNeeded: number;
    };
}

export function DashboardHeader({ userName, streak, xpData }: DashboardHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border mb-8 p-6 md:p-8">
            {/* Abstract background shapes */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                        Welcome back, <span className="text-primary">{userName}</span>!
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Ready to continue your learning journey today?
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Badge variant="secondary" className="px-3 py-1 gap-1.5 text-sm font-medium">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            {streak} Day Streak
                        </Badge>
                    </div>
                </div>

                <div className="bg-background/60 backdrop-blur-md border rounded-2xl p-5 w-full md:w-80 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Star className="w-5 h-5 text-primary fill-primary/20" />
                            </div>
                            <span className="font-bold text-lg">Level {xpData.currentLevel + 1}</span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {xpData.xp.toLocaleString()} XP
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress to Level {xpData.currentLevel + 2}</span>
                            <span className="font-medium">{Math.round((xpData.xpInLevel / 350) * 100)}%</span>
                        </div>
                        <Progress value={(xpData.xpInLevel / 350) * 100} className="h-2.5" />
                        <p className="text-xs text-center text-muted-foreground pt-1 italic">
                            {xpData.xpNeeded} XP more to reach the next milestone!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
