import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { QuestionOption } from '../../types/question'

interface MultipleChoiceProps {
  options: QuestionOption[]
  selectedId: string | null
  correctId: string | null
  disabled: boolean
  onSelect: (id: string) => void
}

const LABELS = ['A', 'B', 'C', 'D', 'E']

function getContainerClasses(isSelected: boolean, isCorrect: boolean, showResult: boolean) {
  if (showResult && isCorrect) {
    return 'border-emerald-200/60 bg-emerald-300/15'
  }
  if (showResult && isSelected && !isCorrect) {
    return 'border-rose-200/65 bg-rose-300/18'
  }
  if (isSelected) {
    return 'border-cyan-200/55 bg-cyan-200/15'
  }
  return 'border-white/24 bg-white/10 hover:border-cyan-200/40 hover:bg-white/15'
}

function getBadgeClasses(isSelected: boolean, isCorrect: boolean, showResult: boolean) {
  if (showResult && isCorrect) {
    return 'border-emerald-100/70 bg-emerald-300/70 text-[#0d3a2e]'
  }
  if (showResult && isSelected && !isCorrect) {
    return 'border-rose-100/70 bg-rose-300/70 text-[#401525]'
  }
  if (isSelected) {
    return 'border-cyan-100/70 bg-cyan-200/70 text-[#07253e]'
  }
  return 'border-white/30 bg-white/10 text-[#c3daf7]'
}

export default function MultipleChoice({
  options,
  selectedId,
  correctId,
  disabled,
  onSelect,
}: MultipleChoiceProps) {
  const hasSvg = options.some((opt) => opt.svgData)

  if (hasSvg) {
    return (
      <SvgGrid
        options={options}
        selectedId={selectedId}
        correctId={correctId}
        disabled={disabled}
        onSelect={onSelect}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {options.map((opt, idx) => {
        const isSelected = selectedId === opt.id
        const isCorrect = correctId === opt.id
        const showResult = correctId !== null

        const resultAnimate =
          showResult && isCorrect
            ? { opacity: 1, x: 0, scale: [1, 1.02, 1] }
            : showResult && isSelected && !isCorrect
              ? { opacity: 1, x: [0, -4, 4, -4, 0] }
              : { opacity: 1, x: 0 }

        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={resultAnimate}
            transition={{ delay: idx * 0.08 }}
            whileTap={
              disabled
                ? undefined
                : { scale: 0.97, transition: { type: 'spring', stiffness: 300, damping: 20 } }
            }
            onClick={() => !disabled && onSelect(opt.id)}
            disabled={disabled}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${getContainerClasses(
              isSelected,
              isCorrect,
              showResult
            )} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span
              className={`grid size-8 place-items-center rounded-full border text-sm font-black transition-colors ${getBadgeClasses(
                isSelected,
                isCorrect,
                showResult
              )}`}
            >
              {LABELS[idx]}
            </span>

            <span className="flex-1 text-[15px] font-bold text-[#edf8ff]">{opt.label}</span>

            {showResult && isCorrect && <span className="text-xl text-emerald-200">&#10003;</span>}
            {showResult && isSelected && !isCorrect && <span className="text-xl text-rose-200">&#10007;</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

function SvgGrid({ options, selectedId, correctId, disabled, onSelect }: MultipleChoiceProps) {
  const [isShortViewport, setIsShortViewport] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-height: 760px)')
    const update = () => setIsShortViewport(mediaQuery.matches)
    update()

    const onChange = (event: MediaQueryListEvent) => setIsShortViewport(event.matches)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    }

    mediaQuery.addListener(onChange)
    return () => mediaQuery.removeListener(onChange)
  }, [])

  const showResult = correctId !== null
  const gridCols = isShortViewport
    ? 'repeat(1, minmax(0, 1fr))'
    : options.length > 4
      ? 'repeat(3, minmax(0, 1fr))'
      : 'repeat(2, minmax(0, 1fr))'

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: gridCols }}>
      {options.map((opt, idx) => {
        const isSelected = selectedId === opt.id
        const isCorrect = correctId === opt.id

        const resultAnimate =
          showResult && isCorrect
            ? { opacity: 1, x: 0, scale: [1, 1.03, 1] }
            : showResult && isSelected && !isCorrect
              ? { opacity: 1, x: [0, -4, 4, -4, 0] }
              : { opacity: 1, x: 0 }

        return (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, x: -16 }}
            animate={resultAnimate}
            transition={{ delay: idx * 0.08 }}
            whileTap={
              disabled
                ? undefined
                : { scale: 0.96, transition: { type: 'spring', stiffness: 300, damping: 20 } }
            }
            onClick={() => !disabled && onSelect(opt.id)}
            disabled={disabled}
            className={`relative flex ${
              isShortViewport ? 'h-[clamp(130px,18vh,190px)]' : 'h-[clamp(160px,28vw,260px)]'
            } flex-col items-center justify-center rounded-2xl border p-3 transition-all ${getContainerClasses(
              isSelected,
              isCorrect,
              showResult
            )} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span
              className={`absolute left-2 top-2 grid size-6 place-items-center rounded-full border text-xs font-black ${getBadgeClasses(
                isSelected,
                isCorrect,
                showResult
              )}`}
            >
              {LABELS[idx]}
            </span>

            {opt.svgData ? (
              <div
                className="svg-container h-full max-h-[86px] w-full max-w-[86px]"
                dangerouslySetInnerHTML={{ __html: opt.svgData }}
              />
            ) : (
              <span className="text-center text-sm font-bold text-[#edf8ff]">{opt.label}</span>
            )}

            {showResult && isCorrect && (
              <span className="absolute right-2 top-2 text-base text-emerald-200">&#10003;</span>
            )}
            {showResult && isSelected && !isCorrect && (
              <span className="absolute right-2 top-2 text-base text-rose-200">&#10007;</span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
