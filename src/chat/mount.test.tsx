import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mountChat } from "./mount";

describe("mountChat", () => {
  it("replaces the static fallback with the chat UI", async () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>static fallback</p>";
    document.body.append(container);
    await act(async () => mountChat(container));
    expect(container.textContent).not.toContain("static fallback");
    expect(container.querySelector(".chat-thread")).not.toBeNull();
  });

  it("is idempotent for the same container", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    await act(async () => mountChat(container));
    const first = container.querySelector(".chat-thread");
    await act(async () => mountChat(container));
    expect(container.querySelectorAll(".chat-thread")).toHaveLength(1);
    expect(container.querySelector(".chat-thread")).toBe(first);
  });
});
