export type RelationshipType = 'romantic' | 'friendship' | 'family' | 'work' | 'other';

export interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  description: string;
  longDescription: string;
  focusAreas: string[];
  suggestions?: string[];
}

export type ThinkingStatus = 'idle' | 'processing' | 'reasoning' | 'responding' | 'complete' | 'stopped';

export type GenerationStatus = 'idle' | 'generating' | 'stopped' | 'complete';

export interface AgentState {
  agentId: string;
  status: ThinkingStatus;
  currentThought?: string;
  thoughts?: string[];
  keyTakeaway?: string;
  preview?: string;
  fullResponse?: string;
}

export interface ConversationSession {
  id: string;
  date: string;
  relationshipType: RelationshipType;
  involved: string;
  feeling: string;
  confusion: string;
  isPattern: boolean;
  userInput: string;
  synthesis?: {
    happening: string;
    reasoning: string;
    tension: string;
    nextSteps: string[];
    tags: string[];
    patternNoticed?: string;
  };
  agentResponses: AgentState[];
  tags: string[];
  configUsed?: {
    responseLength: string;
    voiceTone: string;
    enabledAgents: string[];
    showSynthesis: boolean;
  };
}
