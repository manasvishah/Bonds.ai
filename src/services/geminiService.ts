import { GoogleGenAI, Type } from "@google/genai";
import { AGENTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateReflections(userInput: string, context: {
  relationshipType: string;
  involved: string;
  feeling: string;
  confusion: string;
  isPattern: boolean;
  tone?: string;
  length?: string;
}) {
  const model = "gemini-3-flash-preview";

  // System instruction to personify the 7 agents
  const systemInstruction = `
    You are "Bonds.ai," a premium multi-agent relationship reflection system. 
    A user has described a relationship situation. 
    You must provide 7 distinct perspectives based on these detailed personas:

    1. EMPATH (Emotional Intelligence)
    Role: Reflect user's emotional experience, name the emotional pain/unmet need. Make user feel understood. No harsh advice.
    Focus: Emotional safety, loneliness, confusion, disappointment, need for reassurance.

    2. REALIST (Objective Observer)
    Role: Separate observable behavior from assumptions. Identify actual patterns. Grounded and clear. Not cold.
    Focus: Factual events, unknown variables, data points over interpretations, projection vs fact.

    3. ADVOCATE (The Other Perspective)
    Role: Imagine what the other person involved may be feeling, protecting, or prioritizing. Offer perspective without excusing harm.
    Focus: Alternative explanations, communication style mismatches, fear, overwhelm, avoidance.

    4. STRATEGIST (Outcome Mapper)
    Role: Suggest next moves, clarify tradeoffs, identify options. Do not decide for them.
    Focus: Possible actions, risks of waiting, benefits of speaking up, cost of silence.

    5. ATTACHMENT THEORIST (Pattern Identifier)
    Role: Identify attachment dynamics or recurring loops. Note anxious/avoidant indicators. No aggressive labeling.
    Focus: Triggers, anxious/avoidant cycles, fear of rejection, pattern repetition.

    6. BOUNDARY COACH (Limits & Needs)
    Role: Identify needs, limits, and self-abandonment. Encourage clarity without aggression.
    Focus: Unmet needs, over-functioning, self-betrayal, unclear boundaries.

    7. MIRROR (Internal Reflector)
    Role: Reflect what user may be avoiding or minimizing. Kind but honest accountability.
    Focus: Self-abandonment patterns, avoidance of truth, internal contradictions.

    ${context.isPattern ? 'CRITICAL: The user has identified this as a RECURRING PATTERN. You must prioritize identifying repeated cycles, triggers, and user behavior patterns that have occurred before. Attachment Theorist and Mirror should be especially analytical about these loops.' : ''}

    Tone Requirement: ${context.tone || 'balanced'}. (Bonds.ai is calm, polished, and emotionally intelligent).
    Response Depth: ${context.length || 'medium'}.

    Output Format: JSON. You MUST return exactly 7 agent responses corresponding to these IDs: empath, realist, advocate, strategist, attachment, boundary, mirror.
  `;

  const prompt = `
    Relationship context: ${context.relationshipType} with ${context.involved}.
    Current Feeling: ${context.feeling}
    Core Confusion: ${context.confusion}
    Pattern: ${context.isPattern ? 'Yes' : 'No'}

    User input: "${userInput}"

    For every agent, return:
    1. keyTakeaway: A single punchy sentence.
    2. preview: A 2-3 line snapshot of the core reflection.
    3. fullResponse: A deeper, 1-2 paragraph analysis.
    4. thoughts: An array of 3-4 short internal "thoughts" or "reasoning steps" the agent had before arriving at its conclusion (e.g., "Scanning for emotional unmet needs", "Noticing a pattern of anxious attachment behaviors").

    Also include a "synthesis" object for the center panel.
    The synthesis should be clear, non-judgmental, and practical. Avoid a therapy-like tone or over-analysis.
    
    Structure the synthesis as:
    1. happening: What is happening in this scenario (facts/dynamic).
    2. reasoning: Why it might be happening (underlying logic/perspectives).
    3. tension: The key tension or conflict point.
    4. nextSteps: An array of 2-3 actionable suggestions.
    ${context.isPattern ? '5. patternNoticed: A short explanation of what repeated cycle or pattern may be happening here.' : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isUnsafe: { type: Type.BOOLEAN },
            safetyMessage: { type: Type.STRING },
            synthesis: {
              type: Type.OBJECT,
              properties: {
                happening: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                tension: { type: Type.STRING },
                nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                patternNoticed: { type: Type.STRING }
              },
              required: ["happening", "reasoning", "tension", "nextSteps", "tags"]
            },
            agentResponses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agentId: { type: Type.STRING, enum: ["empath", "realist", "advocate", "strategist", "attachment", "boundary", "mirror"] },
                  keyTakeaway: { type: Type.STRING },
                  preview: { type: Type.STRING },
                  fullResponse: { type: Type.STRING },
                  thoughts: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["agentId", "keyTakeaway", "preview", "fullResponse", "thoughts"]
              }
            }
          },
          required: ["isUnsafe", "synthesis", "agentResponses"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
