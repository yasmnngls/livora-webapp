import { describe, expect, it } from "vitest";
import { ageBand, findContactDetail, passesAgeGate } from "./index";

const now = new Date("2026-11-08T00:00:00Z");

describe("age gate", () => {
  it("blocks anyone under 18", () => {
    expect(passesAgeGate(2009, true, now)).toBe(false); // 17
  });
  it("requires the 18+ confirmation", () => {
    expect(passesAgeGate(2000, false, now)).toBe(false);
  });
  it("lets adults through", () => {
    expect(passesAgeGate(2008, true, now)).toBe(true);
    expect(passesAgeGate(2004, true, now)).toBe(true);
  });
  it("rejects nonsense years", () => {
    expect(passesAgeGate(Number.NaN, true, now)).toBe(false);
    expect(passesAgeGate(1800, true, now)).toBe(false);
  });
  it("shows bands, not ages", () => {
    expect(ageBand(2006, now)).toBe("18–20");
    expect(ageBand(2004, now)).toBe("21–23");
  });
});

describe("contact detail guard", () => {
  it.each([
    "text me 09171234567",
    "my number is +63 917 123 4567",
    "0917-123-4567",
    "email me at juan@gmail.com",
    "check https://example.com",
    "add me on fb: juan.dc",
    "ig @juan_dc",
    "my telegram is juandc",
    "see livora-room.ph",
  ])("catches %s", (text) => {
    expect(findContactDetail(text)).not.toBeNull();
  });

  it.each([
    "Hi! What time do you usually sleep?",
    "Rent is 5,500 a month, right?",
    "I'm free at 3pm on the 12th",
    "Room 204 looks nice",
  ])("allows %s", (text) => {
    expect(findContactDetail(text)).toBeNull();
  });
});
