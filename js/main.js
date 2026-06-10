/* Lsilense Blog — Shared JS */
(function(){
'use strict';

// Theme
function initTheme(){
  const saved=localStorage.getItem('blog-theme');
  const prefersDark=window.matchMedia('(prefers-color-scheme:dark)').matches;
  const theme=saved||(prefersDark?'dark':'light');
  document.documentElement.setAttribute('data-theme',theme);
  updateIcon(theme);
}
function toggleTheme(){
  const c=document.documentElement.getAttribute('data-theme');
  const n=c==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',n);
  localStorage.setItem('blog-theme',n);
  updateIcon(n);
}
function updateIcon(theme){
  const btn=document.getElementById('theme-btn');
  if(!btn)return;
  btn.innerHTML=theme==='dark'
    ?'<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 1zm0 10a3 3 0 100-6 3 3 0 000 6zm5.657-7.657a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.061-1.06l1.06-1.061a.75.75 0 011.06 0zM15 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0115 8zm-3.464 4.596a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 01-1.061-1.06l1.06-1.061a.75.75 0 011.06 0zM8 13.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zm-4.596-2.904a.75.75 0 011.061 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.062-1.06a.75.75 0 010-1.061zM2.25 8a.75.75 0 01-.75.75H0a.75.75 0 010-1.5h1.5A.75.75 0 012.25 8zm1.154-4.596a.75.75 0 011.061 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.062-1.06a.75.75 0 010-1.061z"/></svg>'
    :'<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 8a6.5 6.5 0 016.4-6.5 6.5 6.5 0 106.1 10.3A7.02 7.02 0 011.5 8z"/></svg>';
}

// Mobile menu
function toggleMenu(){document.getElementById('nav-links').classList.toggle('open')}

// Nav scroll
function onScroll(){const n=document.querySelector('nav');if(n)n.classList.toggle('scrolled',window.scrollY>20)}

// Init
document.addEventListener('DOMContentLoaded',function(){
  initTheme();
  var tb=document.getElementById('theme-btn');if(tb)tb.addEventListener('click',toggleTheme);
  var mb=document.getElementById('mobile-btn');if(mb)mb.addEventListener('click',toggleMenu);
  var nl=document.getElementById('nav-links');if(nl)nl.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nl.classList.remove('open')})});
  window.addEventListener('scroll',onScroll);
});

})();