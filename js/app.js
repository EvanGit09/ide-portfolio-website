// ============================================================
// app.js — Entry point, wires everything together
// ============================================================

import { FILE_TREE, FILE_PATHS } from './data.js';
import { renderPage, getMinimapColors } from './renderer.js';
import { initTabs, openTab } from './tabs.js';
import { initExplorer, setActiveFile } from './explorer.js';
import { initStatusBar, updateStatusBar } from './statusbar.js';

// ── Editor rendering ──────────────────────────────────────────

function renderEditor(pageId, filename, fileType) {
  const content = document.getElementById('editor-content');
  const gutter = document.getElementById('gutter');
  const minimap = document.getElementById('minimap');

  if (!content || !gutter) return;

  // Get rendered lines
  const lines = renderPage(pageId);

  // Fade transition
  content.classList.add('fading');

  setTimeout(() => {
    // Render content lines
    const isAboutPage = pageId === 'about';
    let contentHTML = '';

    if (isAboutPage) {
      contentHTML += `<div class="profile-image-container">
        <img class="profile-image" src="assets/profile-placeholder.svg"
             alt="Corey Birnie"
             onerror="this.style.display='none'">
      </div>`;
    }

    contentHTML += lines.map((line, i) =>
      `<div class="code-line ${i === 0 ? 'current-line' : ''}">${line || ' '}<span class="${i === 0 ? 'cursor-blink' : ''}"></span></div>`
    ).join('');

    content.innerHTML = contentHTML;

    // Render gutter
    gutter.innerHTML = lines.map((_, i) =>
      `<div class="line-number ${i === 0 ? 'active' : ''}">${i + 1}</div>`
    ).join('');

    // Render minimap
    if (minimap) {
      const colors = getMinimapColors(lines);
      minimap.innerHTML = colors.map(color =>
        `<div class="minimap__line" style="background: ${color}; width: ${20 + Math.random() * 25}px;"></div>`
      ).join('');
    }

    // Update status bar
    const breadcrumbPath = FILE_PATHS[pageId] || filename;
    updateStatusBar(filename, fileType, lines.length, breadcrumbPath);

    // Update active file in explorer
    setActiveFile(pageId);

    // Scroll to top
    content.scrollTop = 0;

    // Remove fade
    content.classList.remove('fading');
  }, 80);
}

// ── Tab change handler ────────────────────────────────────────

function handleTabChange(pageId, filename, fileType) {
  renderEditor(pageId, filename, fileType);
}

// ── File click handler (from explorer) ────────────────────────

function handleFileClick(pageId, filename, fileType) {
  openTab(pageId, filename, fileType);
}

// ── Sidebar toggle ────────────────────────────────────────────

function toggleSidebar() {
  const shell = document.querySelector('.vscode-shell');
  const explorerBtn = document.querySelector('[data-panel="explorer"]');
  shell.classList.toggle('sidebar-collapsed');
  explorerBtn?.classList.toggle('active');
}

// ── Chat panel toggle ─────────────────────────────────────────

function toggleChat() {
  const shell = document.querySelector('.vscode-shell');
  shell.classList.toggle('chat-collapsed');
}

// ── Keyboard shortcuts ────────────────────────────────────────

function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+B / Cmd+B — toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  });
}

// ── Activity bar handlers ─────────────────────────────────────

function initActivityBar() {
  const explorerBtn = document.querySelector('[data-panel="explorer"]');
  if (explorerBtn) {
    explorerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  }
}

// ── Chat panel close button ───────────────────────────────────

function initChatPanel() {
  const closeBtn = document.querySelector('.chat-panel__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', toggleChat);
  }
}

// ── Console easter egg ────────────────────────────────────────

function consoleEasterEgg() {
  console.log('%c Hey there, curious developer! 👋', 'color: #50fa7b; font-size: 16px; font-weight: bold;');
  console.log('%c Built with vanilla HTML, CSS & JS — no frameworks needed.', 'color: #8be9fd; font-size: 12px;');
  console.log('%c Check out the source: github.com/EvanGit09', 'color: #bd93f9; font-size: 12px;');
  console.log('%c ─────────────────────────────────────────', 'color: #6272a4;');
}

// ── Initialize ────────────────────────────────────────────────

function init() {
  consoleEasterEgg();

  // Init status bar refs
  initStatusBar();

  // Init tab system
  initTabs(handleTabChange);

  // Init file explorer
  initExplorer(FILE_TREE, handleFileClick);

  // Init activity bar
  initActivityBar();

  // Init chat panel
  initChatPanel();

  // Init keyboard shortcuts
  initKeyboard();

  // Open default file
  openTab('about', 'about.tsx', 'tsx');
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
