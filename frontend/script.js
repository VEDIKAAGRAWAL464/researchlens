/* ═══════════════════════════════════════════════════
   RESEARCH HUB — script.js
   All UI logic with mock data (no backend needed)
═══════════════════════════════════════════════════ */

'use strict';

// ── State ─────────────────────────────────────────
const state = {
  currentPage: 'home',
  searchQuery: '',
  searchOffset: 0,
  searchTotal: 0,
  savedPapers: JSON.parse(localStorage.getItem('savedPapers') || '[]'),
  searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
  isLoading: false,
  theme: localStorage.getItem('theme') || 'dark',
  paidPlatforms: [],
  paidPapers: [],
};

// ── Mock paper data (will be replaced by real API) ─
const MOCK_PAPERS = [
  {
    paperId: 'p001',
    title: 'Attention Is All You Need',
    authors: [{ name: 'Ashish Vaswani' }, { name: 'Noam Shazeer' }, { name: 'Niki Parmar' }],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    year: 2017,
    citationCount: 95420,
    venue: 'NeurIPS',
    isOpenAccess: true,
    url: 'https://arxiv.org/abs/1706.03762',
  },
  {
    paperId: 'p002',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: [{ name: 'Jacob Devlin' }, { name: 'Ming-Wei Chang' }, { name: 'Kenton Lee' }],
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
    year: 2019,
    citationCount: 78340,
    venue: 'NAACL',
    isOpenAccess: true,
    url: 'https://arxiv.org/abs/1810.04805',
  },
  {
    paperId: 'p003',
    title: 'Language Models are Few-Shot Learners',
    authors: [{ name: 'Tom B. Brown' }, { name: 'Benjamin Mann' }, { name: 'Nick Ryder' }],
    abstract: 'We demonstrate that scaling language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches. GPT-3, an autoregressive language model with 175 billion parameters, achieves strong performance on many NLP datasets.',
    year: 2020,
    citationCount: 34210,
    venue: 'NeurIPS',
    isOpenAccess: true,
    url: 'https://arxiv.org/abs/2005.14165',
  },
  {
    paperId: 'p004',
    title: 'Deep Residual Learning for Image Recognition',
    authors: [{ name: 'Kaiming He' }, { name: 'Xiangyu Zhang' }, { name: 'Shaoqing Ren' }],
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs.',
    year: 2016,
    citationCount: 112500,
    venue: 'CVPR',
    isOpenAccess: false,
    url: 'https://arxiv.org/abs/1512.03385',
  },
  {
    paperId: 'p005',
    title: 'Climate change and its impacts on human health',
    authors: [{ name: 'Anthony Costello' }, { name: 'Mustafa Abbas' }, { name: 'Adriana Allen' }],
    abstract: 'Climate change is the biggest global health threat of the 21st century. Effects of climate change on health will affect most populations in the next decades and put the lives of billions of people at increased risk. During this century, earth\'s average surface temperature rises are likely to exceed the safe limit of 2°C above preindustrial average temperature.',
    year: 2009,
    citationCount: 6820,
    venue: 'The Lancet',
    isOpenAccess: false,
    url: '#',
  },
  {
    paperId: 'p006',
    title: 'CRISPR-Cas9 for medical genetic screens: applications and future perspectives',
    authors: [{ name: 'Feng Zhang' }, { name: 'Le Cong' }, { name: 'Simona Lotfy' }],
    abstract: 'The CRISPR-Cas9 system has revolutionized genome editing by providing a simple, efficient, and versatile tool for precise genetic modifications. Recent advances have expanded its applications in medical genetics, enabling high-throughput functional screens and therapeutic approaches for genetic diseases.',
    year: 2021,
    citationCount: 3450,
    venue: 'Nature Reviews Genetics',
    isOpenAccess: true,
    url: '#',
  },
];

