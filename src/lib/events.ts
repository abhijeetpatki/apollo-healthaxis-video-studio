/**
 * Clinical "tool-call" timeline events.
 *
 * In a real deployment these fire from Gemini function-calls wired to the
 * hospital systems (HIS/EHR/CRM/WhatsApp). In this studio they are triggered
 * from transcript keywords and session lifecycle so the timeline reflects what
 * the consultation is actually doing, per persona.
 */
import type { PersonaId } from "./personas";

export type IntegrationChannel =
  | "HIS"
  | "EHR"
  | "CareHub"
  | "CRM"
  | "WhatsApp";

export interface ClinicalEvent {
  id: string;
  label: string;
  detail: string;
  channel: IntegrationChannel;
}

export const CHANNEL_META: Record<
  IntegrationChannel,
  { name: string; tone: "navy" | "accent" | "cyan" | "ok" }
> = {
  HIS: { name: "Hospital HIS", tone: "navy" },
  EHR: { name: "EHR Notes", tone: "cyan" },
  CareHub: { name: "Care Coordination Hub", tone: "accent" },
  CRM: { name: "CRM", tone: "ok" },
  WhatsApp: { name: "SMS & WhatsApp", tone: "ok" },
};

/** Event fired as soon as a session verifies the patient. */
export const VERIFY_EVENT: ClinicalEvent = {
  id: "his-match",
  label: "HIS Matched",
  detail: "Patient record verified against Hospital HIS",
  channel: "HIS",
};

/**
 * Keyword -> event rules, evaluated against the running transcript.
 * First matching rule (not already fired) wins per transcript chunk.
 */
interface EventRule {
  match: RegExp;
  event: ClinicalEvent;
  personas?: PersonaId[];
}

export const EVENT_RULES: EventRule[] = [
  {
    match: /\b(breath|breathe|grounding|5-4-3-2-1|inhale|exhale)\b/i,
    event: {
      id: "grounding",
      label: "Grounding Exercise Started",
      detail: "Guided breathing / 5-4-3-2-1 logged to session",
      channel: "EHR",
    },
    personas: ["counsellor"],
  },
  {
    match: /\b(reframe|thought|cognitive|cbt|evidence for)\b/i,
    event: {
      id: "cbt-summary",
      label: "CBT Summary Logged",
      detail: "Thought record & reframing added to EHR notes",
      channel: "EHR",
    },
    personas: ["counsellor"],
  },
  {
    match: /\b(sleep|insomnia|mood|anxiety|stress)\b/i,
    event: {
      id: "mood-triage",
      label: "Mood Triage Captured",
      detail: "PHQ-style check-in scored and stored",
      channel: "EHR",
    },
    personas: ["counsellor"],
  },
  {
    match: /\b(meal|plate|lunch|dinner|breakfast|food|eating)\b/i,
    event: {
      id: "meal-seen",
      label: "Meal Analysed on Camera",
      detail: "Visual portion & macro estimate captured",
      channel: "EHR",
    },
    personas: ["dietician"],
  },
  {
    match: /\b(label|nutrition facts|per 100g|calories|carbs|protein)\b/i,
    event: {
      id: "label-read",
      label: "Nutrition Label Read",
      detail: "Packaged-food label parsed from camera frame",
      channel: "EHR",
    },
    personas: ["dietician"],
  },
  {
    match: /\b(glucose|glucometer|sugar|cgm|hba1c|reading|mg\/dl)\b/i,
    event: {
      id: "glucose-logged",
      label: "Glucose Reading Logged",
      detail: "Glucometer value recorded to metabolic chart",
      channel: "HIS",
    },
    personas: ["dietician"],
  },
  {
    match: /\b(diet chart|meal plan|plan|swap|recipe)\b/i,
    event: {
      id: "diet-chart",
      label: "Diet Chart Generated",
      detail: "Personalised therapeutic diet chart created",
      channel: "EHR",
    },
    personas: ["dietician"],
  },
  {
    match: /\b(posture|gait|stand|walk|movement|move|range of motion|bend)\b/i,
    event: {
      id: "movement-assessed",
      label: "Movement Assessed on Camera",
      detail: "Posture / range-of-motion reviewed from camera",
      channel: "EHR",
    },
    personas: ["physiotherapist"],
  },
  {
    match: /\b(exercise|rehab|stretch|strengthen|mobility|reps|sets|hold)\b/i,
    event: {
      id: "rehab-plan",
      label: "Rehab Plan Updated",
      detail: "Home exercise program generated for the patient",
      channel: "EHR",
    },
    personas: ["physiotherapist"],
  },
  {
    match: /\b(escalat|psychiatrist|doctor|clinician|emergency|urgent|crisis)\b/i,
    event: {
      id: "care-hub",
      label: "Care Hub Notified",
      detail: "Human clinician looped in with full context",
      channel: "CareHub",
    },
  },
  {
    match: /\b(follow.?up|whatsapp|message|summary|remind|appointment)\b/i,
    event: {
      id: "whatsapp",
      label: "WhatsApp Follow-up Sent",
      detail: "Visit summary & next steps delivered to patient",
      channel: "WhatsApp",
    },
  },
];
