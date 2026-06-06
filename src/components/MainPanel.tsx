import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, ArrowRight, ArrowLeft, ChevronDown, HelpCircle, AlertTriangle, Quote, Compass, Heart, Loader2 } from 'lucide-react';
import { RelationshipType, ConversationSession, AgentState } from '../types';
import { APP_THEME } from '../constants';

interface MainPanelProps {
  activeSession?: ConversationSession;
  onAnalyze: (data: {
    relationshipType: RelationshipType;
    involved: string;
    feeling: string;
    confusion: string;
    isPattern: boolean;
    userInput: string;
  }) => void;
  onStopAnalysis?: () => void;
  isAnalyzing: boolean;
  generationStatus?: 'idle' | 'generating' | 'stopped' | 'complete';
  agentStates: AgentState[];
  sessions: ConversationSession[];
  appConfig: {
    responseLength: string;
    voiceTone: string;
    enabledAgents: string[];
    showSynthesis: boolean;
  };
  forceInputMode?: boolean;
  injectedUserInput?: string | null;
  onInputModeHandled?: () => void;
}

export default function MainPanel({ 
  activeSession, 
  onAnalyze, 
  onStopAnalysis,
  isAnalyzing, 
  generationStatus = 'idle',
  agentStates, 
  sessions, 
  appConfig,
  forceInputMode,
  injectedUserInput,
  onInputModeHandled
}: MainPanelProps) {
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('romantic');
  const [involved, setInvolved] = useState('');
  const [feeling, setFeeling] = useState('');
  const [confusion, setConfusion] = useState('');
  const [isPattern, setIsPattern] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isInputState, setIsInputState] = useState(false);
  const [selectedScenarioName, setSelectedScenarioName] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Clear state when switching to "New Reflection"
  React.useEffect(() => {
    if (!activeSession) {
      setUserInput('');
      setInvolved('');
      setFeeling('');
      setConfusion('');
      setIsPattern(false);
      setIsInputState(false);
      setHasInteracted(false);
      setSelectedScenarioName(null);
    }
  }, [activeSession]);

  React.useEffect(() => {
    if (injectedUserInput) {
      setUserInput(injectedUserInput);
      setHasInteracted(true);
      if (forceInputMode) {
        setIsInputState(true);
      }
      onInputModeHandled?.();
    } else if (forceInputMode) {
      setIsInputState(true);
      onInputModeHandled?.();
    }
  }, [forceInputMode, injectedUserInput, onInputModeHandled]);

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    onAnalyze({
      relationshipType,
      involved,
      feeling,
      confusion,
      isPattern,
      userInput
    });
    setIsInputState(false);
  };

  const DEMO_SCENARIOS = [
    {
      title: "One-sided dynamic",
      text: "I feel like I always give more in my relationship than I receive. I’m the one who initiates plans and checks in, but I don’t feel that same effort coming back. I want to understand if I’m overextending or if we’re just in different places.",
      type: "romantic",
      involved: "My partner",
      feeling: "Drained, undervalued",
      tension: "Asymmetric effort"
    },
    {
      title: "Communication gap",
      text: "My partner doesn’t communicate clearly and it frustrates me. Whenever I bring up something important, they shut down or give short answers. It makes me feel like I’m talking to a wall.",
      type: "romantic",
      involved: "My partner",
      feeling: "Frustrated, lonely",
      tension: "Silence vs. confrontation"
    },
    {
      title: "Friendship crossroads",
      text: "I don’t know if I should stay in this friendship anymore. We’ve been friends for years, but lately I feel like I’ve outgrown the dynamic. Every time we hang out, I leave feeling exhausted rather than energized.",
      type: "friendship",
      involved: "A close friend",
      feeling: "Guilty, tired",
      tension: "Loyalty vs. growth"
    },
    {
      title: "Boundary struggle",
      text: "I feel guilty saying no to people even when I’m overwhelmed. I usually agree to help, but then I feel drained or resentful afterward. I want to understand why setting limits feels so hard for me.",
      type: "other",
      involved: "People in my life",
      feeling: "Guilty, overwhelmed",
      tension: "Saying no feels selfish"
    },
    {
      title: "Post-conflict distance",
      text: "We had a fight and now things feel distant and awkward. We usually resolve things fast, but this time feels different. Neither of us knows how to break the ice without restarting the argument.",
      type: "romantic",
      involved: "My partner",
      feeling: "Anxious, disconnected",
      tension: "Fear of re-triggering"
    }
  ];

  const handleScenarioClick = (scenario: typeof DEMO_SCENARIOS[0]) => {
    setRelationshipType(scenario.type as RelationshipType);
    setInvolved(scenario.involved);
    setUserInput(scenario.text);
    setFeeling(scenario.feeling);
    setConfusion(scenario.tension);
    setSelectedScenarioName(scenario.title);
    setIsInputState(true);
    setHasInteracted(true);
  };

  const EXAMPLE_PROMPTS = [
    "I feel like I’m putting in more effort than the other person…",
    "I don’t know if I’m overthinking or something is actually off…",
    "I feel guilty saying no, even when I’m overwhelmed…"
  ];

  const activeAgentCount = appConfig.enabledAgents.length;
  const isEmpty = !activeSession && !isAnalyzing && !isInputState;
  
  const completeCount = agentStates.filter(s => s.status === 'complete').length;
  const statusLabel = generationStatus === 'generating' 
    ? (completeCount < activeAgentCount ? 'Agents are reflecting...' : 'Finalizing synthesis...')
    : generationStatus === 'stopped' ? 'Reflection stopped' : activeSession?.synthesis ? `${activeAgentCount} perspectives ready` : activeSession ? `${activeAgentCount} Responses Ready` : 'System Ready';

  const showSynthesis = appConfig.showSynthesis && activeSession?.synthesis;

  return (
    <main className={`flex-1 overflow-y-auto custom-scrollbar relative bg-[#FAF9F7] flex flex-col`}>
      <header className="flex items-center justify-between border-stone-100 border-b px-8 py-3 shrink-0">
        <div className="flex gap-2">
          <span className="rounded-full border border-stone-100 px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50/50">Reflection Synthesis</span>
          {activeSession && (
            <span className="rounded-full border border-stone-100 bg-stone-50/50 px-3 py-1 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
              {activeSession.relationshipType}
            </span>
          )}
          {activeSession?.isPattern && (
            <span className="rounded-full border border-vermilion/10 bg-vermilion/[0.03] px-3 py-1 text-[10px] font-bold text-vermilion uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={10} className="fill-vermilion/10" /> Recurring Pattern
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAnalyzing && (
            <Loader2 size={12} className="animate-spin text-stone-300" />
          )}
          <span className="text-[10px] text-warm-gray font-bold uppercase tracking-widest transition-all">
            {statusLabel}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto py-6 px-8 min-h-full flex flex-col pb-40">
          {isEmpty ? (
            <div className="flex-1 flex flex-col justify-center text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <div className="w-16 h-16 bg-vermilion/5 rounded-[28px] mx-auto mb-6 flex items-center justify-center">
                  <Heart className="text-vermilion fill-vermilion" size={32} />
                </div>
                <h2 className="text-[32px] md:text-[38px] font-bold tracking-tight mb-4 text-charcoal leading-tight">
                  Gain clarity in your relationships
                </h2>
                <p className="text-warm-gray text-[17px] mb-8 leading-relaxed font-normal">
                  A calm multi-agent reflection system that helps you see your situation through 7 distinct lenses.
                </p>
                <button 
                  onClick={() => setIsInputState(true)}
                  className="bg-vermilion text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-vermilion/90 transition-all active:scale-95 border border-vermilion/10"
                >
                  Start a Reflection
                </button>

                <div className="mt-12 space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-300">Not sure where to start? Try a scenario</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {DEMO_SCENARIOS.map((s) => (
                      <button
                        key={s.title}
                        onClick={() => handleScenarioClick(s)}
                        className="px-4 py-2 rounded-full border border-stone-100 bg-white text-[11px] font-medium text-stone-500 hover:border-vermilion/30 hover:text-vermilion hover:bg-vermilion/5 transition-all active:scale-95"
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : isInputState ? (
            <div className="flex-1 flex flex-col pt-0">
              <AnimatePresence mode="wait">
                {!hasInteracted ? (
                  <motion.div
                    key="guided-state"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="flex-1 lg:max-w-xl mx-auto flex flex-col justify-center py-20"
                  >
                    <div className="space-y-4 mb-16 text-center">
                       <h2 className="text-[24px] font-bold text-charcoal tracking-tight">Start with what feels closest to your situation</h2>
                       <p className="text-[14px] text-stone-400 font-medium">Select a common scenario or begin typing below</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-16">
                      {DEMO_SCENARIOS.map((s) => (
                        <button
                          key={s.title}
                          onClick={() => handleScenarioClick(s)}
                          className="px-6 py-2.5 rounded-full border border-stone-100 bg-white text-[11px] font-bold text-stone-400 uppercase tracking-widest hover:border-vermilion/30 hover:text-vermilion hover:bg-vermilion/[0.02] transition-all active:scale-95 cursor-pointer"
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-10">
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-stone-100"></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-300">Or begin with a feeling</p>
                        <div className="h-[1px] flex-1 bg-stone-100"></div>
                      </div>
                      
                      <div className="grid gap-3">
                        {EXAMPLE_PROMPTS.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setUserInput(prompt);
                              setHasInteracted(true);
                            }}
                            className="w-full p-8 text-left rounded-[32px] bg-white border border-stone-100/60 hover:border-vermilion/30 transition-all group active:scale-[0.99] cursor-pointer"
                          >
                            <p className="text-[18px] text-stone-400 group-hover:text-charcoal transition-colors italic leading-relaxed">"{prompt}"</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="session-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="mb-8 flex items-center justify-between">
                       <button 
                        onClick={() => {
                          setHasInteracted(false);
                          setSelectedScenarioName(null);
                        }}
                        className="group flex items-center gap-2 py-2 px-4 -ml-4 rounded-full text-[10px] font-bold text-stone-300 hover:text-stone-500 hover:bg-stone-50 transition-all uppercase tracking-widest"
                      >
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        Back to suggestions
                      </button>
                    </div>

                    <SessionForm 
                      relationshipType={relationshipType}
                      setRelationshipType={setRelationshipType}
                      involved={involved}
                      setInvolved={setInvolved}
                      feeling={feeling}
                      setFeeling={setFeeling}
                      confusion={confusion}
                      setConfusion={setConfusion}
                      isPattern={isPattern}
                      setIsPattern={setIsPattern}
                      userInput={userInput}
                      setUserInput={setUserInput}
                      onSubmit={handleSubmit}
                      isAnalyzing={isAnalyzing}
                      onScenarioClick={handleScenarioClick}
                      scenarios={DEMO_SCENARIOS}
                      selectedScenarioName={selectedScenarioName}
                      setSelectedScenarioName={setSelectedScenarioName}
                      activeAgentCount={activeAgentCount}
                      hasInteracted={hasInteracted}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 flex flex-col pt-4">
              <AnimatePresence mode="popLayout">
                {activeSession && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12 pb-24"
                  >
                    <div className="space-y-4">
                      <h2 className="text-[10px] font-bold text-warm-gray uppercase tracking-widest">Your Journal Entry</h2>
                      <div className="relative rounded-[28px] bg-stone-50/30 p-8 text-stone-600 leading-relaxed text-[17px] italic border border-stone-100/50">
                        <Quote className="absolute top-4 left-4 text-stone-100" size={32} />
                        <div className="relative z-10 px-4">
                          "{activeSession.userInput}"
                        </div>
                      </div>
                    </div>

                    {!activeSession.synthesis && isAnalyzing ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative border-l border-stone-100 pl-6 space-y-6"
                      >
                        <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-stone-200 animate-ping"></div>
                        <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-stone-200"></div>
                        
                        <div className="space-y-1">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            {completeCount < activeAgentCount ? `Reading across ${activeAgentCount} lenses...` : 'Finalizing Synthesis...'}
                          </h3>
                          <p className="text-warm-gray text-xs">
                            {completeCount < activeAgentCount 
                              ? `Waiting for all ${activeAgentCount} responses to resolve before synthesizing.` 
                              : 'Distilling insights across all completed perspectives.'}
                          </p>
                        </div>

                        <div className="space-y-4 animate-pulse">
                          <div className="h-3 w-full rounded-full bg-stone-100"></div>
                          <div className="h-3 w-2/3 rounded-full bg-stone-100"></div>
                          <div className="h-3 w-4/5 rounded-full bg-stone-100"></div>
                        </div>
                      </motion.div>
                    ) : showSynthesis ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative border-l border-stone-100 pl-8"
                      >
                        <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-stone-200"></div>
                        <div className="space-y-10 pb-20">
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">What’s happening</h3>
                            <p className="text-charcoal text-[20px] leading-relaxed font-semibold tracking-tight">
                              {activeSession.synthesis.happening}
                            </p>
                          </div>

                          <div className="grid gap-10">
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Why it might be happening</p>
                              <p className="text-stone-600 leading-relaxed text-[16px] font-normal">
                                {activeSession.synthesis.reasoning}
                              </p>
                            </div>
  
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Key tension</p>
                              <div className="bg-stone-50 rounded-[24px] p-8 border border-black/[0.04] italic text-stone-600 leading-relaxed text-[16px]">
                                {activeSession.synthesis.tension}
                              </div>
                            </div>
                          </div>
  
                          <div className="space-y-6">
                             <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">What you can do next</p>
                             <ul className="space-y-4">
                              {activeSession.synthesis.nextSteps.map((step, i) => (
                                <li key={i} className="flex gap-4 group items-start">
                                  <div className="w-5 h-5 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-1">
                                    <ArrowRight size={10} className="text-stone-400" />
                                  </div>
                                  <p className="text-charcoal text-[16px] group-hover:text-stone-900 transition-colors leading-relaxed font-medium">
                                    {step}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {activeSession.isPattern && activeSession.synthesis.patternNoticed && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-3 p-1 rounded-[30px] bg-gradient-to-br from-vermilion/5 via-transparent to-transparent"
                            >
                              <div className="p-7 bg-white rounded-[28px] border border-vermilion/10 space-y-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-vermilion/10 flex items-center justify-center">
                                    <Sparkles size={12} className="text-vermilion" />
                                  </div>
                                  <p className="text-[10px] font-bold text-vermilion uppercase tracking-widest">Pattern Noticed</p>
                                </div>
                                <p className="text-stone-600 leading-relaxed text-[16px]">
                                  {activeSession.synthesis.patternNoticed}
                                </p>
                              </div>
                            </motion.div>
                          )}

                          <div className="space-y-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Suggested follow-ups</p>
                            <div className="flex flex-wrap gap-2.5">
                              {["What should I do next?", "What pattern is repeating?", "How do I bring this up?"].map(chip => (
                                <button 
                                  key={chip}
                                  onClick={() => {
                                    setUserInput(chip);
                                    setHasInteracted(true);
                                  }}
                                  className="text-[11px] font-bold text-stone-500 bg-white border border-stone-100 px-5 py-2.5 rounded-2xl hover:border-vermilion/40 hover:text-vermilion hover:bg-vermilion/[0.02] transition-all active:scale-95 cursor-pointer"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="pt-10 border-t border-stone-100">
                             <p className="text-stone-400 text-xs italic font-light">
                               This synthesis is a starting point for your own reflection. You decide which pathways to explore.
                             </p>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {(isInputState || (activeSession && generationStatus === 'complete') || isAnalyzing) && (
        <div className="sticky bottom-6 left-0 w-full px-8 z-20 pb-4">
          <div className={`max-w-2xl mx-auto flex items-center gap-3 rounded-full bg-white px-5 py-3 border border-black/[0.08] transition-all ${isAnalyzing ? 'opacity-80' : ''}`}>
            <input
              type="text"
              disabled={isAnalyzing}
              placeholder={isInputState ? "Tell me what’s on your mind…" : "Ask a follow-up question..."}
              className="flex-1 bg-transparent text-[14px] focus:outline-none text-charcoal px-2 disabled:cursor-not-allowed"
              onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleSubmit()}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (e.target.value.length > 0 && !hasInteracted) {
                  setHasInteracted(true);
                }
              }}
            />
            <button className="rounded-full p-2 text-warm-gray hover:bg-stone-100 transition-colors disabled:opacity-30" disabled={isAnalyzing}>
              <Mic size={16} />
            </button>
            <button 
              onClick={isAnalyzing ? onStopAnalysis : handleSubmit}
              disabled={!userInput.trim() && !isAnalyzing}
              className={`rounded-full px-6 py-2 text-[11px] font-bold text-white transition-all active:scale-95 disabled:opacity-50 tracking-widest uppercase border border-white/10 ${
                isAnalyzing ? 'bg-stone-500 hover:bg-stone-600' : 'bg-vermilion hover:bg-vermilion/90'
              }`}
            >
              {isAnalyzing ? 'Stop' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function SessionForm({
  relationshipType, setRelationshipType,
  involved, setInvolved,
  feeling, setFeeling,
  confusion, setConfusion,
  isPattern, setIsPattern,
  userInput, setUserInput,
  onSubmit, isAnalyzing, onStopAnalysis,
  onScenarioClick,
  scenarios,
  selectedScenarioName,
  setSelectedScenarioName,
  activeAgentCount,
  hasInteracted
}: any) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [hasInteracted]);

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-8 rounded-[20px] border border-black/[0.04] space-y-8"
      >
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Reflection Blueprint</p>
          {selectedScenarioName && (
             <span className="text-[10px] font-bold text-vermilion uppercase tracking-widest bg-vermilion/5 px-2 py-0.5 rounded-full border border-vermilion/10">
               {selectedScenarioName}
             </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Relationship</label>
            <div className="relative">
              <select
                value={relationshipType}
                onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
                className="w-full bg-stone-50/50 border border-stone-100/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-200 appearance-none text-charcoal font-medium transition-all"
              >
                <option value="romantic">Romantic</option>
                <option value="friendship">Friendship</option>
                <option value="family">Family</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" size={14} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Involved Party</label>
            <input
              type="text"
              placeholder="e.g. My partner"
              className="w-full bg-stone-50/50 border border-stone-100/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-200 text-charcoal placeholder:text-stone-300 font-medium transition-all"
              value={involved}
              onChange={(e) => setInvolved(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Current State</label>
            <input
              type="text"
              placeholder="How are you feeling?"
              className="w-full bg-stone-50/50 border border-stone-100/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-200 text-charcoal placeholder:text-stone-300 font-medium transition-all"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Core Tension</label>
            <input
              type="text"
              placeholder="What feels confusing?"
              className="w-full bg-stone-50/50 border border-stone-100/50 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-200 text-charcoal placeholder:text-stone-300 font-medium transition-all"
              value={confusion}
              onChange={(e) => setConfusion(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-1 pt-2">
          <input
            type="checkbox"
            id="isPattern"
            checked={isPattern}
            onChange={(e) => setIsPattern(e.target.checked)}
            className="w-4 h-4 rounded border-stone-200 text-vermilion focus:ring-vermilion/30 transition-all cursor-pointer"
          />
          <label htmlFor="isPattern" className="text-[11px] font-medium text-stone-400 select-none cursor-pointer">This situation feels like a recurring relational pattern</label>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-4">
          <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Reflection Journal</label>
        </div>
        <textarea
          ref={textareaRef}
          rows={8}
          placeholder="Expand your thoughts here..."
          className="w-full bg-white rounded-[20px] py-10 px-12 text-[18px] font-normal focus:outline-none border border-black/[0.04] resize-none leading-relaxed text-charcoal placeholder:text-stone-200 transition-all"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center pt-8 border-t border-stone-100/50">
          <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">
            {activeAgentCount} Lenses Active
          </p>
          <button
            onClick={isAnalyzing ? onStopAnalysis : onSubmit}
            disabled={!userInput.trim()}
            className={`px-12 py-3.5 rounded-full font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 flex items-center gap-3 shadow-md ${
              isAnalyzing 
                ? 'bg-stone-500 text-white hover:bg-stone-600' 
                : 'bg-vermilion text-white hover:bg-vermilion/90 shadow-vermilion/10'
            } disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Stop Analysis
              </>
            ) : (
              <>
                Start Reflection
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