// Mock AI summaries
const MOCK_SUMMARIES = {
  default: {
    summary: "This paper presents groundbreaking research that advances the current state of knowledge in its field. The authors propose novel methodologies and demonstrate significant improvements over existing approaches through rigorous experimentation.",
    keyPoints: [
      "Introduces a novel approach that outperforms previous state-of-the-art methods",
      "Demonstrates strong empirical results across multiple benchmark datasets",
      "Provides theoretical foundations to explain the observed improvements",
      "Opens new research directions for future exploration in this domain",
      "Has broad practical applications in real-world scenarios",
    ],
    methodology: "The researchers employed a combination of quantitative experiments and ablation studies to validate their approach, using established benchmark datasets for fair comparison.",
    limitations: "The approach may require significant computational resources, and performance on out-of-distribution data has not been fully characterized.",
  }
};

// ── DOM refs ──────────────────────────────────────
const $ = (id) => document.getElementById(id);

const dom = {
  navbar: $('navbar'),
  themeToggle: $('themeToggle'),
  menuBtn: $('menuBtn'),
  mobileMenu: $('mobileMenu'),
  searchInput: $('searchInput'),
  searchBtn: $('searchBtn'),
  searchBox: $('searchBox'),
  suggestions: $('suggestions'),
  scrollHint: $('scrollHint'),
  contentSection: $('contentSection'),
  resultsHeader: $('resultsHeader'),
  resultsMeta: $('resultsMeta'),
  skeletons: $('skeletons'),
  errorState: $('errorState'),
  errorMsg: $('errorMsg'),
  emptyState: $('emptyState'),
  papersGrid: $('papersGrid'),
  pagination: $('pagination'),
  prevBtn: $('prevBtn'),
  nextBtn: $('nextBtn'),
  pageInfo: $('pageInfo'),
  welcomeState: $('welcomeState'),
  clearSearch: $('clearSearch'),
  savedPapersGrid: $('savedPapersGrid'),
  savedCount: $('savedCount'),
  emptyLibrary: $('emptyLibrary'),
  historyList: $('historyList'),
  emptyHistory: $('emptyHistory'),
  modalOverlay: $('modalOverlay'),
  modal: $('modal'),
  modalClose: $('modalClose'),
  modalTitle: $('modalTitle'),
  modalBody: $('modalBody'),
  toast: $('toast'),
};

// ══════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.theme = theme;
  localStorage.setItem('theme', theme);
}

applyTheme(state.theme);

dom.themeToggle.addEventListener('click', () => {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
});

// ══════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════
function showPage(page) {
  // Hide all pages

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link, .mobile-link').forEach(l => l.classList.remove('active'));

  // Show target
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');

  // Highlight nav
  document.querySelectorAll(`[data-page="${page}"]`).forEach(l => l.classList.add('active'));

  state.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'saved') renderSavedPapers();
  if (page === 'history') renderHistory();
}

// Nav link clicks
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(link.dataset.page);
    // Close mobile menu
    dom.mobileMenu.classList.remove('open');
  });
});

// Mobile menu
dom.menuBtn.addEventListener('click', () => {
  dom.mobileMenu.classList.toggle('open');
});

// ══════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════
function triggerSearch(query) {
  if (!query.trim()) return;
  state.searchQuery = query.trim();
  state.searchOffset = 0;
  dom.searchInput.value = query;
  hideSuggestions();
  performSearch();
}

// ── Normalize backend response to frontend card format ────────
function normalizePaper(paper) {
  // Derive PDF URL from arXiv link if pdfUrl is missing
  let pdfUrl = paper.pdfUrl || null;
  if (!pdfUrl) {
    const link = paper.link || paper.llink || "";
    if (link.includes("arxiv.org/abs/")) {
      pdfUrl = link.replace("arxiv.org/abs/", "arxiv.org/pdf/") + ".pdf";
    }
  }
  return {
    paperId: paper.paperId || paper.title,
    title: paper.title || "Untitled",
    authors: (paper.authors || []).map(a =>
      typeof a === "string" ? { name: a } : a
    ),
    year: paper.year || "N/A",
    abstract: paper.abstract || "Abstract not available.",
    citationCount: paper.citationCount || 0,
    url: paper.link || paper.llink || "#",
    pdfUrl: pdfUrl,
    source: paper.source || "Unknown",
    isOpenAccess: paper.accessType === 'paid' ? false : true,
    venue: paper.source || "",
  };
}

