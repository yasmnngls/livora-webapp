// Pure safety helpers, shared by server code and tests.

export const MIN_AGE = 18;

/**
 * True only if the student is 18 or older in every case. We keep year of birth,
 * not the full birthdate, so someone born this year minus 18 may not have had
 * their birthday yet: require the confirmation checkbox too.
 */
export function passesAgeGate(yearOfBirth: number, confirmed18: boolean, now = new Date()): boolean {
  if (!Number.isInteger(yearOfBirth) || yearOfBirth < 1900) return false;
  if (!confirmed18) return false;
  return now.getFullYear() - yearOfBirth >= MIN_AGE;
}

/** Other users see a band, never an exact age. */
export function ageBand(yearOfBirth: number, now = new Date()): string {
  const age = now.getFullYear() - yearOfBirth;
  if (age <= 20) return "18–20";
  if (age <= 23) return "21–23";
  if (age <= 26) return "24–26";
  return "27+";
}

/** Messages a thread needs before contact details may be shared. */
export const CONTACT_UNLOCK_MESSAGES = 20;

const CONTACT_PATTERNS: { kind: string; re: RegExp }[] = [
  { kind: "phone number", re: /(\+?63|0)\s*9(\s*[-.]?\s*\d){9}/ },
  { kind: "phone number", re: /(\d[\s.-]?){10,}/ },
  { kind: "email address", re: /[^\s@]+@[^\s@]+\.[a-z]{2,}/i },
  { kind: "link", re: /(https?:\/\/|www\.)\S+/i },
  { kind: "link", re: /\b[a-z0-9-]+\.(com|ph|net|org|me|io|ly|gg)\b/i },
  { kind: "social handle", re: /(^|\s)@[a-z0-9_.]{3,}/i },
  { kind: "social handle", re: /\b(fb|facebook|ig|insta|instagram|telegram|viber|whatsapp|tiktok)\b\s*[:@]?\s*\S+/i },
];

/** Returns what kind of contact detail the text contains, or null. */
export function findContactDetail(text: string): string | null {
  for (const p of CONTACT_PATTERNS) if (p.re.test(text)) return p.kind;
  return null;
}
