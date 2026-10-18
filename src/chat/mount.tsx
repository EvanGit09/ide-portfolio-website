import { createRoot } from "react-dom/client";
import { ChatPanel } from "./ChatPanel";

const mounted = new WeakSet<HTMLElement>();

export function mountChat(container: HTMLElement): void {
  if (mounted.has(container)) return;
  mounted.add(container);
  createRoot(container).render(<ChatPanel />);
}