async function performSearch() {
  if (!state.searchQuery) return;
  state.isLoading = true;

  showResultsView();
  showSkeletons();

  // Save to history
  saveToHistory(state.searchQuery);

  try {
    const response = await fetch(
      `${CONFIG.BACKEND_URL}/research-search?q=${encodeURIComponent(state.searchQuery)}&limit=10`
    );

    if (!response.ok) throw new Error("Search request failed");

    const data = await response.json();
    const rawPapers = data.papers || data;
    const results = rawPapers.map(normalizePaper);

    // Store paid platforms for display
    state.paidPlatforms = data.paidPlatforms || [];
    state.paidPapers = data.paidPapers || [];

    state.searchTotal = results.length;
    state.isLoading = false;

    hideSkeletons();

    if (results.length === 0) {
      showEmptyState();
    } else {
      const page = results.slice(state.searchOffset, state.searchOffset + 10);
      showResults(page, results.length);
      showPaidPlatforms(state.paidPlatforms);
      if (state.paidPapers.length > 0) {
        showPaidPaperCards(state.paidPapers);
      }
    }

  } catch (error) {
    console.error("Search error:", error.message);
    state.isLoading = false;
    hideSkeletons();
    dom.errorState.style.display = 'block';
    dom.errorMsg.textContent = "Search failed. Make sure the backend is running on port 5000.";
  }
}

function showResultsView() {
  dom.welcomeState.style.display = 'none';
  dom.resultsHeader.style.display = 'flex';
  dom.scrollHint.style.display = 'none';
  dom.errorState.style.display = 'none';
  dom.emptyState.style.display = 'none';
  dom.papersGrid.innerHTML = '';
  dom.pagination.style.display = 'none';
}

function showSkeletons() {
  dom.skeletons.style.display = 'grid';
}

function hideSkeletons() {
  dom.skeletons.style.display = 'none';
}

function showPaidPlatforms(platforms) {
  // Kept minimal — just shows a small footer note
  const existing = document.getElementById('paidPlatformsSection');
  if (existing) existing.remove();
}

function showPaidPaperCards(paidPapers) {
  const existing = document.getElementById('paidPapersSection');
  if (existing) existing.remove();
  if (!paidPapers || paidPapers.length === 0) return;

  const section = document.createElement('div');
  section.id = 'paidPapersSection';
  section.style.cssText = 'margin-top: 32px;';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex; align-items:center; gap:10px; margin-bottom:16px;';
  header.innerHTML = `
    <span style="font-size:13px; font-weight:700; color:#374151; letter-spacing:0.5px;">
      🔒 PAPERS FROM PAID PLATFORMS
    </span>
    <span style="font-size:11px; color:#9ca3af;">
      Available via publisher — click card to access
    </span>
  `;
  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'papers-grid';
  paidPapers.forEach((paper, i) => {
    const card = createPaperCard(paper);
    card.style.animationDelay = `${i * 0.06}s`;
    card.style.animation = 'fadeUp 0.4s ease forwards';
    card.style.opacity = '0';
    // Make the whole card clickable to the paper URL
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (!e.target.closest('button') && paper.url) {
        window.open(paper.url, '_blank', 'noopener,noreferrer');
      }
    });
    grid.appendChild(card);
  });

  section.appendChild(grid);
  dom.papersGrid.after(section);
}

function showResults(papers, total) {
  dom.resultsMeta.innerHTML = `<span>${total.toLocaleString()}</span> papers for <em>"${state.searchQuery}"</em>`;
  dom.papersGrid.innerHTML = '';

  papers.forEach((paper, i) => {
    const card = createPaperCard(paper);
    card.style.animationDelay = `${i * 0.06}s`;
    card.style.animation = 'fadeUp 0.4s ease forwards';
    card.style.opacity = '0';
    dom.papersGrid.appendChild(card);
  });

  // Pagination
  const totalPages = Math.ceil(total / 10);
  const currentPage = Math.floor(state.searchOffset / 10) + 1;

  if (total > 10) {
    dom.pagination.style.display = 'flex';
    dom.prevBtn.disabled = state.searchOffset === 0;
    dom.nextBtn.disabled = papers.length < 10;
    dom.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
}

function showEmptyState() {
  dom.emptyState.style.display = 'block';
  dom.papersGrid.innerHTML = '';
}

function clearSearch() {
  state.searchQuery = '';
  state.searchOffset = 0;
  dom.searchInput.value = '';
  dom.resultsHeader.style.display = 'none';
  dom.skeletons.style.display = 'none';
  dom.errorState.style.display = 'none';
  dom.emptyState.style.display = 'none';
  dom.papersGrid.innerHTML = '';
  dom.pagination.style.display = 'none';
  dom.welcomeState.style.display = 'block';
  dom.scrollHint.style.display = 'flex';
}

// Search button
dom.searchBtn.addEventListener('click', () => {
  triggerSearch(dom.searchInput.value);
});

// Enter key
dom.searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') triggerSearch(dom.searchInput.value);
});

