import { TrendingUp } from 'lucide-react';

interface WelcomeHeroProps {
  userName: string;
  exam: string;
  dailyStats: {
    questions: number;
    accuracy: number;
    xpToday: number;
  };
}

export function WelcomeHero({ userName, exam, dailyStats }: WelcomeHeroProps) {
  return (
    <div className="mb-8 px-8 py-10 bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-2xl text-white shadow-lg relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 size-64 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 size-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative">
        <div className="mb-6">
          <h1 className="text-white mb-2">Hey, {userName}! 👋</h1>
          <p className="text-white/80 text-lg">Ready to practice for your {exam}?</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20">
            <div className="text-3xl font-semibold mb-1">{dailyStats.questions}</div>
            <div className="text-sm text-white/70">Questions</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20">
            <div className="text-3xl font-semibold mb-1 flex items-center gap-2">
              {dailyStats.accuracy}%
              {dailyStats.accuracy > 50 && <TrendingUp className="size-5 text-green-300" />}
            </div>
            <div className="text-sm text-white/70">Accuracy</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/20">
            <div className="text-3xl font-semibold mb-1">+{dailyStats.xpToday}</div>
            <div className="text-sm text-white/70">XP Today</div>
          </div>
        </div>
      </div>
    </div>
  );
}
