const ICON_PROPS = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const CopyIcon = () => (
  <svg {...ICON_PROPS} className="chat-icon chat-icon--copy">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
);

export const CheckIcon = () => (
  <svg {...ICON_PROPS} className="chat-icon chat-icon--check">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

export const RetryIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
  </svg>
);

export const StopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="5" y="5" width="14" height="14" rx="2" />
  </svg>
);

export const ArrowDownIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
