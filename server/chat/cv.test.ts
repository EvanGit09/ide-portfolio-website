import { describe, expect, it } from "vitest";
import { CV_MARKDOWN } from "./cv";

describe("CV_MARKDOWN", () => {
  it("omits phone number and postcode", () => {
    expect(CV_MARKDOWN).not.toContain("07720835799");
    expect(CV_MARKDOWN).not.toContain("NW6");
  });

  it.each(["Worldover", "Citigroup", "Durham University", "MBDA", "QuickReview", "London, UK", "coreybirnie@gmail.com"])(
    "includes %s",
    (fact) => {
      expect(CV_MARKDOWN).toContain(fact);
    },
  );
});
