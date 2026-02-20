import { ArrowRight, ChevronRight } from 'lucide-react';

interface Topic {
  name: string;
  icon: string;
  accuracy: number;
  difficulty: number;
}

const topics: Topic[] = [
  { name: 'Geometry', icon: '📐', accuracy: 20, difficulty: 2 },
  { name: 'Punctuation', icon: '📝', accuracy: 67, difficulty: 2 }
];

export function RecommendedSection() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-5 px-1">
        <div className="size-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
          <span className="text-lg">🎯</span>
        </div>
        <h2 className="text-foreground">Recommended for You</h2>
      </div>
      
      <div className="space-y-3">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="group p-5 bg-card rounded-xl border border-border hover:border-primary/30 transition-all shadow-sm hover:shadow-md flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl">
                {topic.icon}
              </div>
              <div>
                <h4 className="text-foreground mb-1">{topic.name}</h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{topic.accuracy}% accuracy</span>
                  <span>•</span>
                  <span>Difficulty {'★'.repeat(topic.difficulty)}{'☆'.repeat(3 - topic.difficulty)}</span>
                </div>
              </div>
            </div>
            <button className="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium">
              Practice
              <ArrowRight className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
