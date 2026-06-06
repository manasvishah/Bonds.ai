import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, PenLine, Users, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onStart: () => void;
}

export default function Onboarding({ onComplete, onStart }: OnboardingProps) {
  const steps = [
    { 
      id: "01",
      icon: <PenLine size={20} />, 
      title: "Write your situation", 
      text: "Share what’s been on your mind. No perfect wording needed." 
    },
    { 
      id: "02",
      icon: <Users size={20} />, 
      title: "See multiple perspectives", 
      text: "Different agents reflect on your situation from unique lenses." 
    },
    { 
      id: "03",
      icon: <Sparkles size={20} />, 
      title: "Find clarity", 
      text: "Understand patterns and decide what feels right for you." 
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ivory/95 backdrop-blur-3xl p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.99, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-5xl w-full bg-white rounded-[40px] border border-stone-100/50 p-10 md:p-16 space-y-12"
      >
        <div className="space-y-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[36px] font-bold text-charcoal tracking-tight leading-tight"
          >
            Welcome to Bonds.ai
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-stone-400 text-[18px] leading-relaxed max-w-md mx-auto"
          >
            Gain clarity in your relationships through multiple perspectives.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1), duration: 0.8 }}
              className="group bg-white rounded-[32px] p-8 border border-stone-100 flex flex-col items-center text-center space-y-5 transition-all duration-500"
            >
              <div className="w-14 h-14 bg-vermilion/5 rounded-2xl flex items-center justify-center text-vermilion shrink-0 transition-colors duration-500">
                {step.icon}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-[15px] font-bold text-charcoal flex flex-col items-center gap-1">
                  <span className="text-[12px] font-bold text-vermilion/40 tabular-nums uppercase tracking-widest">{step.id}</span>
                  {step.title}
                </h3>
                <p className="text-[14px] text-warm-gray leading-relaxed font-normal">
                  {step.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-6 pt-6"
        >
          <button
            onClick={onStart}
            className="bg-vermilion text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-vermilion/90 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Start Reflection
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onComplete}
            className="text-[11px] font-bold uppercase tracking-widest text-stone-300 hover:text-stone-500 transition-colors px-6"
          >
            Skip
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
