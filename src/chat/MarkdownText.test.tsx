import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChatPanel } from "./ChatPanel";
import { createMockTransport } from "./test-utils";

async function renderReply(markdown: string): Promise<HTMLElement> {
  const { container } = render(<ChatPanel transport={createMockTransport({ text: markdown })} />);
  await userEvent.setup().type(screen.getByRole("textbox", { name: "Message the agent" }), "go{Enter}");
  await screen.findByText("END", {}, { timeout: 3000 });
  return container;
}

const lastReply = (container: HTMLElement): HTMLElement =>
  Array.from(container.querySelectorAll<HTMLElement>(".chat-message--ai")).at(-1) as HTMLElement;

describe("MarkdownText security and formatting", () => {
  it("does not render script or img elements from raw html", async () => {
    const container = await renderReply('<script>alert(1)</script>\n\nhi <img src=x onerror="alert(1)">\n\nEND');
    const reply = lastReply(container);
    expect(reply.querySelector("script")).toBeNull();
    expect(reply.querySelector("img")).toBeNull();
    expect(reply.innerHTML).not.toContain("onerror");
  });

  it("drops markdown images", async () => {
    const container = await renderReply("![alt](https://example.com/x.png) END");
    expect(lastReply(container).querySelector("img")).toBeNull();
  });

  it("never produces a javascript: href", async () => {
    const container = await renderReply("[x](javascript:alert(1)) END");
    const reply = lastReply(container);
    expect(reply.innerHTML.toLowerCase()).not.toContain("javascript:");
    expect(reply.querySelector("a")).toBeNull();
    expect(reply).toHaveTextContent("x");
  });

  it("opens safe links in a new tab with noopener noreferrer", async () => {
    const container = await renderReply("[site](https://example.com) END");
    const link = lastReply(container).querySelector("a") as HTMLAnchorElement;
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders GFM lists, tables and code blocks", async () => {
    const container = await renderReply("- one\n- two\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```ts\nconst x = 1;\n```\n\nEND");
    const reply = lastReply(container);
    expect(reply.querySelectorAll("li")).toHaveLength(2);
    expect(reply.querySelector("table")).not.toBeNull();
    expect(reply.querySelector("pre code")).not.toBeNull();
  });
});
