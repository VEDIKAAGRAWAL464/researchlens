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

function performSearch() {
  if (!state.searchQuery) return;
  state.isLoading = true;

  showResultsView();
  showSkeletons();

  // Save to history
  saveToHistory(state.searchQuery);

  // Simulate API delay (replace with real fetch later)
  setTimeout(() => {
    const results = filterMockPapers(state.searchQuery);
    state.searchTotal = results.length;
    state.isLoading = false;

    hideSkeletons();

    if (results.length === 0) {
      showEmptyState();
    } else {
      const page = results.slice(state.searchOffset, state.searchOffset + 10);
      showResults(page, results.length);
    }
  }, 900);
}

function filterMockPapers(query) {
  const q = query.toLowerCase();
  return MOCK_PAPERS.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.abstract?.toLowerCase().includes(q) ||
    p.authors.some(a => a.name.toLowerCase().includes(q)) ||
    p.venue?.toLowerCase().includes(q)
  );
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
        ${paper.isOpenAccess ? `<span class="tag tag-open">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Open Access
        </span>` : ''}
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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

  // Show loading state
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

  // Simulate AI processing delay (replace with real API call later)
  setTimeout(() => {
    const summary = MOCK_SUMMARIES.default;
    renderSummaryContent(paper, summary);
  }, 1400);
}

function renderSummaryContent(paper, summary) {
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
      <div class="modal-section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        AI Summary
      </div>
      <div class="modal-summary">${summary.summary}</div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Key Points
      </div>
      <ul class="modal-keypoints">
        ${summary.keyPoints.map((point, i) => `
          <li class="modal-keypoint" style="animation-delay:${i * 0.1}s">
            <span class="modal-keypoint-num">${i + 1}</span>
            <span>${point}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    ${summary.methodology ? `
      <div class="modal-section">
        <div class="modal-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/></svg>
          Methodology
        </div>
        <div class="modal-info-box">${summary.methodology}</div>
      </div>
    ` : ''}

    ${summary.limitations ? `
      <div class="modal-section">
        <div class="modal-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Limitations
        </div>
        <div class="modal-info-box">${summary.limitations}</div>
      </div>
    ` : ''}
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