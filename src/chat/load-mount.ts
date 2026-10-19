export type MountModule = { mountChat: (container: HTMLElement) => void };

export async function loadMount(): Promise<MountModule> {
  await import("./csp-safe-zod");
  return import("./mount");
}
