import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, MessageSquare, ChevronDown, ChevronUp, CheckCircle2, Loader2, Sparkles, Compass, Shield, Copy, Bookmark, MessageCircle, Info, X, ExternalLink, Pin, PinOff, AlertTriangle } from 'lucide-react';
import { Agent, AgentState, ThinkingStatus } from '../types';
import { AGENTS, APP_THEME } from '../constants';

interface AgentPanelProps {
  agentStates: AgentState[];
  isAnalyzing: boolean;
  appConfig: {
    responseLength: string;
    voiceTone: string;
    enabledAgents: string[];
    showSynthesis: boolean;
  };
  isCompareMode: boolean;
  setIsCompareMode: (val: boolean) => void;
  onFollowUp?: (agentName: string, text: string) => void;
}

export default function AgentPanel({ 
  agentStates, 
  isAnalyzing, 
  appConfig,
  isCompareMode,
  setIsCompareMode,
  onFollowUp
}: AgentPanelProps) {
  const [expandedAgents, setExpandedAgents] = useState<string[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [pinnedRooms, setPinnedRooms] = useState<string[]>([]);
  const [hasExpandedInitially, setHasExpandedInitially] = useState(false);

  // Filter agents based on enabled list
  const activeAgents = AGENTS.filter(a => appConfig.enabledAgents.includes(a.id));

  useEffect(() => {
    if (isAnalyzing) {
      setHasExpandedInitially(false);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    const completeAgents = agentStates.filter(s => s.status === 'complete').map(s => s.agentId);
    const visibleCompleteAgents = completeAgents.filter(id => appConfig.enabledAgents.includes(id));
    if (!isAnalyzing && visibleCompleteAgents.length > 0 && !hasExpandedInitially) {
      setExpandedAgents([visibleCompleteAgents[0]]);
      setHasExpandedInitially(true);
    }
  }, [agentStates, isAnalyzing, hasExpandedInitially, appConfig.enabledAgents]);

  const toggleAgent = (id: string) => {
    setExpandedAgents(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const openRoom = (id: string) => {
    setActiveRoomId(id);
  };

  const closeRoom = () => setActiveRoomId(null);

  const togglePin = (id: string) => {
    setPinnedRooms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const expandAll = () => setExpandedAgents(activeAgents.map(a => a.id));
  const collapseAll = () => setExpandedAgents([]);

  const isAnyComplete = agentStates.some(s => s.status === 'complete' && appConfig.enabledAgents.includes(s.agentId));
  const activeAgent = AGENTS.find(a => a.id === activeRoomId);
  const activeState = agentStates.find(s => s.agentId === activeRoomId);

  // Sort agents: Pinned first, then by original order
  const sortedAgents = [...activeAgents].sort((a, b) => {
    const aPinned = pinnedRooms.includes(a.id);
    const bPinned = pinnedRooms.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <aside className={`${isCompareMode ? 'flex-1' : 'w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l h-[60vh] lg:h-full'} flex flex-col bg-ivory overflow-hidden border-stone-200 transition-all duration-500 relative`}>
      <div className="p-8 pb-6 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-40">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-charcoal tracking-tight">Agents</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isCompareMode 
                    ? 'bg-vermilion text-white shadow-md' 
                    : 'bg-white border border-stone-100 text-stone-400 hover:border-stone-200 hover:text-charcoal'
                }`}
              >
                {isCompareMode ? 'Exit Compare' : 'Compare'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-5">
             {!isCompareMode && (
               <>
                 <button 
                   onClick={expandAll}
                   className="text-[10px] font-bold uppercase tracking-widest text-stone-300 hover:text-vermilion transition-colors"
                 >
                   Expand
                 </button>
                 <button 
                   onClick={collapseAll}
                   className="text-[10px] font-bold uppercase tracking-widest text-stone-300 hover:text-charcoal transition-colors"
                 >
                   Collapse
                 </button>
               </>
             )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-32 pt-8 bg-[#FAF9F7]/40">
        {isCompareMode ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 items-stretch px-4">
            {sortedAgents.map((agent) => {
              const state = agentStates.find((s) => s.agentId === agent.id) || {
                agentId: agent.id,
                status: 'idle' as ThinkingStatus,
              };

              return (
                <AgentAccordion 
                  key={agent.id} 
                  agent={agent} 
                  state={state} 
                  isOpen={false} // Don't auto-expand full text in compare mode
                  isPinned={pinnedRooms.includes(agent.id)}
                  isCompareView={true}
                  onToggle={() => {}} // No internal toggle in compare mode? Actually user might want to expand.
                  onOpenRoom={() => openRoom(agent.id)}
                  onFollowUp={onFollowUp}
                  isAnalyzing={isAnalyzing} 
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedAgents.map((agent) => {
              const state = agentStates.find((s) => s.agentId === agent.id) || {
                agentId: agent.id,
                status: 'idle' as ThinkingStatus,
              };

              const isPinned = pinnedRooms.includes(agent.id);

              return (
                <AgentAccordion 
                  key={agent.id} 
                  agent={agent} 
                  state={state} 
                  isOpen={expandedAgents.includes(agent.id)}
                  isPinned={isPinned}
                  onToggle={() => toggleAgent(agent.id)}
                  onOpenRoom={() => openRoom(agent.id)}
                  onFollowUp={onFollowUp}
                  isAnalyzing={isAnalyzing} 
                />
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeRoomId && activeAgent && (
          <AgentRoom 
            agent={activeAgent} 
            state={activeState || { agentId: activeAgent.id, status: 'idle' }} 
            onClose={closeRoom}
            isPinned={pinnedRooms.includes(activeRoomId)}
            onTogglePin={() => togglePin(activeRoomId)}
          />
        )}
      </AnimatePresence>

      {!isAnalyzing && isAnyComplete && (
        <div className="p-8 bg-white/95 border-t border-stone-100 backdrop-blur-2xl sticky bottom-0 left-0 right-0 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <p className="text-[11px] text-stone-400 italic text-center leading-relaxed font-light tracking-wide px-8">
            "These perspectives help you see clearly—you decide which path to walk."
          </p>
        </div>
      )}
    </aside>
  );
}

function AgentRoom({ agent, state, onClose, isPinned, onTogglePin }: { agent: Agent, state: AgentState, onClose: () => void, isPinned: boolean, onTogglePin: () => void }) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-white flex flex-col"
    >
      <div className="p-6 pb-4 flex items-center justify-between border-b border-stone-100 sticky top-0 bg-white z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-stone-50 transition-colors text-stone-400"
          >
            <X size={20} />
          </button>
      <div>
            <h3 className="text-[18px] font-semibold text-charcoal tracking-tight leading-[1.2] whitespace-normal" style={{ overflowWrap: 'normal', wordBreak: 'normal' }}>{agent.name}</h3>
            <p className="text-[12px] font-medium text-stone-400">{agent.role}</p>
          </div>
        </div>
        <button 
          onClick={onTogglePin}
          className={`p-2 rounded-xl transition-all ${isPinned ? 'bg-vermilion text-white shadow-md shadow-vermilion/20' : 'bg-stone-50 text-warm-gray hover:text-charcoal'}`}
        >
          {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
        {/* Agent Identity Section */}
        <section className="space-y-4">
          <div className="p-8 bg-stone-50/50 rounded-[32px] border border-stone-100/50 space-y-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-300">Agent Identity</p>
            <p className="text-stone-500 leading-relaxed text-[15px] italic font-normal">
              "{agent.longDescription}"
            </p>
          </div>
        </section>

        {/* Focus Areas */}
        <section className="space-y-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-stone-300">Focus Areas</p>
          <div className="grid grid-cols-2 gap-3">
            {agent.focusAreas.map(area => (
              <div key={area} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-stone-100 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />
                <span className="text-[12px] font-medium text-stone-500">{area}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Live Thinking / Cognitive Trace */}
        <section className="space-y-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-stone-300">Cognitive Trace</p>
          <div className="space-y-3">
            {(state.thoughts || (state.status !== 'complete' && state.status !== 'idle' ? [state.currentThought || "Initializing..."] : [])).map((thought, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-stone-300" />
                </div>
                <div className="bg-stone-50/50 px-4 py-2 rounded-xl rounded-tl-none border border-stone-100 flex-1">
                  <p className="text-[13px] text-warm-gray leading-snug">{thought}</p>
                </div>
              </motion.div>
            ))}
            {state.status !== 'complete' && state.status !== 'idle' && (
              <div className="flex items-center gap-3 pl-9">
                <Loader2 size={12} className="animate-spin text-stone-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Processing...</span>
              </div>
            )}
            {state.status === 'stopped' && (
              <div className="flex items-center gap-3 pl-9">
                <X size={12} className="text-stone-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Analysis stopped</span>
              </div>
            )}
            {state.status === 'complete' && (
              <div className="flex items-center gap-3 pl-9">
                <CheckCircle2 size={12} className="text-emerald-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Analysis finalized</span>
              </div>
            )}
          </div>
        </section>

        {/* Final Output */}
        {state.status === 'complete' && (
          <section className="space-y-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-300">Final Reflection</p>
            <div className="text-charcoal leading-normal text-[16px] space-y-4">
              {state.fullResponse?.split('\n').map((para, i) => (
                <p key={i} className="relative pl-6 border-l-2 border-stone-100 py-0.5">
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Knowledge Base */}
        <section className="space-y-4 pt-10 border-t border-stone-100">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-300 flex items-center gap-2">
            <Shield size={12} /> Knowledge Base Grounding
          </p>
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">Relationship psychology + behavioral frameworks</span>
            <ExternalLink size={14} className="text-stone-300" />
          </div>
        </section>
      </div>
    </motion.div>
  );
}

interface AgentAccordionProps {
  agent: Agent;
  state: AgentState;
  isOpen: boolean;
  isPinned: boolean;
  isCompareView?: boolean;
  onToggle: () => void;
  onOpenRoom: () => void;
  onFollowUp?: (agentName: string, text: string) => void;
  isAnalyzing: boolean;
  key?: string | number;
}

function AgentAccordion({ agent, state, isOpen, isPinned, isCompareView = false, onToggle, onOpenRoom, onFollowUp, isAnalyzing }: AgentAccordionProps) {
  const isComplete = state.status === 'complete';
  const isStopped = state.status === 'stopped';
  const isThinking = state.status !== 'idle' && state.status !== 'complete' && state.status !== 'stopped';

  const [copied, setCopied] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(state.fullResponse || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFollowUpClick = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    onFollowUp?.(agent.name, text);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group overflow-hidden rounded-[24px] border transition-all duration-500 flex flex-col ${isCompareView ? 'h-full' : 'h-auto'} ${
        isComplete 
          ? 'bg-white border-black/[0.06] hover:border-black/[0.08]' 
          : isThinking 
          ? 'bg-white border-stone-200 ring-4 ring-stone-50' 
          : 'bg-stone-50 border-stone-100 opacity-40'
      } ${isPinned ? 'ring-1 ring-stone-200 border-stone-200' : ''}`}
    >
      {/* 1. Header Row */}
      <div 
        onClick={() => (isComplete || isThinking) && onToggle()}
        className="w-full grid grid-cols-[56px_minmax(0,1fr)_auto] gap-[14px] items-start px-5 py-5 pb-4 text-left cursor-pointer select-none relative"
      >
        {isPinned && (
          <div className="absolute top-4 right-4 text-vermilion">
            <Pin size={10} fill="currentColor" />
          </div>
        )}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onOpenRoom();
          }}
          className={`group/icon flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[14px] border border-black/[0.06] transition-all duration-500 relative ${
            isThinking ? 'animate-pulse bg-vermilion/[0.04] text-vermilion/40' : isComplete ? 'bg-vermilion/[0.06] text-vermilion/60' : 'bg-stone-50 text-stone-200'
          } hover:bg-vermilion/[0.08] shadow-none cursor-pointer`}
        >
          <AgentIcon id={agent.id} className="w-6 h-6 transition-colors group-hover/icon:text-vermilion/80" />
        </div>
        
        <div className="min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="text-[18px] font-semibold text-charcoal tracking-tight leading-[1.2] whitespace-normal" style={{ overflowWrap: 'normal', wordBreak: 'normal' }}>{agent.name}</span>
            <span className="text-[13px] font-medium text-black/55 tracking-normal mt-0.5">{agent.role}</span>
            <p className="mt-1 text-[13px] text-black/45 leading-[1.4] font-normal whitespace-normal">
              {agent.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
          <AnimatePresence mode="wait">
            {isStopped ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 shrink-0 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200 shadow-none text-[9px] font-bold uppercase tracking-wider text-stone-500"
              >
                 <X size={9} className="text-stone-400" />
                 <span>Stopped</span>
              </motion.div>
            ) : isComplete ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 shrink-0 bg-stone-50/80 px-2.5 py-0.5 rounded-full border border-stone-100/50 shadow-none text-[9px] font-bold uppercase tracking-wider text-stone-400"
              >
                 <CheckCircle2 size={9} className="text-stone-300" />
                 <span>Ready</span>
              </motion.div>
            ) : isThinking ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-1"
              >
                <div className="w-1 h-1 rounded-full bg-stone-200 animate-bounce [animation-duration:0.8s] [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 rounded-full bg-stone-200 animate-bounce [animation-duration:0.8s] [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 rounded-full bg-stone-200 animate-bounce [animation-duration:0.8s]"></div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {(isComplete || isThinking) && !isCompareView && (
             <div className="transition-transform duration-500 shrink-0" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <ChevronDown size={14} className="text-stone-300" />
             </div>
          )}
        </div>
      </div>

      {/* 2. Short Resolved Answer Preview / Thinking Pill */}
      <div 
        className={`px-6 pb-5 ${isCompareView ? 'flex-1 flex flex-col' : 'cursor-pointer'}`}
        onClick={() => !isOpen && isComplete && onToggle()}
      >
        <AnimatePresence mode="wait">
          {isStopped ? (
            <motion.div
              key="stopped"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-stone-100/50 p-3 rounded-xl border border-stone-200/50"
            >
               <AlertTriangle className="text-stone-400" size={12} />
               <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">
                 Reflection stopped
               </p>
            </motion.div>
          ) : isThinking ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-stone-50/50 p-3 rounded-xl border border-stone-100/50 relative overflow-hidden"
              onClick={(e) => { e.stopPropagation(); onOpenRoom(); }}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2.5s_infinite]"></div>
               <div className="relative z-10 flex items-center gap-2">
                 <Loader2 className="animate-spin text-stone-300" size={12} />
                 <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                   {state.currentThought || "Refining..."}
                 </p>
               </div>
            </motion.div>
          ) : isComplete ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`space-y-3 ${isCompareView ? 'flex-1 flex flex-col' : ''}`}
            >
              {!isOpen && (
                <div className="space-y-2">
                  <div className="text-[14px] leading-relaxed text-charcoal font-bold line-clamp-3">
                    {state.keyTakeaway}
                  </div>
                  <div className="text-[13px] leading-relaxed text-warm-gray italic font-normal line-clamp-3">
                    "{state.preview}"
                  </div>
                </div>
              )}
              
              {!isOpen && (
                isCompareView ? (
                  <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-stone-50">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onOpenRoom(); }}
                      className="w-full text-[11px] font-bold uppercase tracking-widest text-white bg-vermilion px-4 py-4 rounded-2xl hover:bg-[#AF3A3A] transition-all border border-vermilion/10 flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} /> Agent Room
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onToggle(); }}
                      className="text-[10px] font-bold uppercase tracking-widest text-vermilion hover:text-charcoal transition-colors underline decoration-stone-100 underline-offset-4"
                    >
                      View Full Reflection →
                    </button>
                  </div>
                )
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* 3. Expandable Full Detail */}
      <AnimatePresence>
        {isComplete && isOpen && (
          <motion.div
            key="details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-stone-100 bg-[#FAF9F7]/30 overflow-hidden"
          >
            <div className="p-6 pt-8 space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-stone-300">Key Insight</p>
                <div className="text-[18px] leading-relaxed text-charcoal font-semibold">
                   {state.keyTakeaway}
                </div>
                <div className="text-[14px] leading-relaxed text-stone-400 italic font-normal bg-white p-4 rounded-2xl border border-black/[0.04]">
                   "{state.preview}"
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-stone-300">Deep Reflection</p>
                  <button 
                    onClick={onOpenRoom}
                    className="text-[10px] uppercase font-bold tracking-widest text-[#AF3A3A] hover:opacity-70 transition-opacity flex items-center gap-1.5"
                  >
                    <ExternalLink size={12} /> Agent Room
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="prose prose-stone font-light text-stone-600 leading-normal font-display text-[15px] space-y-4 overflow-visible h-auto max-h-none">
                     {state.fullResponse?.split('\n').map((para, i) => (
                       <p key={i} className="relative pl-6 border-l-2 border-[#AF3A3A]/10">
                         {para}
                       </p>
                     ))}
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white rounded-[24px] border border-stone-100 shadow-sm flex items-start gap-4">
                 <Info size={14} className="text-[#AF3A3A]/30 mt-0.5 shrink-0" />
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Crucial Observation</p>
                   <p className="text-[13px] text-stone-500 leading-normal italic line-clamp-3">
                     {agent.id === 'empath' ? "This dynamic highlights a fundamental need for consistency that outweighs the temporary distraction of affectionate peaks." : 
                      agent.id === 'realist' ? "Objective behavior over time is the only reliable predictor of future relationship stability." :
                      agent.id === 'strategist' ? "A tactical shift in your response frequency may create the space necessary for them to move closer." :
                      "The primary tension is located between your stated values and your current tolerance for ambiguity."}
                   </p>
                 </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Suggested follow-ups</p>
                <div className="flex flex-wrap gap-2.5">
                  {(agent.suggestions || []).map(chip => (
                    <button 
                      key={chip}
                      onClick={(e) => handleFollowUpClick(e, chip)}
                      className="text-[11px] font-bold text-stone-500 bg-white border border-stone-100 px-5 py-2.5 rounded-2xl hover:border-vermilion/40 hover:text-vermilion hover:bg-vermilion/[0.02] transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100/50 flex flex-wrap items-center gap-x-8 gap-y-4">
                <button 
                  onClick={(e) => handleFollowUpClick(e, "Follow up")}
                  className="flex items-center gap-2 text-[11px] font-bold text-[#AF3A3A] uppercase tracking-widest hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  <MessageCircle size={14} /> Follow up
                </button>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest hover:text-charcoal transition-colors whitespace-nowrap"
                >
                  <Copy size={14} /> {copied ? 'Copied to clipboard' : 'Share'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AgentIcon({ id, className }: { id: string, className?: string }) {
  const props = { size: 28, className: className || "text-[#AF3A3A]/70" };
  switch (id) {
    case 'empath': return <Shield {...props} fill="currentColor" fillOpacity={0.05} />;
    case 'realist': return <Compass {...props} />;
    case 'advocate': return <Brain {...props} />;
    case 'strategist': return <Sparkles {...props} />;
    case 'attachment': return <MessageSquare {...props} />;
    case 'boundary': return <Shield {...props} />;
    case 'mirror': return <Compass {...props} style={{ transform: 'rotate(180deg)' }} />;
    default: return <Brain {...props} />;
  }
}
