// ============================================================
// app.js — Entry point, wires everything together
// ============================================================

import { FILE_TREE, FILE_PATHS } from "./data.js";
import { renderPage, getMinimapColors } from "./renderer.js";
import { initTabs, openTab } from "./tabs.js";
import { initExplorer, setActiveFile } from "./explorer.js";
import { initStatusBar, updateStatusBar } from "./statusbar.js";

// ── Editor rendering ──────────────────────────────────────────

function renderEditor(pageId, filename, fileType) {
  const content = document.getElementById("editor-content");
  const gutter = document.getElementById("gutter");
  const minimap = document.getElementById("minimap");
  const editor = content?.closest(".editor");

  if (!content || !gutter) return;

  // Toggle PDF mode class
  editor?.classList.toggle("editor--pdf", pageId === "cv");

  // Fade transition
  content.classList.add("fading");

  setTimeout(() => {
    // PDF viewer — special case
    if (pageId === "cv") {
      content.innerHTML = `
        <div class="pdf-viewer">
          <a class="pdf-download-btn" href="assets/Corey_Birnie_CV.pdf" download="Corey_Birnie_CV.pdf" title="Download CV">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download CV
          </a>
          <iframe src="assets/Corey_Birnie_CV.pdf" class="pdf-frame" title="Corey Birnie CV"></iframe>
        </div>`;
      gutter.innerHTML = "";
      if (minimap) minimap.innerHTML = "";

      const breadcrumbPath = FILE_PATHS[pageId] || filename;
      updateStatusBar(filename, fileType, 1, breadcrumbPath);
      setActiveFile(pageId);
      content.classList.remove("fading");
      return;
    }

    // Standard code rendering
    const lines = renderPage(pageId);
    const isAboutPage = pageId === "about";
    let contentHTML = "";

    if (isAboutPage) {
      contentHTML += `<div class="profile-image-container">
        <img class="profile-image profile-image--linkedin" src="assets/linkedin-profile-pic.jpeg"
             alt="Corey Birnie"
             onerror="this.style.display='none'">
      </div>`;
    }

    contentHTML += lines
      .map(
        (line, i) =>
          `<div class="code-line ${i === 0 ? "current-line" : ""}">${
            line || " "
          }<span class="${i === 0 ? "cursor-blink" : ""}"></span></div>`
      )
      .join("");

    content.innerHTML = contentHTML;

    // Render gutter
    gutter.innerHTML = lines
      .map(
        (_, i) =>
          `<div class="line-number ${i === 0 ? "active" : ""}">${i + 1}</div>`
      )
      .join("");

    // Render minimap
    if (minimap) {
      const colors = getMinimapColors(lines);
      minimap.innerHTML = colors
        .map(
          (color) =>
            `<div class="minimap__line" style="background: ${color}; width: ${
              20 + Math.random() * 25
            }px;"></div>`
        )
        .join("");
    }

    // Update status bar
    const breadcrumbPath = FILE_PATHS[pageId] || filename;
    updateStatusBar(filename, fileType, lines.length, breadcrumbPath);

    // Update active file in explorer
    setActiveFile(pageId);

    // Scroll to top
    content.scrollTop = 0;

    // Remove fade
    content.classList.remove("fading");
  }, 80);
}

// ── Tab change handler ────────────────────────────────────────

function handleTabChange(pageId, filename, fileType) {
  renderEditor(pageId, filename, fileType);
}

// ── File click handler (from explorer) ────────────────────────

function handleFileClick(pageId, filename, fileType) {
  openTab(pageId, filename, fileType);
  // Close mobile sidebar overlay after file selection
  document.body.classList.remove("mobile-sidebar-open");
}

// ── Sidebar toggle ────────────────────────────────────────────

function toggleSidebar() {
  const shell = document.querySelector(".vscode-shell");
  const explorerBtn = document.querySelector('[data-panel="explorer"]');
  shell.classList.toggle("sidebar-collapsed");
  explorerBtn?.classList.toggle("active");
}

// ── Chat panel toggle ─────────────────────────────────────────

function toggleChat() {
  if (window.innerWidth <= 768) {
    document.body.classList.remove("mobile-chat-open");
  } else {
    const shell = document.querySelector(".vscode-shell");
    shell.classList.toggle("chat-collapsed");
  }
}

// ── Keyboard shortcuts ────────────────────────────────────────

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    // Ctrl+B / Cmd+B — toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      toggleSidebar();
    }
  });
}

// ── Activity bar handlers ─────────────────────────────────────

function initActivityBar() {
  const explorerBtn = document.querySelector('[data-panel="explorer"]');
  if (explorerBtn) {
    explorerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  }
}

// ── Chat panel close button ───────────────────────────────────

function initChatPanel() {
  const closeBtn = document.querySelector(".chat-panel__close");
  if (closeBtn) {
    closeBtn.addEventListener("click", toggleChat);
  }
}

// ── Mobile navigation ─────────────────────────────────────────

function initMobileNav() {
  const explorerBtn = document.querySelector('[data-mobile="explorer"]');
  const chatBtn = document.querySelector('[data-mobile="chat"]');
  const backdrop = document.getElementById("mobile-backdrop");

  if (explorerBtn) {
    explorerBtn.addEventListener("click", () => {
      document.body.classList.remove("mobile-chat-open");
      document.body.classList.toggle("mobile-sidebar-open");
    });
  }

  if (chatBtn) {
    chatBtn.addEventListener("click", () => {
      document.body.classList.remove("mobile-sidebar-open");
      document.body.classList.toggle("mobile-chat-open");
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      document.body.classList.remove("mobile-sidebar-open");
      document.body.classList.remove("mobile-chat-open");
    });
  }
}

// ── Console easter egg ────────────────────────────────────────

function consoleEasterEgg() {
  console.log(
    "%c Hey there, curious developer! 👋",
    "color: #50fa7b; font-size: 16px; font-weight: bold;"
  );
  console.log(
    "%c Built with vanilla HTML, CSS & JS — no frameworks needed.",
    "color: #8be9fd; font-size: 12px;"
  );
  console.log(
    "%c Check out the source: github.com/EvanGit09",
    "color: #bd93f9; font-size: 12px;"
  );
  console.log(
    "%c ─────────────────────────────────────────",
    "color: #6272a4;"
  );
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

  // Init mobile navigation
  initMobileNav();

  // Init keyboard shortcuts
  initKeyboard();

  // Open default file
  openTab("about", "about.tsx", "tsx");
}

// Wait for DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
