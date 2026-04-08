// ============================================================
// explorer.js — File tree rendering + expand/collapse
// ============================================================

import { CONFIG } from './config.js';

let onFileClick = null;
let activeFileId = null;

// File type icons (16x16 inline SVGs)
function getFolderIcon(isOpen) {
  if (isOpen) {
    return `<span class="file-tree__icon file-tree__icon--folder-open">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 3A1.5 1.5 0 013 1.5h3.1a1.5 1.5 0 011.06.44L8.28 3.06c.14.14.33.22.53.22H13A1.5 1.5 0 0114.5 4.78v.22H2v-.22A1.5 1.5 0 013 3.28h3.28L5.22 2.22A.5.5 0 004.87 2H3a.5.5 0 00-.5.5V3z"/>
        <path d="M1.5 5h13l-1.5 8.5a1 1 0 01-1 .86H4a1 1 0 01-1-.86L1.5 5z"/>
      </svg>
    </span>`;
  }
  return `<span class="file-tree__icon file-tree__icon--folder">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 3A1.5 1.5 0 013 1.5h2.87a.5.5 0 01.35.15l1.06 1.06A1.5 1.5 0 008.34 3.15H13A1.5 1.5 0 0114.5 4.65V12.5A1.5 1.5 0 0113 14H3A1.5 1.5 0 011.5 12.5V3z"/>
    </svg>
  </span>`;
}

function getFileIcon(fileType) {
  switch (fileType) {
    case 'tsx':
    case 'ts':
      return `<span class="file-tree__icon file-tree__icon--ts">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" fill="#3178c6"/>
          <text x="8" y="11" font-size="8" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">TS</text>
        </svg>
      </span>`;
    case 'json':
      return `<span class="file-tree__icon file-tree__icon--json">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <text x="8" y="12" font-size="11" fill="#f1fa8c" text-anchor="middle" font-family="monospace">{}</text>
        </svg>
      </span>`;
    case 'md':
      return `<span class="file-tree__icon file-tree__icon--md">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="3" width="14" height="10" rx="1" stroke="#519aba" stroke-width="1.5" fill="none"/>
          <text x="8" y="11" font-size="7" font-weight="bold" fill="#519aba" text-anchor="middle" font-family="sans-serif">M↓</text>
        </svg>
      </span>`;
    case 'pdf':
      return `<span class="file-tree__icon file-tree__icon--pdf">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 1h6l4 4v10H4V1z" fill="#e8384f"/>
          <path d="M10 1l4 4h-4V1z" fill="#b22d3b"/>
          <text x="9" y="12.5" font-size="5" font-weight="700" fill="white" text-anchor="middle" font-family="sans-serif">PDF</text>
        </svg>
      </span>`;
    case 'image':
      return `<span class="file-tree__icon file-tree__icon--image">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="14" height="14" rx="2" stroke="#bd93f9" stroke-width="1" fill="none"/>
          <circle cx="5" cy="5" r="1.5" fill="#bd93f9"/>
          <path d="M1 12l4-4 3 3 2-2 5 5H1z" fill="#bd93f9" opacity="0.6"/>
        </svg>
      </span>`;
    default:
      return `<span class="file-tree__icon file-tree__icon--config">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 1h6l4 4v10H4V1z" stroke="#6272a4" stroke-width="1" fill="none"/>
        </svg>
      </span>`;
  }
}

function renderIndent(depth) {
  let html = '<span class="file-tree__indent">';
  for (let i = 0; i < depth; i++) {
    html += '<span class="file-tree__indent-guide"></span>';
  }
  html += '</span>';
  return html;
}

function renderNode(node, depth = 0) {
  // Skip nodes gated by a config flag
  if (node.visibleWhen && !CONFIG[node.visibleWhen]) {
    return '';
  }

  if (node.type === 'root') {
    return node.children.map(child => renderNode(child, depth)).join('');
  }

  if (node.type === 'folder') {
    const isOpen = node.open !== false;
    const chevronClass = `file-tree__chevron ${isOpen ? 'open' : ''}`;
    const childrenClass = `file-tree__children ${isOpen ? 'open' : ''}`;

    let html = `
      <li>
        <div class="file-tree__item file-tree__item--folder" data-folder="${node.name}">
          ${renderIndent(depth)}
          <span class="${chevronClass}">›</span>
          ${getFolderIcon(isOpen)}
          <span class="file-tree__name">${node.name}</span>
        </div>
        <ul class="${childrenClass}">
          ${node.children ? node.children.map(c => renderNode(c, depth + 1)).join('') : ''}
        </ul>
      </li>
    `;
    return html;
  }

  // File
  const isActive = node.page === activeFileId;
  const clickable = node.page ? `data-page="${node.page}" data-filename="${node.name}" data-filetype="${node.fileType}"` : '';

  return `
    <li>
      <div class="file-tree__item ${isActive ? 'active' : ''} ${node.page ? 'clickable' : ''}" ${clickable}>
        ${renderIndent(depth)}
        <span class="file-tree__chevron hidden">›</span>
        ${getFileIcon(node.fileType)}
        <span class="file-tree__name">${node.name}</span>
      </div>
    </li>
  `;
}

export function initExplorer(treeData, fileClickCallback) {
  onFileClick = fileClickCallback;
  const container = document.querySelector('.file-tree');
  if (!container) return;

  container.innerHTML = renderNode(treeData);

  // Folder toggle handlers
  container.querySelectorAll('.file-tree__item--folder').forEach(el => {
    el.addEventListener('click', () => {
      const chevron = el.querySelector('.file-tree__chevron');
      const children = el.nextElementSibling;
      const folderIcon = el.querySelector('.file-tree__icon');

      if (chevron) chevron.classList.toggle('open');
      if (children) children.classList.toggle('open');

      // Swap folder icon
      if (folderIcon) {
        const isNowOpen = chevron?.classList.contains('open');
        folderIcon.outerHTML = getFolderIcon(isNowOpen);
      }
    });
  });

  // File click handlers
  container.querySelectorAll('.file-tree__item[data-page]').forEach(el => {
    el.addEventListener('click', () => {
      const page = el.dataset.page;
      const filename = el.dataset.filename;
      const filetype = el.dataset.filetype;
      if (page && onFileClick) {
        onFileClick(page, filename, filetype);
      }
    });
  });
}

export function setActiveFile(pageId) {
  activeFileId = pageId;
  // Update active state in tree
  document.querySelectorAll('.file-tree__item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });
}
