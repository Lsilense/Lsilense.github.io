/* ============================================
   Lsilense Blog - JavaScript
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
  const heroStatPosts = document.getElementById('hero-stat-posts');
  const heroStatTags = document.getElementById('hero-stat-tags');
  const filterActive = document.getElementById('filter-active');
  const filterLabel = document.getElementById('filter-label');
  const filterClear = document.getElementById('filter-clear');

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
    return date.toLocaleDateString('zh-CN', opts);
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
    postsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p style="margin-top:8px">加载中...</p></div>';

    try {
      const res = await fetch('posts.json');
      if (!res.ok) throw new Error('Failed to load posts');
      posts = await res.json();
      renderAll();
    } catch (err) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>还没有文章</h3>
          <p>敬请期待新内容！</p>
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

    postCount.textContent = `${filtered.length} 篇`;

    if (filtered.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>没有找到相关文章</h3>
          <p>试试调整搜索或筛选条件</p>
        </div>`;
      return;
    }

    postsContainer.innerHTML = filtered.map((post, index) => `
      <article class="post-card" data-post-id="${escapeHtml(post.id)}" style="animation-delay: ${index * 0.05}s">
        <div class="post-card-header">
          <span class="post-date">📅 ${formatDate(post.date)}</span>
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
      <button class="tag-filter ${!currentFilter.tag ? 'active' : ''}" data-tag="">全部</button>
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
    const postCountNum = posts.length;
    const tagsCount = getAllTags(posts).length;

    if (statPosts) statPosts.textContent = postCountNum;
    if (statTags) statTags.textContent = tagsCount;
    if (heroStatPosts) heroStatPosts.textContent = postCountNum;
    if (heroStatTags) heroStatTags.textContent = tagsCount;
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

  // Expose filterByTag globally for feature card onclick
  window.filterByTag = function(tag) {
    setActiveTagFilter(tag);
    // Scroll to posts section
    document.querySelector('.posts-section').scrollIntoView({ behavior: 'smooth' });
  };

  function setActiveTagFilter(tag) {
    currentFilter.tag = tag;
    currentFilter.search = '';
    if (searchInput) searchInput.value = '';

    // Update active filter indicator
    if (filterActive && filterLabel) {
      if (tag) {
        filterActive.style.display = 'inline-flex';
        filterLabel.textContent = '筛选: ' + tag;
      } else {
        filterActive.style.display = 'none';
      }
    }

    renderAll();
  }

  function handleSearch(value) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentFilter.search = value;
      currentFilter.tag = null;

      // Hide filter indicator when searching
      if (filterActive) filterActive.style.display = 'none';

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

    modalBody.innerHTML = post.content;

    // Copy link button
    const shareCopy = document.getElementById('share-copy');
    if (shareCopy) {
      shareCopy.onclick = () => {
        const url = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
        navigator.clipboard.writeText(url).then(() => {
          const orig = shareCopy.textContent;
          shareCopy.textContent = '✅ 已复制!';
          setTimeout(() => { shareCopy.textContent = orig; }, 2000);
        });
      };
    }

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

  // Clear filter
  if (filterClear) {
    filterClear.addEventListener('click', () => {
      setActiveTagFilter(null);
    });
  }

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

    // Highlight active nav link on scroll
    // (simple: just update on section visibility)

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
      const checkPost = setInterval(() => {
        const post = posts.find(p => p.id === postId);
        if (post) {
          clearInterval(checkPost);
          openPostModal(post);
        }
      }, 200);
      setTimeout(() => clearInterval(checkPost), 10000);
    }
  });

})();
