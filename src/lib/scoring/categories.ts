import type { CategoryId } from "@/lib/types";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  question: string;
  /** Five labels for values 0..4. */
  scale: [string, string, string, string, string];
  /** Shown to both people when they differ. Must not reveal either answer. */
  friction: string;
}

// The nine Living Profile categories from the concept note.
export const CATEGORIES: CategoryDef[] = [
  {
    id: "sleep",
    label: "Sleep",
    question: "When do you usually sleep on school nights?",
    scale: ["Before 10pm", "10pm–11pm", "11pm–12am", "12am–2am", "After 2am"],
    friction: "You keep different sleep schedules.",
  },
  {
    id: "cleanliness",
    label: "Cleanliness",
    question: "How tidy do you keep shared spaces?",
    scale: ["Relaxed", "Clean up weekly", "Clean up every few days", "Clean up daily", "Spotless always"],
    friction: "You have different standards for tidiness.",
  },
  {
    id: "noise",
    label: "Noise",
    question: "How much noise are you comfortable with at home?",
    scale: ["Near silence", "Quiet", "Some background noise", "Music and calls are fine", "Loud is fine"],
    friction: "You're comfortable with different noise levels.",
  },
  {
    id: "social",
    label: "Social",
    question: "How social do you want home to be?",
    scale: ["Private retreat", "Mostly quiet", "Occasional hangouts", "Often social", "Always social"],
    friction: "You want home to be social in different ways.",
  },
  {
    id: "study",
    label: "Study",
    question: "Where and how do you study?",
    scale: ["Never at home", "Rarely at home", "Sometimes at home", "Mostly at home, quiet", "Always at home, needs silence"],
    friction: "You study at home in different ways.",
  },
  {
    id: "food",
    label: "Food",
    question: "How do you handle food and cooking?",
    scale: ["Never cook", "Rarely cook", "Cook sometimes", "Cook often", "Cook daily, happy to share"],
    friction: "You handle food and cooking differently.",
  },
  {
    id: "temperature",
    label: "Temperature",
    question: "What room temperature do you prefer?",
    scale: ["Very cold aircon", "Cool", "Fan is fine", "Warm", "No aircon or fan"],
    friction: "You prefer different room temperatures.",
  },
  {
    id: "privacy",
    label: "Privacy",
    question: "How much personal space do you need?",
    scale: ["Share everything", "Share most things", "Some boundaries", "Clear boundaries", "Strict personal space"],
    friction: "You need different amounts of personal space.",
  },
  {
    id: "responsibilities",
    label: "Responsibilities",
    question: "How should chores and bills be handled?",
    scale: ["Whoever has time", "Loosely shared", "Take turns", "Written schedule", "Strict schedule and split"],
    friction: "You expect chores and bills to be handled differently.",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  CategoryDef
>;
