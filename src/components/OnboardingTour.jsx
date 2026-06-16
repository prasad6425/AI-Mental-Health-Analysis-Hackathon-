import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight, Check, Sparkles, LayoutDashboard, HeartHandshake, Gamepad2 } from 'lucide-react'
import confetti from 'canvas-confetti'

const steps = [
  {
    icon: Sparkles,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    title: "Welcome to MindWell! 🌱",
    desc: "We're so glad you're here. This is your personal, secure space for mental wellness and emotional growth. Let's take a quick tour!"
  },
  {
    icon: LayoutDashboard,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    title: "Dashboard & AI Insights 🧠",
    desc: "Track your emotional state, log daily journals, and receive real-time, actionable insights from our caring AI companion."
  },
  {
    icon: Gamepad2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    title: "Therapeutic Activities 🧘",
    desc: "Take a break! Engage in our Mind Games, breathing exercises, and your personalized 7-Day Routine to build healthy habits."
  },
  {
    icon: HeartHandshake,
    color: 'text-teal-400',
    bg: 'bg-teal-500/20',
    title: "Professional Support 👩‍⚕️",
    desc: "You're never alone. Connect with a licensed therapist directly through the platform for personalized guidance whenever you need it."
  }
]

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0)

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#60a5fa', '#a78bfa', '#34d399']
      })
      onComplete()
    }
  }

  const CurrentIcon = steps[step].icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: `${(step / steps.length) * 100}%` }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 text-center flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
            className={`w-20 h-20 rounded-full ${steps[step].bg} flex items-center justify-center mb-6 shadow-lg`}
          >
            <CurrentIcon size={40} className={steps[step].color} />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-3">{steps[step].title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {steps[step].desc}
          </p>

          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-blue-500 w-4' : 'bg-slate-700'}`} />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
            >
              {step === steps.length - 1 ? (
                <>Get Started <Check size={18} /></>
              ) : (
                <>Next <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
