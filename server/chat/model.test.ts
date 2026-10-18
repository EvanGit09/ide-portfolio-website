import { describe, expect, it } from "vitest";
import { MODEL_ID } from "./config";
import { createOpenRouterModel } from "./model";

describe("createOpenRouterModel", () => {
  it.each([[undefined], [""]])("returns null when key is %j", (key) => {
    expect(createOpenRouterModel(key)).toBeNull();
  });

  it("passes the preset model id through verbatim", () => {
    const model = createOpenRouterModel("test-key");
    expect(model).toMatchObject({ modelId: MODEL_ID });
  });
});
