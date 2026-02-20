import { Flame, Bell } from 'lucide-react';
import { Badge } from './ui/badge';

interface UserHeaderProps {
  userName: string;
  level: string;
  streak: number;
  xp: number;
}

export function UserHeader({ userName, level, streak, xp }: UserHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 px-6 py-5 bg-card rounded-2xl border border-border shadow-sm">
      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center border-2 border-primary/20">
          <span className="text-xl font-semibold text-primary">
            {userName.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="text-foreground mb-0.5">{userName}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-accent/50 text-accent-foreground border-0">
              {level}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Flame className="size-3.5 text-orange-500" />
              <span className="text-sm">{streak}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total XP</div>
          <div className="text-xl font-semibold text-foreground">{xp.toLocaleString()}</div>
        </div>
        <button className="size-10 rounded-xl bg-secondary hover:bg-accent transition-colors flex items-center justify-center">
          <Bell className="size-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