// Clear button
dom.clearSearch.addEventListener('click', clearSearch);

// Pagination
dom.prevBtn.addEventListener('click', () => {
  state.searchOffset = Math.max(0, state.searchOffset - 10);
  performSearch();
  dom.contentSection.scrollIntoView({ behavior: 'smooth' });
});

dom.nextBtn.addEventListener('click', () => {
  state.searchOffset += 10;
  performSearch();
  dom.contentSection.scrollIntoView({ behavior: 'smooth' });
});

// ══════════════════════════════════════════════════
// SUGGESTIONS
// ══════════════════════════════════════════════════
dom.searchInput.addEventListener('focus', () => {
  if (!dom.searchInput.value) showSuggestions();
});

dom.searchInput.addEventListener('input', () => {
  if (!dom.searchInput.value) showSuggestions();
  else hideSuggestions();
});

dom.searchInput.addEventListener('blur', () => {
  setTimeout(hideSuggestions, 200);
});

document.querySelectorAll('.suggestion-item').forEach(item => {
  item.addEventListener('mousedown', (e) => {
    e.preventDefault();
    triggerSearch(item.dataset.query);
  });
});

function showSuggestions() { dom.suggestions.classList.add('visible'); }
function hideSuggestions() { dom.suggestions.classList.remove('visible'); }

