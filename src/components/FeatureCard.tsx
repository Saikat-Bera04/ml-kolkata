interface FeatureCardProps {
  title: string;
  subtitle: string;
  description: string;
}

export function FeatureCard({ title, subtitle, description }: FeatureCardProps) {
  return (
    <div className="bg-card p-8 rounded-lg shadow-card hover:shadow-card-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
