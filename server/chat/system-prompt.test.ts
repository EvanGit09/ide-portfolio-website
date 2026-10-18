import { describe, expect, it } from "vitest";
import { CONTACT_EMAIL } from "./config";
import { buildSystemPrompt } from "./system-prompt";

const TODAY = new Date("2026-10-18T12:00:00Z");

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt(TODAY);

  it("includes CV facts and today's ISO date", () => {
    expect(prompt).toContain("Worldover");
    expect(prompt).toContain("2026-10-18");
  });

  it("excludes phone and postcode", () => {
    expect(prompt).not.toContain("07720835799");
    expect(prompt).not.toContain("NW6");
  });

  it("allows general questions and points to the contact email", () => {
    expect(prompt.toLowerCase()).toContain("general question");
    expect(prompt).toContain(CONTACT_EMAIL);
  });

  it("delimits the CV as reference data", () => {
    expect(prompt).toContain("<cv>");
    expect(prompt).toContain("</cv>");
  });
});