// ══════════════════════════════════════════════════
// PAPER CARD
// ══════════════════════════════════════════════════
function createPaperCard(paper, variant = 'search') {
  const isSaved = state.savedPapers.some(p => p.paperId === paper.paperId);
  const authorsText = paper.authors?.slice(0, 3).map(a => a.name).join(', ') +
    (paper.authors?.length > 3 ? ` +${paper.authors.length - 3} more` : '');

  const card = document.createElement('div');
  card.className = 'paper-card';
  card.innerHTML = `
    <div class="paper-card-top">
      <div class="paper-tags">
        ${paper.year ? `<span class="tag tag-year">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${paper.year}
        </span>` : ''}
        ${paper.accessType === 'paid'
      ? `<span class="tag" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;">
      🔒 Paid
    </span>`
      : paper.isOpenAccess
        ? `<span class="tag tag-open">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      Open Access
    </span>`
        : ''
      }
      </div>
      <div class="paper-actions">
        ${variant === 'search' ? `
          <button class="icon-btn save-btn ${isSaved ? 'saved' : ''}" title="${isSaved ? 'Saved' : 'Save to library'}" data-paper-id="${paper.paperId}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
        ` : `
          <button class="icon-btn delete-btn" title="Remove from library" data-paper-id="${paper.paperId}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        `}
        ${paper.url && paper.url !== '#' ? `
          <a href="${paper.url}" target="_blank" rel="noopener noreferrer">
            <button class="icon-btn" title="Open paper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </a>
        ` : ''}
      </div>
    </div>

    <span style="display:inline-block; margin-bottom:8px; padding:2px 10px; border-radius:20px; font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; background:#e0e7ff; color:#4338ca;">${paper.source || 'Unknown'}</span>
    <h3 class="paper-title">${paper.title}</h3>

    <div class="paper-authors">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <span>${authorsText || 'Unknown authors'}</span>
    </div>

    <p class="paper-abstract">${paper.abstract || 'No abstract available.'}</p>

    <div class="paper-footer">
      <div class="citation-count">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${(paper.citationCount || 0).toLocaleString()} citations
      </div>
      <button class="btn-summary" data-paper-id="${paper.paperId}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        AI Summary
      </button>
    </div>
  `;

  // Save button
  const saveBtn = card.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => toggleSave(paper, saveBtn));
  }

  // Delete button
  const deleteBtn = card.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => removeSaved(paper.paperId));
  }

  // Summary button
  const summaryBtn = card.querySelector('.btn-summary');
  summaryBtn.addEventListener('click', () => openSummaryModal(paper));

  return card;
}

// ══════════════════════════════════════════════════
// SAVE / LIBRARY
// ══════════════════════════════════════════════════
function toggleSave(paper, btn) {
  const idx = state.savedPapers.findIndex(p => p.paperId === paper.paperId);

  if (idx === -1) {
    state.savedPapers.push(paper);
    btn.classList.add('saved');
    btn.querySelector('svg').setAttribute('fill', 'currentColor');
    btn.title = 'Saved';
    showToast('✓ Paper saved to library');
  } else {
    state.savedPapers.splice(idx, 1);
    btn.classList.remove('saved');
    btn.querySelector('svg').setAttribute('fill', 'none');
    btn.title = 'Save to library';
    showToast('Removed from library');
  }

  localStorage.setItem('savedPapers', JSON.stringify(state.savedPapers));
}

function removeSaved(paperId) {
  state.savedPapers = state.savedPapers.filter(p => p.paperId !== paperId);
  localStorage.setItem('savedPapers', JSON.stringify(state.savedPapers));
  renderSavedPapers();
  showToast('Removed from library');
}

function renderSavedPapers() {
  const count = state.savedPapers.length;
  dom.savedCount.textContent = `${count} saved paper${count !== 1 ? 's' : ''}`;

  if (count === 0) {
    dom.emptyLibrary.style.display = 'block';
    dom.savedPapersGrid.innerHTML = '';
    return;
  }

  dom.emptyLibrary.style.display = 'none';
  dom.savedPapersGrid.innerHTML = '';

  state.savedPapers.forEach((paper, i) => {
    const card = createPaperCard(paper, 'saved');
    card.style.animationDelay = `${i * 0.06}s`;
    card.style.animation = 'fadeUp 0.4s ease forwards';
    card.style.opacity = '0';
    dom.savedPapersGrid.appendChild(card);
  });
}

// ══════════════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════════════
function saveToHistory(query) {
  // Don't duplicate
  state.searchHistory = state.searchHistory.filter(h => h.query !== query);
  state.searchHistory.unshift({
    query,
    timestamp: new Date().toISOString(),
    resultCount: null,
  });
  // Keep last 20
  state.searchHistory = state.searchHistory.slice(0, 20);
  localStorage.setItem('searchHistory', JSON.stringify(state.searchHistory));
}

function renderHistory() {
  if (state.searchHistory.length === 0) {
    dom.emptyHistory.style.display = 'block';
    dom.historyList.innerHTML = '';
    return;
  }

  dom.emptyHistory.style.display = 'none';
  dom.historyList.innerHTML = '';

  state.searchHistory.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.style.animationDelay = `${i * 0.05}s`;
    div.style.animation = 'fadeUp 0.4s ease forwards';
    div.style.opacity = '0';

    const date = new Date(item.timestamp);
    const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
      <div class="history-item-left">
        <div class="history-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div>
          <div class="history-query">${item.query}</div>
          <div class="history-meta">${timeStr}</div>
        </div>
      </div>
      <button class="history-search-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        Search again
      </button>
    `;

    div.querySelector('.history-search-btn').addEventListener('click', () => {
      showPage('home');
      setTimeout(() => triggerSearch(item.query), 100);
    });

    dom.historyList.appendChild(div);
  });
}

