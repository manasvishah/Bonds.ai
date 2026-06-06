import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import AgentPanel from './components/AgentPanel';
import SettingsModal from './components/SettingsModal';
import Onboarding from './components/Onboarding';
import { ConversationSession, AgentState, RelationshipType, ThinkingStatus, GenerationStatus } from './types';
import { AGENTS } from './constants';
import { generateReflections } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ExternalLink, Shield } from 'lucide-react';

export default function App() {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const generationSessionIdRef = useRef<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAgentRoomOpen, setIsAgentRoomOpen] = useState(false);
  const [injectedUserInput, setInjectedUserInput] = useState<string | null>(null);

  const handleFollowUp = (agentName: string, text: string) => {
    let finalPrompt = text;
    
    if (text === 'Follow up') {
      switch (agentName) {
        case 'Empath': finalPrompt = 'Can you help me understand what feeling I might be avoiding?'; break;
        case 'Realist': finalPrompt = 'What are the facts here that I might be over-interpreting?'; break;
        case 'Advocate': finalPrompt = 'How might they see this situation differently?'; break;
        case 'Strategist': finalPrompt = 'What specific communication strategy would help me here?'; break;
        case 'Attachment Theorist': finalPrompt = 'Why does this situation trigger my attachment style so strongly?'; break;
        case 'Boundary Coach': finalPrompt = 'What is the specific boundary I need to set here?'; break;
        case 'Mirror': finalPrompt = 'What truth about myself am I minimizing in this situation?'; break;
        default: finalPrompt = 'Can you help me explore this further?';
      }
    }
    
    const followUpText = finalPrompt;
    setInjectedUserInput(followUpText);
    if (!activeSessionId) {
      setForceInputMode(true);
    }
  };

  useEffect(() => {
    // Force show onboarding every time as requested for reliability
    setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = (startReflection: boolean = false) => {
    setShowOnboarding(false);
    localStorage.setItem('bonds_onboarding_seen', 'true');
    if (startReflection) {
       // We'll pass a signal to MainPanel or just let MainPanel decide
       // For now, let's use a simple state to trigger input mode
       setForceInputMode(true);
    }
  };

  // Load sessions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bonds_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse sessions', e);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('bonds_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const [appConfig, setAppConfig] = useState({
    responseLength: 'medium' as 'short' | 'medium' | 'deep',
    voiceTone: 'balanced' as 'gentle' | 'balanced' | 'direct',
    enabledAgents: AGENTS.map(a => a.id),
    showSynthesis: true
  });
  
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    AGENTS.map(a => ({ agentId: a.id, status: 'idle' }))
  );
  const [safetyMessage, setSafetyMessage] = useState<string | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const stopAnalysis = () => {
    setGenerationStatus('stopped');
    setIsAnalyzing(false);
    generationSessionIdRef.current = null;
    
    // Set unfinished agents to 'stopped'
    setAgentStates(prev => prev.map(s => 
      s.status !== 'complete' && s.status !== 'idle' 
        ? { ...s, status: 'stopped' } 
        : s
    ));
  };

  const startAnalysis = async (data: any) => {
    setIsAnalyzing(true);
    setGenerationStatus('generating');
    setSafetyMessage(null);
    
    const sessionId = Date.now().toString();
    generationSessionIdRef.current = sessionId;
    
    // Filter agents based on settings
    const activeAgentsList = AGENTS.filter(a => appConfig.enabledAgents.includes(a.id));

    const newSession: ConversationSession = {
      id: sessionId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ...data,
      agentResponses: [],
      tags: [],
      configUsed: {
        responseLength: appConfig.responseLength,
        voiceTone: appConfig.voiceTone,
        enabledAgents: appConfig.enabledAgents,
        showSynthesis: appConfig.showSynthesis
      }
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);

    // Initial state: only active agents should be processing
    setAgentStates(AGENTS.map(a => ({
      agentId: a.id,
      status: appConfig.enabledAgents.includes(a.id) ? 'idle' : 'idle' // just initializing
    })));

    // Phase 1 & 2: Staggered thinking and conversational reactions
    const thinkingPhases = [
      { status: 'processing' as const, duration: 1500 },
      { status: 'reasoning' as const, duration: 2000 },
      { status: 'responding' as const, duration: 2500 }
    ];
    
    for (const phase of thinkingPhases) {
      if (generationSessionIdRef.current !== sessionId) return;

      await Promise.all(activeAgentsList.map(async (agent, index) => {
        // Random slight delay per agent to feel alive
        await new Promise(r => setTimeout(r, Math.random() * 1200 + (index * 150)));
        
        if (generationSessionIdRef.current !== sessionId) return;

        const thought = getRandomThought(agent.id, phase.status, index);
        setAgentStates(prev => prev.map(s => 
          s.agentId === agent.id 
            ? { 
                ...s, 
                status: phase.status, 
                currentThought: thought,
                thoughts: [...(s.thoughts || []), thought]
              } 
            : s
        ));

        // Inter-agent reaction chance (Phase 2)
        if (Math.random() > 0.6 && index > 0) {
          if (generationSessionIdRef.current !== sessionId) return;
          const prevAgentId = activeAgentsList[index - 1].id;
          const prevAgentName = AGENTS.find(a => a.id === prevAgentId)?.name;
          await new Promise(r => setTimeout(r, 800));
          if (generationSessionIdRef.current !== sessionId) return;
          const reactionThought = `I'm seeing what ${prevAgentName} mentioned... let me rethink.`;
          setAgentStates(prev => prev.map(s => 
            s.agentId === agent.id 
              ? { 
                  ...s, 
                  currentThought: reactionThought,
                  thoughts: [...(s.thoughts || []), reactionThought]
                } 
              : s
          ));
        }
      }));
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      if (generationSessionIdRef.current !== sessionId) return;

      const result = await generateReflections(data.userInput, {
        relationshipType: data.relationshipType,
        involved: data.involved,
        feeling: data.feeling,
        confusion: data.confusion,
        isPattern: data.isPattern,
        tone: appConfig.voiceTone as any,
        length: appConfig.responseLength as any
      });

      if (generationSessionIdRef.current !== sessionId) return;

      if (result.isUnsafe) {
        setSafetyMessage(result.safetyMessage || "This situation may need external support beyond reflection.");
        setIsAnalyzing(false);
        setGenerationStatus('idle');
        setAgentStates(prev => prev.map(s => ({ ...s, status: 'idle', thoughts: [] })));
        return;
      }

      // Phase 3: Reveal responses one by one
      const currentAgentStates: AgentState[] = [];

      for (const agentRes of result.agentResponses) {
        if (generationSessionIdRef.current !== sessionId) return;
        if (!appConfig.enabledAgents.includes(agentRes.agentId)) continue;
        
        await new Promise(r => setTimeout(r, Math.random() * 800 + 1000));
        if (generationSessionIdRef.current !== sessionId) return;

        let finalState: AgentState | undefined;
        setAgentStates(prev => {
          const next = prev.map(s => {
            if (s.agentId === agentRes.agentId) {
              const updated = { 
                ...s, 
                status: 'complete' as ThinkingStatus, 
                keyTakeaway: agentRes.keyTakeaway,
                preview: agentRes.preview,
                fullResponse: agentRes.fullResponse,
                thoughts: s.thoughts,
                currentThought: undefined 
              };
              finalState = updated;
              return updated;
            }
            return s;
          });
          if (finalState) currentAgentStates.push(finalState);
          return next;
        });
      }

      if (generationSessionIdRef.current !== sessionId) return;

      // Ensure we have a snapshot of all final states at this point
      const completedStates = agentStates.map(s => {
        const res = result.agentResponses.find(ar => ar.agentId === s.agentId);
        if (res && appConfig.enabledAgents.includes(s.agentId)) {
          return {
             ...s,
             status: 'complete' as ThinkingStatus,
             keyTakeaway: res.keyTakeaway,
             preview: res.preview,
             fullResponse: res.fullResponse
          };
        }
        return s;
      });

      // Phase 4: Finally update session with synthesis (triggers full display)
      setSessions(prev => prev.map(s => 
        s.id === newSession.id ? { 
          ...s, 
          synthesis: appConfig.showSynthesis ? { ...result.synthesis, tags: result.synthesis.tags } : undefined,
          tags: result.synthesis.tags,
          agentResponses: completedStates.filter(st => appConfig.enabledAgents.includes(st.agentId))
        } : s
      ));
      
      setGenerationStatus('complete');

    } catch (error) {
      console.error(error);
    } finally {
      if (generationSessionIdRef.current === sessionId) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      // Restore config if saved
      if (session.configUsed) {
        setAppConfig({
          responseLength: session.configUsed.responseLength as any,
          voiceTone: session.configUsed.voiceTone as any,
          enabledAgents: session.configUsed.enabledAgents,
          showSynthesis: session.configUsed.showSynthesis
        });
      }

      setAgentStates(AGENTS.map(a => {
        const savedRes = session.agentResponses?.find(r => r.agentId === a.id);
        return {
          agentId: a.id,
          status: savedRes ? 'complete' : 'idle',
          keyTakeaway: savedRes?.keyTakeaway,
          preview: savedRes?.preview,
          fullResponse: savedRes?.fullResponse,
          thoughts: savedRes?.thoughts || []
        } as AgentState;
      }));
    }
  };

  const [forceInputMode, setForceInputMode] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden text-charcoal font-sans bg-ivory">
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding 
            onComplete={() => handleOnboardingComplete(false)} 
            onStart={() => handleOnboardingComplete(true)}
          />
        )}
      </AnimatePresence>

      <Sidebar 
        sessions={sessions} 
        onSelectSession={handleSelectSession} 
        onNewSession={() => {
          generationSessionIdRef.current = null;
          setIsAnalyzing(false);
          setGenerationStatus('idle');
          setActiveSessionId(undefined);
          setInjectedUserInput(null);
          setAgentStates(AGENTS.map(a => ({ agentId: a.id, status: 'idle' })));
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeSessionId={activeSessionId}
        isCollapsed={isSidebarCollapsed || isAgentRoomOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-white lg:rounded-l-[32px] shadow-2xl border-l border-stone-200 lg:my-1 transition-all duration-500`}>
        <AnimatePresence>
          {safetyMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            >
              <div className="bg-white border border-vermilion/10 p-8 rounded-[28px] shadow-2xl flex items-start gap-6">
                <div className="bg-vermilion/5 p-4 rounded-2xl">
                  <Shield className="text-vermilion w-6 h-6" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-bold text-charcoal text-[20px] tracking-tight">Specialized Support Needed</h4>
                    <p className="text-warm-gray text-[15px] leading-relaxed mt-1">{safetyMessage}</p>
                  </div>
                  <div className="flex gap-3">
                    <a 
                      href="https://www.thehotline.org/" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white bg-vermilion px-6 py-3 rounded-full hover:bg-vermilion/90 transition-all shadow-md shadow-vermilion/10"
                    >
                      Bonds.ai Safety Resources <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isAgentRoomOpen && (
            <motion.div 
              key="main-panel"
              initial={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex-1 flex overflow-hidden"
            >
              <MainPanel 
                activeSession={activeSession} 
                onAnalyze={startAnalysis}
                onStopAnalysis={stopAnalysis}
                isAnalyzing={isAnalyzing}
                generationStatus={generationStatus}
                agentStates={agentStates}
                sessions={sessions}
                appConfig={appConfig}
                forceInputMode={forceInputMode}
                injectedUserInput={injectedUserInput}
                onInputModeHandled={() => {
                  setForceInputMode(false);
                  setInjectedUserInput(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <AgentPanel 
          agentStates={agentStates}
          isAnalyzing={isAnalyzing}
          appConfig={appConfig}
          isCompareMode={isAgentRoomOpen}
          setIsCompareMode={setIsAgentRoomOpen}
          onFollowUp={handleFollowUp}
        />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={appConfig}
        setConfig={setAppConfig}
      />
    </div>
  );
}

function getRandomThought(agentId: string, status: ThinkingStatus, index: number) {
  const thoughts: Record<string, string[]> = {
    empath: ["Reading emotional valence...", "Connecting to the hurt being described...", "Identifying the unmet emotional need...", "Wait, let me look at that feeling again."],
    realist: ["Parsing factual data points...", "Identifying concrete behaviors...", "Differentiating between observations and feelings...", "Separating facts from assumptions."],
    advocate: ["Modeling the second perspective...", "Simulating alternate intent...", "Searching for external stressors on the other party...", "What might the other person be feeling?"],
    strategist: ["Calculating relational power dynamics...", "Projecting short-term consequences...", "Identifying path-of-least-resistance solutions...", "There are multiple ways this could go."],
    attachment: ["Looking for secure vs anxious indicators...", "Tracing the root of the reaction cycle...", "Scanning for avoidance patterns...", "Identifying deep-seated attachment triggers."],
    boundary: ["Measuring self-respect vs compromise...", "Identifying threshold crossings...", "Refining limit-setting language...", "Checking for boundary elasticity."],
    mirror: ["Verbatim reflection forming...", "Isolating the core value being expressed...", "Structuring your own voice back to you...", "Returning your words for clarity."],
  };
  
  const phaseIndex = status === 'processing' ? 0 : status === 'reasoning' ? 1 : status === 'responding' ? 2 : 3;
  return thoughts[agentId][phaseIndex] || thoughts[agentId][0];
}
