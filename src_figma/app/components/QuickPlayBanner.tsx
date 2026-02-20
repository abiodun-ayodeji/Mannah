import { Zap } from 'lucide-react';

export function QuickPlayBanner() {
  return (
    <button className="w-full mb-8 p-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-2xl hover:shadow-lg transition-all group relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 size-32 bg-white/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 size-24 bg-white/20 rounded-full blur-xl"></div>
      </div>
      
      <div className="relative flex items-center justify-center gap-3">
        <Zap className="size-6 text-amber-900 fill-amber-900 group-hover:scale-110 transition-transform" />
        <span className="text-xl font-semibold text-amber-900">Quick Play — 10 Questions</span>
      </div>
    </button>
  );
}
