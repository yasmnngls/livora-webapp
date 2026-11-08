"use client";

import { useState, useTransition, type ReactNode } from "react";
import { completeOnboarding } from "@/app/actions";
import { AMENITY_LABELS } from "@/components/ui";
import { CATEGORIES } from "@/lib/scoring/categories";
import { AMENITIES, CATEGORY_IDS, type Amenity, type CategoryId, type Consent, type Gender, type HouseRules, type Importance, type LivingProfile, type RoomGenderPreference } from "@/lib/types";

const IMPORTANCE: { v: Importance; label: string }[] = [
  { v: 1, label: "A little" },
  { v: 2, label: "Matters" },
  { v: 3, label: "A lot" },
];

const blankProfile = () => Object.fromEntries(CATEGORY_IDS.map((id) => [id, { value: -1, importance: 2 }])) as unknown as LivingProfile;

/** One pill choice. The input is visually hidden; the label is the button. */
function Option({ type = "radio", name, checked, onChange, disabled, children }: { type?: "radio" | "checkbox"; name: string; checked: boolean; onChange: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <label className={`option ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
      <input type={type} className="sr-only" name={name} checked={checked} onChange={onChange} disabled={disabled} />
      {children}
    </label>
  );
}

function Screen({ title, help, children }: { title: string; help?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        {help && <p className="text-sm text-muted">{help}</p>}
      </div>
      {children}
    </section>
  );
}

export function OnboardingForm({ domains, demoCode }: { domains: string[]; demoCode: string }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [yearOfBirth, setYear] = useState("");
  const [confirmed18, setConfirmed18] = useState(false);
  const [gender, setGender] = useState<Gender | "">("");
  const [roomPreference, setRoomPref] = useState<RoomGenderPreference>("same");
  const [budgetMin, setBudgetMin] = useState("3000");
  const [budgetMax, setBudgetMax] = useState("6000");
  const [mustHaves, setMustHaves] = useState<Amenity[]>([]);
  const [profile, setProfile] = useState<LivingProfile>(blankProfile);
  const [dealbreakers, setDealbreakers] = useState<CategoryId[]>([]);
  const [houseRules, setHouseRules] = useState<HouseRules>({ smokingInside: "never", drinkingAtHome: "occasionally", overnightGuests: "with_notice" });
  const [consent, setConsent] = useState<Consent>({ matching: false, photoToMatches: false, checkinsForScoring: false, universityReports: false });

  const thisYear = new Date().getFullYear();
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  type Step = { render: () => ReactNode; check?: () => string | null };

  const steps: Step[] = [
    {
      render: () => (
        <Screen title="Hey! What's your first name?" help="Only your first name is ever shown. We never ask for your surname.">
          <input className="field text-center text-lg" aria-label="First name" autoComplete="given-name" maxLength={30} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
        </Screen>
      ),
      check: () => (firstName.trim() ? null : "Enter your first name."),
    },
    {
      render: () => (
        <Screen title="Verify your school email" help={`It proves you're a student and is never shown to anyone. Pilot schools: ${domains.join(", ")}.`}>
          <input className="field" type="email" inputMode="email" aria-label="School email" autoComplete="email" placeholder={`you@${domains[0]}`} value={email} onChange={(e) => setEmail(e.target.value)} />
          {codeSent ? (
            <div className="space-y-2">
              <input className="field text-center text-lg tracking-[0.4em]" aria-label="6-digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
              <p className="text-center text-xs text-muted">Prototype: no email is sent. Use {demoCode}.</p>
            </div>
          ) : (
            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => {
                const domain = email.trim().toLowerCase().split("@")[1];
                if (!domain || !domains.includes(domain)) return setError(`Use your school email (${domains.join(", ")}).`);
                setError(null);
                setCodeSent(true);
              }}
            >
              Send code
            </button>
          )}
        </Screen>
      ),
      check: () => {
        const domain = email.trim().toLowerCase().split("@")[1];
        if (!domain || !domains.includes(domain)) return `Use your school email (${domains.join(", ")}).`;
        if (!codeSent) return "Send the verification code first.";
        return code.length === 6 ? null : "Enter the 6-digit code.";
      },
    },
    {
      render: () => (
        <Screen title="What year were you born?" help="Others see an age band like 18–20, never your age. We don't ask for your birthday.">
          <input className="field text-center text-lg" aria-label="Year of birth" inputMode="numeric" maxLength={4} placeholder="2005" value={yearOfBirth} onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))} />
          <Option type="checkbox" name="adult" checked={confirmed18} onChange={() => setConfirmed18((v) => !v)}>
            I confirm I am 18 or older
          </Option>
        </Screen>
      ),
      check: () => {
        const y = Number(yearOfBirth);
        return y && thisYear - y >= 18 && confirmed18 ? null : "Livora is for students 18 and older.";
      },
    },
    {
      render: () => (
        <Screen title="What's your gender?" help="Only used to match room types, like women-only dorms. Never shown on your card.">
          <div className="space-y-2.5">
            {(["woman", "man", "nonbinary"] as const).map((g) => (
              <Option key={g} name="gender" checked={gender === g} onChange={() => setGender(g)}>
                {g === "nonbinary" ? "Non-binary" : g[0].toUpperCase() + g.slice(1)}
              </Option>
            ))}
          </div>
        </Screen>
      ),
      check: () => (gender ? null : "Pick one to continue."),
    },
    {
      render: () => (
        <Screen title="Who would you room with?">
          <div className="space-y-2.5">
            <Option name="room" checked={roomPreference === "same"} onChange={() => setRoomPref("same")}>
              Same gender only
            </Option>
            <Option name="room" checked={roomPreference === "any"} onChange={() => setRoomPref("any")}>
              Any gender
            </Option>
          </div>
        </Screen>
      ),
    },
    {
      render: () => (
        <Screen title="What's your monthly budget?" help="Private. Only used to rank rooms for you.">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-center" htmlFor="bmin">
                From (₱)
              </label>
              <input id="bmin" className="field text-center text-lg" inputMode="numeric" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value.replace(/\D/g, ""))} />
            </div>
            <div>
              <label className="label text-center" htmlFor="bmax">
                Up to (₱)
              </label>
              <input id="bmax" className="field text-center text-lg" inputMode="numeric" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value.replace(/\D/g, ""))} />
            </div>
          </div>
        </Screen>
      ),
      check: () => (Number(budgetMin) >= 1000 && Number(budgetMax) >= Number(budgetMin) ? null : "Check your budget range (₱1,000 or more)."),
    },
    {
      render: () => (
        <Screen title="Any must-haves?" help="Pick as many as you need, or none.">
          <div className="grid grid-cols-2 gap-2.5">
            {AMENITIES.map((a) => (
              <Option key={a} type="checkbox" name="amenities" checked={mustHaves.includes(a)} onChange={() => setMustHaves((m) => toggle(m, a))}>
                {AMENITY_LABELS[a]}
              </Option>
            ))}
          </div>
        </Screen>
      ),
    },
    ...CATEGORIES.map(
      (c): Step => ({
        render: () => {
          const a = profile[c.id];
          const isDb = dealbreakers.includes(c.id);
          return (
            <Screen title={c.question} help={<span className="font-semibold uppercase tracking-wide text-brand">{c.label}</span>}>
              <div className="space-y-2.5">
                {c.scale.map((label, v) => (
                  <Option key={v} name={`v-${c.id}`} checked={a.value === v} onChange={() => setProfile((p) => ({ ...p, [c.id]: { ...p[c.id], value: v } }))}>
                    {label}
                  </Option>
                ))}
              </div>
              <fieldset className="space-y-2">
                <legend className="mb-2 w-full text-center text-sm font-semibold">How much does this matter to you?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {IMPORTANCE.map((i) => (
                    <Option key={i.v} name={`i-${c.id}`} checked={a.importance === i.v} onChange={() => setProfile((p) => ({ ...p, [c.id]: { ...p[c.id], importance: i.v } }))}>
                      {i.label}
                    </Option>
                  ))}
                </div>
              </fieldset>
              <Option type="checkbox" name={`db-${c.id}`} checked={isDb} disabled={!isDb && dealbreakers.length >= 3} onChange={() => setDealbreakers((d) => toggle(d, c.id))}>
                {isDb ? "Dealbreaker ✓" : `Make this a dealbreaker (${dealbreakers.length}/3)`}
              </Option>
              <p className="text-center text-xs text-muted">Private. Matches see how you compare, never your answer.</p>
            </Screen>
          );
        },
        check: () => (profile[c.id].value >= 0 ? null : "Pick the answer closest to you."),
      }),
    ),
    {
      render: () => (
        <Screen title="Your house rules" help="These describe the home you want, not you. Matches only see where your rules differ.">
          {(
            [
              ["smokingInside", "Smoking", [["never", "Never"], ["outside_ok", "Outside only"], ["ok", "Inside OK"]]],
              ["drinkingAtHome", "Drinking at home", [["never", "Never"], ["occasionally", "Sometimes"], ["ok", "Anytime"]]],
              ["overnightGuests", "Overnight guests", [["never", "Never"], ["with_notice", "With notice"], ["ok", "Anytime"]]],
            ] as const
          ).map(([key, label, options]) => (
            <fieldset key={key}>
              <legend className="label">{label}</legend>
              <div className="grid grid-cols-3 gap-2">
                {options.map(([v, l]) => (
                  <Option key={v} name={key} checked={houseRules[key] === v} onChange={() => setHouseRules((h) => ({ ...h, [key]: v }))}>
                    {l}
                  </Option>
                ))}
              </div>
            </fieldset>
          ))}
        </Screen>
      ),
    },
    {
      render: () => (
        <Screen title="You decide what we use" help="Only the first is required. Change any of these later in Privacy.">
          <div className="space-y-3">
            {(
              [
                ["matching", "Use my answers to find matches", "Required. Answers become scores; nobody sees the answers."],
                ["photoToMatches", "Show my photo to matches", "Blurred until you both accept."],
                ["checkinsForScoring", "Use my 30/90-day check-ins to improve scoring", "Never shown to your roommate or owner."],
                ["universityReports", "Include me in anonymized university reports", "Groups of 10+ only. Never your name or answers."],
              ] as const
            ).map(([key, label, help]) => (
              <label key={key} className="card flex cursor-pointer items-start gap-3 p-4">
                <input type="checkbox" className="mt-0.5 size-5 accent-[var(--brand)]" checked={consent[key]} onChange={(e) => setConsent((c) => ({ ...c, [key]: e.target.checked }))} />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-muted">{help}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-center text-xs text-muted">We never collect religion, ethnicity, health, sexual orientation or political views.</p>
        </Screen>
      ),
      check: () => (consent.matching ? null : "Matching needs your consent to use your answers."),
    },
  ];

  const last = step === steps.length - 1;
  const current = steps[step];

  function next() {
    const e = current.check?.() ?? null;
    setError(e);
    if (e) return;
    if (!last) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    start(async () => {
      const r = await completeOnboarding({
        firstName,
        schoolEmail: email,
        code,
        yearOfBirth: Number(yearOfBirth),
        confirmed18,
        gender: gender as Gender,
        roomPreference,
        profile,
        dealbreakers,
        houseRules,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        mustHaves,
        consent,
      });
      if (r && "error" in r) setError(r.error);
    });
  }

  return (
    <form
      className="pb-28"
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
    >
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          className="pressable flex size-10 shrink-0 items-center justify-center rounded-full text-xl text-brand disabled:opacity-0"
          disabled={step === 0 || pending}
          onClick={() => {
            setError(null);
            setStep((s) => s - 1);
          }}
          aria-label="Back"
        >
          ←
        </button>
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1}>
            <div className="h-full origin-left rounded-full bg-brand transition-transform duration-300" style={{ transform: `scaleX(${(step + 1) / steps.length})`, transitionTimingFunction: "var(--ease-out)" }} />
          </div>
          <p className="mt-1.5 text-center text-xs text-muted">
            {step + 1} of {steps.length}
          </p>
        </div>
        <span className="size-10 shrink-0" />
      </div>

      <div className="mx-auto max-w-md">{current.render()}</div>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-bg/95 px-4 pt-3 backdrop-blur" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto max-w-md space-y-2">
          {error && (
            <p role="alert" className="text-center text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <button className="btn-primary w-full" disabled={pending}>
            {pending ? "Creating your profile…" : last ? "Create profile" : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
}
