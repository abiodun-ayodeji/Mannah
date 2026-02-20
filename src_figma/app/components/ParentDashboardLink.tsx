import { Users, ArrowRight } from 'lucide-react';

export function ParentDashboardLink() {
  return (
    <button className="w-full p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-md">
            <Users className="size-6 text-white" />
          </div>
          <div className="text-left">
            <h4 className="text-foreground mb-0.5">Parent Dashboard</h4>
            <p className="text-sm text-muted-foreground">Track progress and insights</p>
          </div>
        </div>
        <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}
