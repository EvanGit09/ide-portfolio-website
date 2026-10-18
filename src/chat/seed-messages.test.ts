import { describe, expect, it } from "vitest";
import { SEED_MESSAGES } from "./seed-messages";

describe("SEED_MESSAGES", () => {
  it("has six messages alternating user and assistant", () => {
    expect(SEED_MESSAGES).toHaveLength(6);
    SEED_MESSAGES.forEach((m, i) => expect(m.role).toBe(i % 2 === 0 ? "user" : "assistant"));
  });

  it("has unique seed-N ids", () => {
    expect(SEED_MESSAGES.map((m) => m.id)).toEqual(["seed-1", "seed-2", "seed-3", "seed-4", "seed-5", "seed-6"]);
  });

  it("uses a single non-empty text part per message", () => {
    for (const m of SEED_MESSAGES) {
      expect(m.parts).toHaveLength(1);
      expect(m.parts[0].type).toBe("text");
      expect((m.parts[0] as { text: string }).text.length).toBeGreaterThan(0);
    }
  });

  it("reproduces the scripted questions and key formatting", () => {
    const text = (i: number) => (SEED_MESSAGES[i].parts[0] as { text: string }).text;
    expect(text(0)).toBe("Tell me about Corey Birnie");
    expect(text(2)).toBe("What are his key technical skills?");
    expect(text(4)).toBe("What's his most impressive achievement?");
    expect(text(1)).toContain("**Advanced Software Engineer**");
    expect(text(3)).toContain("- **Languages:**");
    expect(text(5)).toContain("`QuickReview`");
  });
});
