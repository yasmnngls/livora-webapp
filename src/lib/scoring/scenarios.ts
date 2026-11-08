import type { CategoryId } from "@/lib/types";

export interface ScenarioOption {
  text: string;
  /** Behaviour signal on the category's 0..4 scale. */
  value: number;
}

export interface Scenario {
  id: string;
  category: CategoryId;
  prompt: string;
  options: ScenarioOption[];
}

// Eight Living Simulation scenarios. The concept note names two (an unannounced
// overnight guest, an unpaid shared bill); the other six are drafts to review.
export const SCENARIOS: Scenario[] = [
  {
    id: "overnight-guest",
    category: "privacy",
    prompt: "Your roommate's friend shows up at 11pm and asks to stay the night. Nobody told you. What do you do?",
    options: [
      { text: "It's fine, the more the merrier.", value: 0 },
      { text: "Let it go tonight, mention it tomorrow.", value: 2 },
      { text: "Ask your roommate to talk outside first.", value: 3 },
      { text: "Say no. Guests need notice.", value: 4 },
    ],
  },
  {
    id: "unpaid-bill",
    category: "responsibilities",
    prompt: "The electric bill is due tomorrow and your roommate hasn't paid their half. What do you do?",
    options: [
      { text: "Pay it all and forget about it.", value: 0 },
      { text: "Pay it and remind them later.", value: 1 },
      { text: "Message them now and agree on a date.", value: 3 },
      { text: "Suggest a written bill schedule from now on.", value: 4 },
    ],
  },
  {
    id: "exam-week",
    category: "noise",
    prompt: "It's your exam week and your roommate is on a video call at midnight. What do you do?",
    options: [
      { text: "Put on earphones, it's fine.", value: 4 },
      { text: "Study elsewhere tonight.", value: 3 },
      { text: "Ask them to keep it down.", value: 1 },
      { text: "Agree on quiet hours for the whole week.", value: 0 },
    ],
  },
  {
    id: "dishes",
    category: "cleanliness",
    prompt: "Dishes have been in the sink for two days. They aren't yours. What do you do?",
    options: [
      { text: "Leave them, they'll get to it.", value: 0 },
      { text: "Wash them this once.", value: 1 },
      { text: "Remind your roommate today.", value: 3 },
      { text: "Propose a same-day dishes rule.", value: 4 },
    ],
  },
  {
    id: "late-night",
    category: "sleep",
    prompt: "Your roommate turns on the main light at 1am while you're asleep. How do you feel about it?",
    options: [
      { text: "Wouldn't notice, I'm usually up then.", value: 4 },
      { text: "Mild annoyance, it happens.", value: 3 },
      { text: "Ask them to use a lamp.", value: 1 },
      { text: "Lights-out time should be agreed.", value: 0 },
    ],
  },
  {
    id: "aircon",
    category: "temperature",
    prompt: "You get home and the aircon is set to 18°C. What do you do?",
    options: [
      { text: "Perfect, leave it.", value: 0 },
      { text: "Bump it to 22°C or so.", value: 1 },
      { text: "Switch to the fan.", value: 3 },
      { text: "Turn it off and open a window.", value: 4 },
    ],
  },
  {
    id: "weekend-hangout",
    category: "social",
    prompt: "Your roommate invites you to a small get-together at home on Saturday. What do you do?",
    options: [
      { text: "Skip it and stay in my space.", value: 0 },
      { text: "Say hi, then head out.", value: 1 },
      { text: "Join for a bit.", value: 3 },
      { text: "Join and offer to host the next one.", value: 4 },
    ],
  },
  {
    id: "shared-food",
    category: "food",
    prompt: "Your roommate eats the leftovers you labelled in the fridge. What do you do?",
    options: [
      { text: "Don't mind, food is for sharing.", value: 4 },
      { text: "Laugh it off this time.", value: 3 },
      { text: "Ask them to replace it.", value: 1 },
      { text: "Agree on a no-sharing shelf.", value: 0 },
    ],
  },
];
