import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { track } from '@vercel/analytics'

const FEEDBACK_COUNT_KEY = 'mannah_feedback_count'
const SHOW_EVERY = 5

const RATINGS = [
  { emoji: '\u{1F615}', label: 'Confused', value: 1 },
  { emoji: '\u{1F610}', label: 'Okay', value: 2 },
  { emoji: '\u{1F60A}', label: 'Good', value: 3 },
  { emoji: '\u{1F929}', label: 'Love it', value: 4 },
]

/** Increment the quiz counter and return true if we should show the prompt. */
export function shouldShowFeedback(): boolean {
  const count = parseInt(localStorage.getItem(FEEDBACK_COUNT_KEY) ?? '0', 10) + 1
  localStorage.setItem(FEEDBACK_COUNT_KEY, String(count))
  return count % SHOW_EVERY === 0
}

interface FeedbackPromptProps {
  /** Extra context sent alongside the rating event */
  context?: Record<string, string | number>
  /** Optional Google Form URL for "Tell us more" */
  formUrl?: string
}

export default function FeedbackPrompt({ context, formUrl }: FeedbackPromptProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = (value: number) => {
    setSelected(value)
    const sid = sessionStorage.getItem('mannah_dev_session_id') ?? 'unknown'
    track('student_feedback', {
      session_id: sid,
      rating: value,
      rating_label: RATINGS.find((r) => r.value === value)?.label ?? '',
      ...context,
    })
  }

  return (
    <motion.div
      className="mt-4 pt-4 border-t border-[#e5e7eb]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
    >
      <AnimatePresence mode="wait">
        {selected === null ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <p className="text-xs font-semibold text-[#6b7280] mb-2">
              How was this quiz?
            </p>
            <div className="flex justify-center gap-3">
              {RATINGS.map((r) => (
                <motion.button
                  key={r.value}
                  onClick={() => handleSelect(r.value)}
                  className="flex flex-col items-center gap-0.5"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-[9px] text-[#6b7280] font-semibold">{r.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="thanks"
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-xs font-semibold text-[#6b7280]">
              Thanks for your feedback!
            </p>
            {formUrl && (
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#5b4cff] font-bold hover:underline mt-1 inline-block"
              >
                Want to tell us more?
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
