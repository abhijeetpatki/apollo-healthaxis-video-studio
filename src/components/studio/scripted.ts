import type { PersonaId } from "@/lib/personas";
import type { ClinicalEvent } from "@/lib/events";

export interface ScriptLine {
  role: "patient" | "specialist";
  text: string;
  /** optional event fired as this line lands */
  event?: ClinicalEvent;
}

/**
 * Canned, clearly-labelled "scripted preview" so visitors without credentials
 * still experience the flow. This never touches the API.
 */
export const SCRIPTS: Record<PersonaId, ScriptLine[]> = {
  counsellor: [
    {
      role: "specialist",
      text: "Hello, I'm Dr. Aarav Mehta from Apollo HealthAxis. I'm really glad you made time today. How have you been feeling this week?",
    },
    {
      role: "patient",
      text: "Honestly, pretty anxious. I can't seem to switch off at night.",
      event: {
        id: "mood-triage",
        label: "Mood Triage Captured",
        detail: "PHQ-style check-in scored and stored",
        channel: "EHR",
      },
    },
    {
      role: "specialist",
      text: "That sounds exhausting, and it's really common. Let's try something together — a short grounding exercise. Can we start with a slow breath in for four counts?",
      event: {
        id: "grounding",
        label: "Grounding Exercise Started",
        detail: "Guided breathing / 5-4-3-2-1 logged to session",
        channel: "EHR",
      },
    },
    {
      role: "patient",
      text: "Okay... that actually helped a little. My thoughts just spiral though.",
    },
    {
      role: "specialist",
      text: "Let's gently reframe one of those thoughts. What's the loudest one right now, and what's the evidence for and against it?",
      event: {
        id: "cbt-summary",
        label: "CBT Summary Logged",
        detail: "Thought record & reframing added to EHR notes",
        channel: "EHR",
      },
    },
    {
      role: "specialist",
      text: "You've done good work today. I'll send a short summary and two sleep-wind-down steps to your WhatsApp, and we can check in next week.",
      event: {
        id: "whatsapp",
        label: "WhatsApp Follow-up Sent",
        detail: "Visit summary & next steps delivered to patient",
        channel: "WhatsApp",
      },
    },
  ],
  dietician: [
    {
      role: "specialist",
      text: "Hi, I'm Dt. Ananya Sharma, clinical dietician at Apollo HealthAxis. Feel free to hold up your meal or a food label and I'll take a look.",
    },
    {
      role: "patient",
      text: "Here's my lunch — rice, dal, and some fried snacks on the side.",
      event: {
        id: "meal-seen",
        label: "Meal Analysed on Camera",
        detail: "Visual portion & macro estimate captured",
        channel: "EHR",
      },
    },
    {
      role: "specialist",
      text: "I can see it clearly. The dal and rice are great — I'd halve the fried portion and add a cucumber-tomato side to slow the sugar response.",
    },
    {
      role: "patient",
      text: "My glucometer read 180 after breakfast today.",
      event: {
        id: "glucose-logged",
        label: "Glucose Reading Logged",
        detail: "Glucometer value recorded to metabolic chart",
        channel: "HIS",
      },
    },
    {
      role: "specialist",
      text: "180 post-meal is a little high. Let's shift to a protein-first plate order and a 10-minute walk after eating. I'll build you a chart.",
      event: {
        id: "diet-chart",
        label: "Diet Chart Generated",
        detail: "Personalised therapeutic diet chart created",
        channel: "EHR",
      },
    },
    {
      role: "specialist",
      text: "Your personalised diet chart and today's swaps are on their way to your WhatsApp. Let's review your readings again on Friday.",
      event: {
        id: "whatsapp",
        label: "WhatsApp Follow-up Sent",
        detail: "Visit summary & next steps delivered to patient",
        channel: "WhatsApp",
      },
    },
  ],
  physiotherapist: [
    {
      role: "specialist",
      text: "Hi, I'm Dr. Sneha Nair, physiotherapist at Apollo HealthAxis. Tell me what's bothering you, and show me the area if you can.",
    },
    {
      role: "patient",
      text: "My lower back aches when I sit for a long time at work.",
    },
    {
      role: "specialist",
      text: "Thanks. Could you stand up and slowly bend forward for me? I'll watch how your back moves.",
      event: {
        id: "movement-assessed",
        label: "Movement Assessed on Camera",
        detail: "Posture / range-of-motion reviewed from camera",
        channel: "EHR",
      },
    },
    {
      role: "patient",
      text: "Okay, here you go... it feels tight on the way back up.",
    },
    {
      role: "specialist",
      text: "I can see the tightness. Let's start with pelvic tilts and a cat-cow stretch — two sets of ten, twice a day. I'll build your plan.",
      event: {
        id: "rehab-plan",
        label: "Rehab Plan Updated",
        detail: "Home exercise program generated for the patient",
        channel: "EHR",
      },
    },
    {
      role: "specialist",
      text: "Your home exercise program and a short posture guide are on their way to WhatsApp. Let's reassess your movement on Friday.",
      event: {
        id: "whatsapp",
        label: "WhatsApp Follow-up Sent",
        detail: "Visit summary & next steps delivered to patient",
        channel: "WhatsApp",
      },
    },
  ],
};
