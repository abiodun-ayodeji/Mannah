import { BookOpen, MessageSquare, Brain, Shapes } from 'lucide-react';

interface Subject {
  name: string;
  icon: any;
  topics: number;
  gradient: string;
  bgGradient: string;
}

const subjects: Subject[] = [
  {
    name: 'Maths',
    icon: '🔢',
    topics: 12,
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50'
  },
  {
    name: 'English',
    icon: '📚',
    topics: 8,
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50'
  },
  {
    name: 'Verbal Reasoning',
    icon: '🧩',
    topics: 9,
    gradient: 'from-rose-500 to-pink-600',
    bgGradient: 'from-rose-50 to-pink-50'
  },
  {
    name: 'Non-Verbal Reasoning',
    icon: '◆',
    topics: 7,
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50'
  }
];

export function SubjectGrid() {
  return (
    <div className="mb-8">
      <h2 className="text-foreground mb-5 px-1">Choose a Subject</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {subjects.map((subject, index) => (
          <button
            key={index}
            className="group p-6 bg-card rounded-2xl border border-border hover:border-transparent hover:shadow-xl transition-all text-left relative overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            
            <div className="relative">
              <div className={`size-14 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform shadow-lg`}>
                {subject.icon}
              </div>
              <h3 className="text-foreground mb-1.5">{subject.name}</h3>
              <div className="text-sm text-muted-foreground">{subject.topics} topics</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
