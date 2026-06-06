import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, MessageSquare, Brain, Eye } from 'lucide-react';
import { AGENTS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    responseLength: 'short' | 'medium' | 'deep';
    voiceTone: 'gentle' | 'balanced' | 'direct';
    enabledAgents: string[];
    showSynthesis: boolean;
  };
  setConfig: (config: any) => void;
}

export default function SettingsModal({ isOpen, onClose, config, setConfig }: SettingsModalProps) {
  const toggleAgent = (id: string) => {
    const newAgents = config.enabledAgents.includes(id)
      ? config.enabledAgents.filter(a => a !== id)
      : [...config.enabledAgents, id];
    setConfig({ ...config, enabledAgents: newAgents });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-xl bg-white rounded-[28px] border border-stone-200 overflow-hidden"
          >
            <div className="flex items-center justify-between p-7 border-b border-stone-100">
              <div className="flex items-center gap-3 text-charcoal">
                <Sliders size={20} className="text-vermilion" />
                <h3 className="font-bold text-[18px]">Bonds.ai Settings</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-7 space-y-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {/* Response Settings */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[11px] uppercase font-bold tracking-widest text-warm-gray">Response Depth</label>
                  <div className="flex p-1 bg-stone-100 rounded-full gap-1">
                    {(['short', 'medium', 'deep'] as const).map(len => (
                      <button
                        key={len}
                        onClick={() => setConfig({ ...config, responseLength: len })}
                        className={`flex-1 py-1.5 text-[11px] font-bold uppercase transition-all rounded-full ${
                          config.responseLength === len ? 'bg-white text-vermilion' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        {len}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] uppercase font-bold tracking-widest text-warm-gray">Voice Tone</label>
                  <div className="flex p-1 bg-stone-100 rounded-full gap-1">
                    {(['gentle', 'balanced', 'direct'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setConfig({ ...config, voiceTone: t })}
                        className={`flex-1 py-1.5 text-[11px] font-bold uppercase transition-all rounded-full ${
                          config.voiceTone === t ? 'bg-white text-vermilion' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggle Synthesis */}
              <div className="flex items-center justify-between p-6 bg-stone-50 rounded-[24px] border border-stone-100/50">
                <div className="flex items-center gap-4 text-charcoal">
                  <div className="bg-white p-3 rounded-2xl border border-stone-100">
                    <Brain size={20} className="text-vermilion" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-charcoal">Synthesis Engine</p>
                    <p className="text-[11px] text-warm-gray">Merge all agents into a unified summary</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, showSynthesis: !config.showSynthesis })}
                  className={`w-12 h-6 rounded-full transition-all relative outline-none ${config.showSynthesis ? 'bg-vermilion' : 'bg-stone-200'}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 bg-white rounded-full transition-all ${config.showSynthesis ? 'left-6.5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Active Lenses */}
              <div className="space-y-6">
                <label className="text-[11px] uppercase font-bold tracking-widest text-warm-gray">Active Lenses</label>
                <div className="grid grid-cols-2 gap-4">
                  {AGENTS.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        config.enabledAgents.includes(agent.id)
                          ? 'bg-white border-vermilion/20'
                          : 'bg-stone-50/50 border-stone-100 grayscale opacity-40'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                        config.enabledAgents.includes(agent.id) ? 'bg-vermilion/10 text-vermilion' : 'bg-stone-200 text-warm-gray'
                      }`}>
                        {agent.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-charcoal truncate">{agent.name}</p>
                        <p className="text-[10px] text-warm-gray font-medium truncate">{agent.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-7 bg-stone-50 border-stone-100 border-t flex justify-between items-center">
              <p className="text-[10px] text-warm-gray font-bold uppercase tracking-wider">v1.1.0</p>
              <button 
                onClick={onClose}
                className="bg-vermilion text-white px-10 py-3 rounded-full text-[11px] uppercase tracking-widest font-bold hover:bg-vermilion/90 transition-all active:scale-95"
              >
                Save Configuration
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
