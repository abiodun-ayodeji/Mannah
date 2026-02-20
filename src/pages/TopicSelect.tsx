import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Topic } from '../types/subject'
import { TOPIC_LABELS } from '../types/subject'

export default function TopicSelect() {
  const { subjectId, topicId } = useParams<{ subjectId: string; topicId: string }>()
  const navigate = useNavigate()
  const topic = topicId as Topic

  const startQuiz = (count: number, difficulty: number) => {
    const params = new URLSearchParams({
      subject: subjectId!,
      topic,
      count: String(count),
      difficulty: String(difficulty),
    })
    navigate(`/quiz?${params}`)
  }

  return (
    <div className="aurora-page mx-auto max-w-5xl space-y-5 pb-8">
      <div className="mt-1 flex items-center gap-3">
        <button
          onClick={() => navigate(`/subject/${subjectId}`)}
          className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-lg text-[#c2daf7] transition hover:bg-white/20"
        >
          ←
        </button>
        <h1 className="text-xl font-extrabold text-[#edf8ff] md:text-2xl">
          {TOPIC_LABELS[topic] ?? topic}
        </h1>
      </div>

      <section className="aurora-card-soft rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a7c6e8]">
          How many questions?
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { count: 5, label: 'Quick 5' },
          { count: 10, label: 'Standard 10' },
          { count: 20, label: 'Challenge 20' },
        ].map((opt, idx) => (
          <motion.button
            key={opt.count}
            onClick={() => startQuiz(opt.count, 2)}
            className="aurora-subtle rounded-2xl border border-white/20 p-4 text-center transition-colors hover:bg-white/15"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="text-2xl font-extrabold text-cyan-100">{opt.count}</div>
            <div className="text-xs font-semibold text-[#a6c6e8]">{opt.label}</div>
          </motion.button>
        ))}
        </div>
      </section>

      <section className="aurora-card-soft rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#a7c6e8]">
          Choose difficulty
        </h2>
        <div className="mt-3 flex flex-col gap-2.5">
        {[
          { diff: 1, label: 'Easy', desc: 'Getting started', emoji: '🟢' },
          { diff: 2, label: 'Medium', desc: 'Building confidence', emoji: '🟡' },
          { diff: 3, label: 'Hard', desc: 'Exam level', emoji: '🟠' },
          { diff: 4, label: 'Very Hard', desc: 'Top grammar schools', emoji: '🔴' },
          { diff: 5, label: 'Expert', desc: 'Scholarship level', emoji: '⭐' },
        ].map((opt, idx) => (
          <motion.button
            key={opt.diff}
            onClick={() => startQuiz(10, opt.diff)}
            className="aurora-subtle flex items-center gap-3 rounded-2xl border border-white/20 p-4 text-left transition-colors hover:bg-white/15"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div>
              <div className="font-bold text-[#edf8ff]">{opt.label}</div>
              <div className="text-xs text-[#a6c6e8]">{opt.desc}</div>
            </div>
          </motion.button>
        ))}
        </div>
      </section>
    </div>
  )
}
