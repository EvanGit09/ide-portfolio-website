// ============================================================
// tabs.js — Tab management (open, close, switch)
// ============================================================

let openTabs = [];    // Array of { id, name, fileType }
let activeTabId = null;
let onTabChange = null;  // Callback when tab changes

const tabBar = () => document.getElementById('tab-bar');

// File type icon SVGs (small inline)
function getFileIcon(fileType) {
  const iconClass = `tab__icon tab__icon--${fileType}`;
  switch (fileType) {
    case 'tsx':
    case 'ts':
      return `<span class="${iconClass}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" fill="#3178c6"/>
          <text x="8" y="11" font-size="8" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">TS</text>
        </svg>
      </span>`;
    case 'json':
      return `<span class="${iconClass}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <text x="8" y="12" font-size="11" fill="#f1fa8c" text-anchor="middle" font-family="monospace">{}</text>
        </svg>
      </span>`;
    case 'md':
      return `<span class="${iconClass}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="10" rx="1" stroke="#519aba" stroke-width="1.5" fill="none"/>
          <text x="8" y="11" font-size="7" font-weight="bold" fill="#519aba" text-anchor="middle" font-family="sans-serif">M↓</text>
        </svg>
      </span>`;
    default:
      return `<span class="${iconClass}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 1h6l4 4v10H4V1z" stroke="#6272a4" stroke-width="1" fill="none"/>
        </svg>
      </span>`;
  }
}

export function initTabs(onChange) {
  onTabChange = onChange;
}

export function openTab(id, name, fileType) {
  // Check if already open
  const existing = openTabs.find(t => t.id === id);
  if (!existing) {
    openTabs.push({ id, name, fileType });
  }
  setActiveTab(id);
}

export function closeTab(id) {
  const idx = openTabs.findIndex(t => t.id === id);
  if (idx === -1) return;

  openTabs.splice(idx, 1);

  // If we closed the active tab, switch to nearest
  if (activeTabId === id) {
    if (openTabs.length > 0) {
      const newIdx = Math.min(idx, openTabs.length - 1);
      setActiveTab(openTabs[newIdx].id);
    } else {
      // Re-open about as default if all tabs closed
      openTab('about', 'about.tsx', 'tsx');
      return;
    }
  }

  renderTabs();
}

export function setActiveTab(id) {
  activeTabId = id;
  renderTabs();
  if (onTabChange) {
    const tab = openTabs.find(t => t.id === id);
    onTabChange(id, tab ? tab.name : '', tab ? tab.fileType : 'ts');
  }
}

export function getActiveTab() {
  return activeTabId;
}

function renderTabs() {
  const bar = tabBar();
  if (!bar) return;

  bar.innerHTML = openTabs.map(tab => {
    const isActive = tab.id === activeTabId;
    return `
      <div class="tab ${isActive ? 'active' : ''}" data-tab-id="${tab.id}">
        ${getFileIcon(tab.fileType)}
        <span class="tab__name">${tab.name}</span>
        <button class="tab__close" data-close-id="${tab.id}" title="Close">&times;</button>
      </div>
    `;
  }).join('');

  // Tab click handlers
  bar.querySelectorAll('.tab').forEach(el => {
    el.addEventListener('click', (e) => {
      // Don't switch tab if clicking close button
      if (e.target.closest('.tab__close')) return;
      setActiveTab(el.dataset.tabId);
    });
  });

  // Close button handlers
  bar.querySelectorAll('.tab__close').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(el.dataset.closeId);
    });
  });
}
