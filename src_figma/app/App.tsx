import { UserHeader } from './components/UserHeader';
import { WelcomeHero } from './components/WelcomeHero';
import { EngagementMetrics } from './components/EngagementMetrics';
import { RecommendedSection } from './components/RecommendedSection';
import { QuickPlayBanner } from './components/QuickPlayBanner';
import { SubjectGrid } from './components/SubjectGrid';
import { ParentDashboardLink } from './components/ParentDashboardLink';

export default function App() {
  // Mock user data
  const userData = {
    name: 'Noah',
    level: 'Apprentice',
    streak: 1,
    totalXP: 320
  };

  const dailyStats = {
    questions: 24,
    accuracy: 54,
    xpToday: 320
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <UserHeader
          userName={userData.name}
          level={userData.level}
          streak={userData.streak}
          xp={userData.totalXP}
        />
        
        <WelcomeHero
          userName={userData.name}
          exam="11+"
          dailyStats={dailyStats}
        />
        
        <EngagementMetrics />
        
        <RecommendedSection />
        
        <QuickPlayBanner />
        
        <SubjectGrid />
        
        <ParentDashboardLink />
      </div>
    </div>
  );
}
