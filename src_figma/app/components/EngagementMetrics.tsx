import { Target, Swords, Trophy } from 'lucide-react';

export function EngagementMetrics() {
  const metrics = [
    {
      icon: Target,
      label: 'Dailies',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: Swords,
      label: 'Bosses',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      icon: Trophy,
      label: 'Badges',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-10">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <button
            key={metric.label}
            className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md"
          >
            <div className={`size-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className="size-6 text-white" />
            </div>
            <div className="text-sm font-medium text-foreground">{metric.label}</div>
          </button>
        );
      })}
    </div>
  );
}
