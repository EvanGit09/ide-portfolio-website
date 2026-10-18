import type { UIMessage } from "ai";

const message = (n: number, role: UIMessage["role"], text: string): UIMessage => ({
  id: `seed-${n}`,
  role,
  parts: [{ type: "text", text }],
});

const INTRO = [
  "Corey is an **Advanced Software Engineer** at Worldover in London. He holds a **1st class MEng** in Computer Science from Durham University.",
  "He specialises in full-stack TypeScript/React development and AI-first product architecture.",
  "Fun fact: he went from writing embedded C/C++ for missile systems at MBDA to building AI platforms that generate entire web apps!",
].join("\n\n");

const SKILLS = [
  "His core stack:",
  "- **Languages:** TypeScript, Python, SQL, Java, C++, Haskell",
  "- **Technologies:** React, Next.js, tRPC, Postgres, Tailwind, MCP",
  "- **Infra:** AWS, Supabase, Vercel, Firecracker VMs",
  "- **AI/ML:** PyTorch, Computer Vision, NLP, GANs",
].join("\n");

const ACHIEVEMENT = [
  'At Worldover, he led the architectural transformation of an entire platform into an **"AI-first" appfactory**. He also directed the `QuickReview` feature launch which improved customer efficiency by **over 100x**, and built AI agents that generate bespoke documents and chase suppliers over email.',
  "His Master's dissertation is equally impressive — he built an ML pipeline combining computer vision, NLP, and financial modeling to **predict stock prices from CEO video interviews**.",
].join("\n\n");

export const SEED_MESSAGES: UIMessage[] = [
  message(1, "user", "Tell me about Corey Birnie"),
  message(2, "assistant", INTRO),
  message(3, "user", "What are his key technical skills?"),
  message(4, "assistant", SKILLS),
  message(5, "user", "What's his most impressive achievement?"),
  message(6, "assistant", ACHIEVEMENT),
];
