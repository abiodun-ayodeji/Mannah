import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'

interface LandingProps {
  onGetStarted: () => void
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#5b4cff] px-6">
      {/* Floating decorative circles */}
      <div className="absolute top-16 left-8 h-36 w-36 rounded-full bg-white/[0.04] animate-float" />
      <div
        className="absolute right-6 bottom-28 h-52 w-52 rounded-full bg-white/[0.04] animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/4 right-12 h-20 w-20 rounded-full bg-white/[0.07] animate-float"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="absolute bottom-1/3 left-12 h-14 w-14 rounded-full bg-white/[0.06] animate-float"
        style={{ animationDelay: '3s' }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo mark */}
        <motion.div
          className="flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-white/15 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <span className="text-6xl font-black tracking-tighter text-white">M</span>
        </motion.div>

        {/* Brand name + tagline */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <h1 className="text-5xl font-black tracking-tight text-white text-center">
            Manna<span className="text-[#FCD34D]">h</span>
          </h1>
          <p className="text-center text-base font-medium leading-relaxed text-white/65">
            Smart, adaptive 11+ practice that grows
            <br />
            with your child. Built for families.
          </p>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
        >
          <ShieldCheck className="h-4 w-4 text-[#FCD34D]" />
          <span className="text-xs font-semibold text-white/80">
            No ads &middot; No in-app purchases &middot; Free forever
          </span>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={onGetStarted}
          className="mt-4 flex items-center gap-3 rounded-2xl bg-[#FCD34D] px-10 py-4 text-base font-extrabold text-[#1a1036] shadow-lg transition-all hover:shadow-xl hover:brightness-105"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>

      <p className="absolute bottom-8 text-xs font-medium text-white/30">
        Adaptive 11+ Practice
      </p>
    </div>
  )
}
