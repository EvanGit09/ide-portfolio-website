// ============================================================
// statusbar.js — Status bar dynamic updates
// ============================================================

import { FILE_LANGUAGES } from './data.js';

const els = {};

export function initStatusBar() {
  els.line = document.getElementById('status-line');
  els.lang = document.getElementById('status-lang');
  els.title = document.getElementById('titlebar-title');
  els.breadcrumbFile = document.getElementById('breadcrumb-file');
  els.breadcrumbPath = document.getElementById('breadcrumb-path');
}

export function updateStatusBar(filename, fileType, lineCount, breadcrumbPath) {
  if (els.line) {
    els.line.textContent = `Ln ${lineCount}, Col 1`;
  }

  if (els.lang) {
    els.lang.textContent = FILE_LANGUAGES[fileType] || 'Plain Text';
  }

  if (els.title) {
    els.title.textContent = `${filename} — Corey Birnie — Portfolio`;
  }

  if (els.breadcrumbFile) {
    els.breadcrumbFile.textContent = filename;
  }

  if (els.breadcrumbPath && breadcrumbPath) {
    // Parse path like "src / pages / about.tsx"
    const parts = breadcrumbPath.split(' / ');
    els.breadcrumbPath.innerHTML = parts.map((part, i) =>
      i < parts.length - 1
        ? `<span>${part}</span><span class="breadcrumb__sep">›</span>`
        : ''
    ).join('');
  }
}
