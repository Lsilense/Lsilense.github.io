/* ============================================
   GitHub Blog - JavaScript
   Dynamic post loading, filtering, and more
   ============================================ */

(function () {
  'use strict';

  // --- State ---
  let posts = [];
  let currentFilter = { tag: null, search: '' };
  let debounceTimer = null;

  // --- DOM References ---
  const postsContainer = document.getElementById('posts-container');
  const postCount = document.getElementById('post-count');
  const searchInput = document.getElementById('search-input');
  const tagFilters = document.getElementById('tag-filters');
  const sidebarTags = document.getElementById('sidebar-tags');
  const recentPosts = document.getElementById('recent-posts');
  const postModal = document.getElementById('post-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalTags = document.getElementById('modal-tags');
  const modalBody = document.getElementById('modal-body');
  const modalFooter = document.getElementById('modal-footer');
  const themeToggle = document.getElementById('theme-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  const statPosts = document.getElementById('stat-posts');
  const statTags = document.getElementById('stat-tags');

  // --- Theme ---
  function initTheme() {
    const saved = localStorage.getItem('blog-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('blog-theme', next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark'
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 1zm0 10a3 3 0 100-6 3 3 0 000 6zm5.657-7.657a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.061-1.06l1.06-1.061a.75.75 0 011.06 0zM15 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0115 8zm-3.464 4.596a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.061-1.06l1.06-1.061a.75.75 0 011.06 0zM8 13.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zm-4.596-2.904a.75.75 0 011.061 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.062-1.06a.75.75 0 010-1.061zM2.25 8a.75.75 0 01-.75.75H0a.75.75 0 010-1.5h1.5A.75.75 0 012.25 8zm1.154-4.596a.75.75 0 011.061 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.062-1.06a.75.75 0 010-1.061z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 8a6.5 6.5 0 016.4-6.5 6.5 6.5 0 106.1 10.3A7.02 7.02 0 011.5 8z"/></svg>';
    }
  }

  // --- Utility ---
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', opts);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getAllTags(posts) {
    const tagSet = new Set();
    posts.forEach(p => p.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }

  // --- Load Posts ---
  async function loadPosts() {
    postsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p style="margin-top:8px">Loading posts...</p></div>';

    try {
      const res = await fetch('posts.json');
      if (!res.ok) throw new Error('Failed to load posts');
      posts = await res.json();
      renderAll();
    } catch (err) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No posts yet</h3>
          <p>Check back soon for new content!</p>
        </div>`;
      console.error('Error loading posts:', err);
    }
  }

  // --- Render ---
  function renderAll() {
    renderTagFilters();
    renderSidebarTags();
    renderRecentPosts();
    renderPosts();
    updateStats();
  }

  function renderPosts() {
    const filtered = getFilteredPosts();

    postCount.textContent = `${filtered.length} post${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No posts found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>`;
      return;
    }

    postsContainer.innerHTML = filtered.map((post, index) => `
      <article class="post-card" data-post-id="${escapeHtml(post.id)}" style="animation-delay: ${index * 0.05}s">
        <div class="post-card-header">
          <span class="post-date">
            <span class="post-date-icon">📅</span>
            ${formatDate(post.date)}
          </span>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="post-tags">
          ${post.tags.map(t => `<span class="post-tag" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</span>`).join('')}
        </div>
      </article>
    `).join('');

    // Click handler for post cards
    document.querySelectorAll('.post-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.postId;
        const post = posts.find(p => p.id === id);
        if (post) openPostModal(post);
      });
    });

    // Click handler for tags inside post cards
    document.querySelectorAll('.post-card .post-tag').forEach(tagEl => {
      tagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = tagEl.dataset.tag;
        setActiveTagFilter(tag);
      });
    });
  }

  function renderTagFilters() {
    const allTags = getAllTags(posts);
    tagFilters.innerHTML = `
      <button class="tag-filter ${!currentFilter.tag ? 'active' : ''}" data-tag="">All</button>
      ${allTags.map(t => `
        <button class="tag-filter ${currentFilter.tag === t ? 'active' : ''}" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>
      `).join('')}
    `;

    tagFilters.querySelectorAll('.tag-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        setActiveTagFilter(tag || null);
      });
    });
  }

  function renderSidebarTags() {
    const allTags = getAllTags(posts);
    sidebarTags.innerHTML = allTags.map(t => `
      <span class="sidebar-tag" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</span>
    `).join('');

    sidebarTags.querySelectorAll('.sidebar-tag').forEach(el => {
      el.addEventListener('click', () => {
        setActiveTagFilter(el.dataset.tag);
      });
    });
  }

  function renderRecentPosts() {
    const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    recentPosts.innerHTML = sorted.map(p => `
      <div class="sidebar-recent-item">
        <a href="#" data-post-id="${escapeHtml(p.id)}">${escapeHtml(p.title)}</a>
        <div class="recent-date">${formatDate(p.date)}</div>
      </div>
    `).join('');

    recentPosts.querySelectorAll('a[data-post-id]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const post = posts.find(p => p.id === a.dataset.postId);
        if (post) openPostModal(post);
      });
    });
  }

  function updateStats() {
    if (statPosts) statPosts.textContent = posts.length;
    if (statTags) statTags.textContent = getAllTags(posts).length;
  }

  // --- Filtering ---
  function getFilteredPosts() {
    return posts.filter(post => {
      if (currentFilter.tag && !post.tags.includes(currentFilter.tag)) return false;
      if (currentFilter.search) {
        const q = currentFilter.search.toLowerCase();
        return post.title.toLowerCase().includes(q) ||
               post.excerpt.toLowerCase().includes(q) ||
               post.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }

  function setActiveTagFilter(tag) {
    currentFilter.tag = tag;
    searchInput.value = '';
    currentFilter.search = '';
    renderAll();
  }

  function handleSearch(value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentFilter.search = value;
      currentFilter.tag = null;
      renderAll();
    }, 250);
  }

  // --- Modal ---
  function openPostModal(post) {
    modalTitle.textContent = post.title;
    modalDate.innerHTML = `📅 ${formatDate(post.date)}`;
    modalTags.innerHTML = post.tags.map(t =>
      `<span class="post-tag">${escapeHtml(t)}</span>`
    ).join('');

    // Render content with markdown-like code formatting
    modalBody.innerHTML = post.content;

    // Copy URL for sharing
    modalFooter.querySelector('.share-link:first-child').onclick = () => {
      const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
      navigator.clipboard.writeText(url).then(() => {
        const btn = modalFooter.querySelector('.share-link:first-child');
        const orig = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = orig; }, 2000);
      });
    };

    // Update "View on GitHub" link
    modalFooter.querySelector('.share-link:last-child').addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`https://github.com/Lsilense`, '_blank');
    });

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    history.pushState(null, '', `?post=${post.id}`);
  }

  function closePostModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    history.pushState(null, '', window.location.pathname);
  }

  // --- Mobile Menu ---
  function toggleMobileMenu() {
    navLinks.classList.toggle('mobile-open');
  }

  // --- Keyboard ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closePostModal();
    }
  });

  // Backdrop click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closePostModal();
  });

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // Theme toggle
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Mobile menu
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
    });

    // Search
    if (searchInput) {
      searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // Modal close
    if (modalClose) modalClose.addEventListener('click', closePostModal);

    // Load posts
    loadPosts();

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      if (modalOverlay.classList.contains('active')) {
        closePostModal();
      }
    });

    // Handle post URL param on load
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    if (postId) {
      // Wait for posts to load then open
      const checkPost = setInterval(() => {
        const post = posts.find(p => p.id === postId);
        if (post) {
          clearInterval(checkPost);
          openPostModal(post);
        }
      }, 200);
      setTimeout(() => clearInterval(checkPost), 10000); // timeout
    }
  });

})();
