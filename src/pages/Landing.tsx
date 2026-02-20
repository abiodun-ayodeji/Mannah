import { motion } from 'framer-motion'
import { ArrowRight, Brain } from 'lucide-react'

interface LandingProps {
  onGetStarted: () => void
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="aurora-flow min-h-screen relative overflow-hidden px-4 py-8 md:py-12 flex items-center justify-center">
      <div className="aurora-orb aurora-orb-cyan top-[-130px] left-[-120px] h-[340px] w-[340px]" />
      <div className="aurora-orb aurora-orb-violet bottom-[-120px] right-[-110px] h-[360px] w-[360px]" />

      <section className="relative z-10 mx-auto w-full max-w-xl">
        <motion.div
          className="aurora-glass rounded-3xl p-6 md:p-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-300/80 via-cyan-200/60 to-violet-300/70 text-3xl font-black text-[#0a1e3e]"
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            M
          </motion.div>

          <h1 className="aurora-heading mt-5 text-4xl font-black tracking-tight text-white">MANNAH</h1>

          <p className="mt-3 text-sm leading-relaxed text-[#c8defb] md:text-base">
            Mannah makes 11+ practice clear, focused, and motivating for children.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#c8defb] md:text-base">
            Families get one simple place for daily learning, progress, and confidence.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-[#def2ff]">
            <Brain className="size-4 text-cyan-200" />
            No ads, No in-app purchase, No Cost, Ever
          </div>

          <motion.button
            onClick={onGetStarted}
            className="aurora-button-primary mt-6 inline-flex items-center gap-2 px-7 py-3 text-sm font-extrabold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Continue
            <ArrowRight className="size-4" />
          </motion.button>
        </motion.div>
      </section>
    </div>
  )
}
