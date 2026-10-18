import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { APICallError } from "ai";
import { describe, expect, it, vi } from "vitest";
import { ChatPanel } from "./ChatPanel";
import { createChatTransport } from "./transport";
import { createMockTransport } from "./test-utils";

const ask = async (question: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox", { name: "Message the agent" }), `${question}{Enter}`);
  return user;
};

describe("ChatPanel", () => {
  it("renders the seeded conversation with Agent and You labels", () => {
    render(<ChatPanel transport={createMockTransport({})} />);
    expect(screen.getByText("Tell me about Corey Birnie")).toBeInTheDocument();
    expect(screen.getByText("Advanced Software Engineer").tagName).toBe("STRONG");
    expect(screen.getByText("QuickReview").tagName).toBe("CODE");
    expect(screen.getAllByText("Agent")).toHaveLength(3);
    expect(screen.getAllByText("You")).toHaveLength(3);
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("renders the skills as a list", () => {
    render(<ChatPanel transport={createMockTransport({})} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("limits composer input length and sets a placeholder", () => {
    render(<ChatPanel transport={createMockTransport({})} />);
    const input = screen.getByRole("textbox", { name: "Message the agent" });
    expect(input).toHaveAttribute("maxLength", "2000");
    expect(input).toHaveAttribute("placeholder", "Ask about Corey, or anything…");
  });

  it("shows the user bubble then the streamed assistant reply and sends history", async () => {
    const transport = createMockTransport({ text: "He loves **TypeScript** a lot." });
    render(<ChatPanel transport={transport} />);
    await ask("Favourite language?");
    expect(await screen.findByText("Favourite language?")).toBeInTheDocument();
    expect((await screen.findByText("TypeScript", {}, { timeout: 3000 })).tagName).toBe("STRONG");
    expect(transport.sent[0]).toHaveLength(7);
    expect(transport.sent[0].at(-1)?.role).toBe("user");
  });

  it("shows a typing indicator and Stop button while streaming", async () => {
    const transport = createMockTransport({ text: "Done.", hold: true });
    render(<ChatPanel transport={transport} />);
    await ask("Hello");
    expect(await screen.findByRole("button", { name: "Stop generating" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Send message" })).not.toBeInTheDocument();
    const dots = document.querySelector(".chat-typing");
    expect(dots).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    transport.release();
    expect(await screen.findByRole("button", { name: "Send message" }, { timeout: 3000 })).toBeInTheDocument();
  });

  it("stops generation when Stop is clicked", async () => {
    const transport = createMockTransport({ text: "Never", hold: true });
    render(<ChatPanel transport={transport} />);
    const user = await ask("Hello");
    await user.click(await screen.findByRole("button", { name: "Stop generating" }));
    expect(await screen.findByRole("button", { name: "Send message" })).toBeInTheDocument();
  });

  it("shows a friendly error with Retry for a 429 and never the raw body", async () => {
    const error = new APICallError({ message: "<html>Too many</html>", url: "/api/chat", requestBodyValues: undefined, statusCode: 429, responseBody: "<html>Too many</html>" });
    render(<ChatPanel transport={createMockTransport({ error })} />);
    await ask("Hello");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("You're sending messages too quickly. Wait a minute and try again.");
    expect(alert).not.toHaveTextContent("<html>");
    expect(within(alert).getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("hides the hover action bar on a failed reply so Retry is offered once", async () => {
    render(<ChatPanel transport={createMockTransport({ error: new Error("boom") })} />);
    await ask("Hello");
    await screen.findByRole("alert");
    expect(screen.queryByRole("button", { name: "Retry response" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /retry/i })).toHaveLength(1);
  });

  it("shows a generic friendly error for plain errors", async () => {
    render(<ChatPanel transport={createMockTransport({ error: new TypeError("Failed to fetch") })} />);
    await ask("Hello");
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't reach the assistant.");
  });

  it("retries the request when Retry is clicked", async () => {
    const transport = createMockTransport({ error: new Error("boom") });
    render(<ChatPanel transport={transport} />);
    const user = await ask("Hello");
    const alert = await screen.findByRole("alert");
    await user.click(within(alert).getByRole("button", { name: /retry/i }));
    await waitFor(() => expect(transport.sent).toHaveLength(2));
    const lastUser = (messages: (typeof transport.sent)[number]) => messages.filter((m) => m.role === "user").at(-1);
    expect(lastUser(transport.sent[1])?.id).toBe(lastUser(transport.sent[0])?.id);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(transport.sent).toHaveLength(2);
  });

  it("offers Copy on the last assistant message and writes to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const transport = createMockTransport({});
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<ChatPanel transport={transport} />);
    const copy = screen.getAllByRole("button", { name: "Copy message" }).at(-1) as HTMLElement;
    await user.click(copy);
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Master's dissertation")));
    await waitFor(() => expect(copy).toHaveAttribute("data-copied"));
  });

  it("shows friendly 429 copy through the real transport", async () => {
    const fetchImpl = (async () =>
      new Response("<html>Too Many</html>", { status: 429, headers: { "content-type": "text/plain" } })) as typeof fetch;
    render(<ChatPanel transport={createChatTransport("/api/chat", fetchImpl)} />);
    await ask("Hello");
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("You're sending messages too quickly. Wait a minute and try again.");
    expect(alert).not.toHaveTextContent("Too Many");
  });

  it("renders a real UI-message SSE stream through the real transport", async () => {
    const events = [
      { type: "start", messageId: "m1" },
      { type: "text-start", id: "t1" },
      { type: "text-delta", id: "t1", delta: "Streamed " },
      { type: "text-delta", id: "t1", delta: "from SSE." },
      { type: "text-end", id: "t1" },
      { type: "finish" },
    ];
    const body = `${events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("")}data: [DONE]\n\n`;
    const fetchImpl = (async () =>
      new Response(body, {
        status: 200,
        headers: { "content-type": "text/event-stream", "x-vercel-ai-ui-message-stream": "v1" },
      })) as typeof fetch;
    render(<ChatPanel transport={createChatTransport("/api/chat", fetchImpl)} />);
    await ask("Hello");
    expect(await screen.findByText("Streamed from SSE.", {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