// ══════════════════════════════════════════════════
// AI SUMMARY MODAL
// ══════════════════════════════════════════════════
function openSummaryModal(paper) {

  dom.modalTitle.textContent = paper.title;
  dom.modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  dom.modalBody.innerHTML = `
    <div class="modal-loading">
      <div class="modal-loading-text">
        <div class="spinner"></div>
        Analyzing paper content...
      </div>
      <div class="modal-skeleton" style="width:75%; margin-bottom:0.5rem"></div>
      <div class="modal-skeleton" style="width:100%; margin-bottom:0.5rem"></div>
      <div class="modal-skeleton" style="width:85%"></div>
    </div>
  `;

  // POST abstract to backend — avoids URL length limits for long abstracts
  fetch(`${CONFIG.BACKEND_URL}/summarize-abstract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ abstract: paper.abstract, title: paper.title })
  })
    .then(res => {
      if (!res.ok) throw new Error("Summary request failed");
      return res.json();
    })
    .then(data => {
      const insights = data.insights || {};

      // Build a rich multi-sentence summary from multiple fields instead of just one field
      const parts = [];
      const richSummary = data.summary || "AI summary could not be generated.";

      renderSummaryContent(paper, insights, richSummary);
    })
    .catch(error => {
      console.error("Summary error:", error.message);
      renderSummaryContent(paper, {}, "");
    });
}

function renderSummaryContent(paper, insights, summaryText) {
  const val = (key) => {
    const v = insights[key];
    return (v && v !== "Not specified" && v.trim() !== "") ? v : null;
  };

  const confidence = insights["Insight Confidence"] || null;
  const isFallback = confidence && confidence.includes("Low");
  const confidenceColor = isFallback ? "#f87171" : (confidence === "High" ? "#4ade80" : "#facc15");

  // Aligned with Project Report mandatory sections
  const fields = [
    { label: "Problem Statement", icon: "❓", key: "Problem Statement" },
    { label: "Methodology", icon: "⚙️", key: "Methodology" },
    { label: "Contributions", icon: "💎", key: "Contributions" },
    { label: "Results", icon: "📊", key: "Results" },
    { label: "Limitations", icon: "⚠️", key: "Limitations" },
  ];

  const filledFields = fields.filter(f => val(f.key));

  dom.modalBody.innerHTML = `
    ${paper.abstract ? `
      <div class="modal-section">
        <div class="modal-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Abstract
        </div>
        <div class="modal-abstract">${paper.abstract}</div>
      </div>
    ` : ''}

    <div class="modal-section">
      <div class="modal-section-title" style="display:flex; justify-content:space-between; align-items:center;">
        <span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          AI Summary
        </span>
        ${confidence ? `<span style="font-size:11px; font-weight:600; color:${confidenceColor}; background:${confidenceColor}22; padding:2px 8px; border-radius:10px; letter-spacing:0.5px;">● ${confidence} Confidence</span>` : ''}
      </div>
      <div class="modal-summary">${summaryText || val("Problem Statement") || "AI summary could not be generated."}</div>
    </div>

    ${filledFields.length > 0 ? `
    <div class="modal-section">
      <div class="modal-section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        Structured Insights
      </div>
      <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
        ${filledFields.map(f => `
          <div style="background:var(--card-bg, rgba(255,255,255,0.04)); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 14px;">
            <div style="font-size:11px; font-weight:700; letter-spacing:0.8px; opacity:0.55; margin-bottom:5px; text-transform:uppercase;">${f.icon} ${f.label}</div>
            <div style="font-size:14px; line-height:1.5;">${val(f.key)}</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : '<div class="modal-section"><div style="opacity:0.5; font-size:13px;">No structured insights could be extracted.</div></div>'}
  `;
}

function closeModal() {
  dom.modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

dom.modalClose.addEventListener('click', closeModal);
dom.modalOverlay.addEventListener('click', (e) => {
  if (e.target === dom.modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ══════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════
let toastTimeout;
function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => dom.toast.classList.remove('show'), 2500);
}

// ══════════════════════════════════════════════════
// SCROLL EFFECTS
// ══════════════════════════════════════════════════
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    dom.navbar.style.background = state.theme === 'dark'
      ? 'rgba(7,9,15,0.95)'
      : 'rgba(244,246,251,0.96)';
  } else {
    dom.navbar.style.background = '';
  }
});

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
showPage('home');
console.log('🔬 ResearchHub frontend loaded. Ready for backend integration.');