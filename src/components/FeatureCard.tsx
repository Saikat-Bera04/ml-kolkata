import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
}

export function FeatureCard({ title, subtitle, description, icon: Icon }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-[#1a1f2e]/50 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all duration-300 group backdrop-blur-sm">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
        <Icon size={24} className="text-primary group-hover:text-inherit" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{title}</h3>
      <p className="text-sm font-medium text-primary mb-4">{subtitle}</p>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic transition-colors">"{description}"</p>
    </div>
  );
}
