import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import type { Question } from '../../types/question'
import { useReadAloud } from '../../hooks/useReadAloud'
import { useUserProfile } from '../../hooks/useUserProfile'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  children: React.ReactNode
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  children,
}: QuestionCardProps) {
  const { profile } = useUserProfile()
  const { speak, stop, isSpeaking } = useReadAloud()
  const readAloudEnabled = profile?.settings?.readAloudEnabled ?? false

  const handleSpeak = () => {
    if (isSpeaking) {
      stop()
    } else {
      const text = question.prompt + (question.passage ? '. ' + question.passage : '')
      speak(text)
    }
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col gap-4"
    >
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#a9c8e9]">
        Question {questionNumber} of {totalQuestions}
      </div>

      {question.svgData && (
        <div className="aurora-card-soft flex justify-center overflow-hidden rounded-2xl p-4">
          <div
            className="svg-container w-full max-h-[150px]"
            dangerouslySetInnerHTML={{ __html: question.svgData }}
          />
        </div>
      )}

      <motion.div
        className="aurora-card rounded-2xl p-5 md:p-6"
        initial={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
        animate={{
          boxShadow: [
            '0 8px 24px rgba(6, 14, 38, 0.2)',
            '0 14px 32px rgba(8, 24, 62, 0.3)',
            '0 8px 24px rgba(6, 14, 38, 0.2)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <div className="flex items-start gap-2">
          <p className="flex-1 text-lg font-black leading-relaxed text-[#eff8ff] md:text-xl">
            {question.prompt}
          </p>
          {readAloudEnabled && (
            <motion.button
              onClick={handleSpeak}
              className={`shrink-0 size-9 rounded-full flex items-center justify-center transition-colors ${
                isSpeaking
                  ? 'border border-cyan-100/40 bg-cyan-300/20 text-cyan-100'
                  : 'border border-white/20 bg-white/10 text-[#b8d4f5] hover:bg-white/20 hover:text-[#ddf0ff]'
              }`}
              whileTap={{ scale: 0.9 }}
              animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
              transition={isSpeaking ? { repeat: Infinity, duration: 1 } : {}}
              aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
            >
              {isSpeaking ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </motion.button>
          )}
        </div>
        {question.passage && (
          <p className="mt-4 border-l-2 border-cyan-200/55 pl-3 text-sm leading-relaxed italic text-[#c2dbf6]">
            {question.passage}
          </p>
        )}
      </motion.div>

      <div className="mt-2">{children}</div>
    </motion.div>
  )
}
