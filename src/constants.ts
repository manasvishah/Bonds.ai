import { Agent } from './types';

export const AGENTS: Agent[] = [
  {
    id: 'empath',
    name: 'Empath',
    role: 'Emotional Intelligence',
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    description: 'Understands what you’re feeling beneath the surface.',
    longDescription: 'Expert in identifying unmet emotional needs and providing validation for complex inner experiences.',
    focusAreas: ['Emotions', 'Unmet needs', 'Emotional safety', 'Validation'],
    suggestions: ['What am I really feeling?', 'What do I need emotionally?', 'Why does this hurt so much?']
  },
  {
    id: 'realist',
    name: 'Realist',
    role: 'Objective Observer',
    color: 'bg-slate-50 border-slate-200 text-slate-700',
    description: 'Separates facts from assumptions clearly.',
    longDescription: 'Specializes in separating observable behavior from emotional interpretation to clarify what is actually happening.',
    focusAreas: ['Facts', 'Inconsistencies', 'Literal actions', 'Observable patterns'],
    suggestions: ['What are the facts here?', 'What am I assuming?', 'What pattern should I notice?']
  },
  {
    id: 'advocate',
    name: 'Advocate',
    role: 'The Other Perspective',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    description: 'Explores how the other person may see this.',
    longDescription: 'Bridges communication gaps by identifying possible intentions and fears driving the other person\'s behavior.',
    focusAreas: ['Motivations', 'Communication styles', 'Positive intent', 'Perspectives'],
    suggestions: ['How might they see this?', 'What else could explain this?', 'What am I not considering?']
  },
  {
    id: 'strategist',
    name: 'Strategist',
    role: 'Outcome Mapper',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    description: 'Maps what you can do next, without deciding for you.',
    longDescription: 'Strategic advisor focused on long-term outcomes, trade-offs, and actionable communication steps.',
    focusAreas: ['Possible outcomes', 'Trade-offs', 'Next steps', 'Contingencies'],
    suggestions: ['What can I do next?', 'How should I bring this up?', 'What are my options?']
  },
  {
    id: 'attachment',
    name: 'Attachment Theorist',
    role: 'Pattern Identifier',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    description: 'Identifies recurring emotional patterns driving this.',
    longDescription: 'Uses attachment psychology to identify recurring cycles of intimacy, distance, and security.',
    focusAreas: ['Patterns', 'Attachment styles', 'Triggers', 'Relational safety'],
    suggestions: ['Why does this trigger me?', 'What pattern is this?', 'How can I respond securely?']
  },
  {
    id: 'boundary',
    name: 'Boundary Coach',
    role: 'Self-Protective Guide',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    description: 'Helps protect your energy.',
    longDescription: 'Dedicated to helping you maintain high self-respect and clear boundaries within your most important relationships.',
    focusAreas: ['Violations', 'Limits', 'Personal space', 'Self-respect'],
    suggestions: ['What boundary is needed?', 'How do I say this clearly?', 'Where am I overgiving?']
  },
  {
    id: 'mirror',
    name: 'Mirror',
    role: 'Internal Reflector',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    description: 'Reflects what you may be avoiding.',
    longDescription: 'A pure reflection of your own stated values and logic, highlighting internal contradictions and strengths.',
    focusAreas: ['Values', 'Self-consistency', 'Internal voice', 'Minimizations'],
    suggestions: ['What am I avoiding?', 'What am I repeating?', 'What truth am I minimizing?']
  }
];

export const APP_THEME = {
  bg: 'bg-[#FAF9F7]',
  panelBg: 'bg-white',
  text: 'text-[#1C1917]', // Deep charcoal/Stone-900
  accent: 'text-[#AF3A3A]', // Vermilion/Deep Red
  accentBg: 'bg-[#AF3A3A]',
  accentLight: 'bg-[#AF3A3A]/5',
  border: 'border-stone-200/60',
  secondaryText: 'text-stone-600',
  mutedText: 'text-stone-400',
  brand: 'Bonds.ai'
};
