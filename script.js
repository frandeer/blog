// ========================================
// Blog Configuration
// ========================================
const BLOG_CONFIG = {
    postsDirectory: 'posts/',
    postsFile: 'posts/posts.json'
};

// ========================================
// State Management
// ========================================
let allPosts = [];
let currentPost = null;
let lastScrollTop = 0;
let scrollTimeout = null;

// ========================================
// Theme Management
// ========================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    updateHighlightTheme(savedTheme);

    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    updateHighlightTheme(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function updateHighlightTheme(theme) {
    const lightTheme = document.getElementById('highlight-light');
    const darkTheme = document.getElementById('highlight-dark');

    if (theme === 'dark') {
        lightTheme.disabled = true;
        darkTheme.disabled = false;
    } else {
        lightTheme.disabled = false;
        darkTheme.disabled = true;
    }
}

// ========================================
// Navigation
// ========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
        });
    });

    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', () => navigateToPage('home'));
}

function navigateToPage(pageName) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Show the selected page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');

    // Update URL hash and meta tags based on page
    if (pageName === 'home') {
        window.location.hash = '';
        resetMetaTags();
    } else if (pageName === 'about') {
        window.location.hash = 'about';
        resetMetaTags();
    }
    // Note: 'post' page hash is updated in loadPost()

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// Posts Loading
// ========================================
async function loadPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '<div class="loading">포스트를 불러오는 중...</div>';

    try {
        const response = await fetch(BLOG_CONFIG.postsFile);

        if (!response.ok) {
            throw new Error('포스트 목록을 불러올 수 없습니다');
        }

        const data = await response.json();
        allPosts = data.posts || [];

        if (allPosts.length === 0) {
            postsContainer.innerHTML = '<div class="loading">아직 포스트가 없습니다.</div>';
            return;
        }

        renderPosts(allPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="error">
                <p>포스트를 불러오는 중 오류가 발생했습니다.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function renderPosts(posts) {
    const postsContainer = document.getElementById('posts-container');

    const postsHTML = posts.map(post => `
        <article class="post-card" data-slug="${post.slug}">
            <div class="post-card-header">
                <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
                <div class="post-card-meta">
                    <span>📅 ${post.date}</span>
                    <span>⏱️ ${post.readTime || '5분'}</span>
                </div>
            </div>
            <p class="post-card-excerpt">${escapeHtml(post.excerpt)}</p>
            ${post.tags ? `
                <div class="post-card-tags">
                    ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </article>
    `).join('');

    postsContainer.innerHTML = postsHTML;

    // Add click listeners to post cards
    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', () => {
            const slug = card.dataset.slug;
            loadPost(slug);
        });
    });

    // 사이드바에도 글 목록 렌더링
    renderSidebarPosts(posts);
}

// ========================================
// Sidebar Posts Rendering
// ========================================
function renderSidebarPosts(posts) {
    const sidebarContainer = document.getElementById('sidebar-posts');

    if (!sidebarContainer) return;

    // 최대 10개까지만 표시
    const recentPosts = posts.slice(0, 10);

    const sidebarHTML = recentPosts.map(post => `
        <div class="sidebar-post-item" data-slug="${post.slug}">
            <div class="sidebar-post-title">${escapeHtml(post.title)}</div>
            <div class="sidebar-post-meta">
                <span class="sidebar-post-date">📅 ${post.date}</span>
                <span>⏱️ ${post.readTime || '5분'}</span>
            </div>
        </div>
    `).join('');

    sidebarContainer.innerHTML = sidebarHTML;

    // Add click listeners
    document.querySelectorAll('.sidebar-post-item').forEach(item => {
        item.addEventListener('click', () => {
            const slug = item.dataset.slug;
            loadPost(slug);
        });
    });
}

// 현재 글 활성화 표시
function updateSidebarActivePost(slug) {
    document.querySelectorAll('.sidebar-post-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.slug === slug) {
            item.classList.add('active');
        }
    });
}

// ========================================
// Single Post Loading
// ========================================
async function loadPost(slug) {
    const post = allPosts.find(p => p.slug === slug);

    if (!post) {
        console.error('Post not found:', slug);
        return;
    }

    const postContent = document.getElementById('post-content');
    postContent.innerHTML = '<div class="loading">포스트를 불러오는 중...</div>';

    try {
        const response = await fetch(`${BLOG_CONFIG.postsDirectory}${post.file}`);

        if (!response.ok) {
            throw new Error('포스트를 불러올 수 없습니다');
        }

        const markdown = await response.text();
        const html = marked.parse(markdown);

        postContent.innerHTML = `
            <div class="post-header">
                <h1 class="post-title">${escapeHtml(post.title)}</h1>
                <div class="post-meta">
                    <span>📅 ${post.date}</span>
                    <span>⏱️ ${post.readTime || '5분'}</span>
                    ${post.author ? `<span>✍️ ${escapeHtml(post.author)}</span>` : ''}
                </div>
                ${post.tags ? `
                    <div class="post-card-tags" style="margin-top: 1rem;">
                        ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="post-content">${html}</div>
        `;

        // Highlight code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        navigateToPage('post');
        currentPost = post;

        // Update URL hash for SEO and sharing
        window.location.hash = `post/${slug}`;

        // Update meta tags for SEO
        updateMetaTags(post);

        // 사이드바 활성화 표시 업데이트
        updateSidebarActivePost(slug);

    } catch (error) {
        console.error('Error loading post:', error);
        postContent.innerHTML = `
            <div class="error">
                <p>포스트를 불러오는 중 오류가 발생했습니다.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ========================================
// Utility Functions
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update meta tags for SEO
function updateMetaTags(post) {
    const baseUrl = 'https://frandeer.github.io/blog/';
    const postUrl = `${baseUrl}#post/${post.slug}`;

    // Update page title
    document.title = `${post.title} - FRANDEER DEV`;

    // Update or create meta description
    updateOrCreateMeta('name', 'description', post.excerpt);
    updateOrCreateMeta('name', 'keywords', post.tags ? post.tags.join(', ') : '');

    // Update Open Graph tags
    updateOrCreateMeta('property', 'og:title', post.title);
    updateOrCreateMeta('property', 'og:description', post.excerpt);
    updateOrCreateMeta('property', 'og:url', postUrl);
    updateOrCreateMeta('property', 'og:type', 'article');

    // Update Twitter Card tags
    updateOrCreateMeta('property', 'twitter:title', post.title);
    updateOrCreateMeta('property', 'twitter:description', post.excerpt);
    updateOrCreateMeta('property', 'twitter:url', postUrl);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.href = postUrl;
    }
}

// Helper function to update or create meta tags
function updateOrCreateMeta(attr, attrValue, content) {
    let element = document.querySelector(`meta[${attr}="${attrValue}"]`);
    if (element) {
        element.content = content;
    } else {
        element = document.createElement('meta');
        element.setAttribute(attr, attrValue);
        element.content = content;
        document.head.appendChild(element);
    }
}

// Reset meta tags to default (for home page)
function resetMetaTags() {
    document.title = 'FRANDEER DEV - 개발자 블로그';
    const baseUrl = 'https://frandeer.github.io/blog/';

    updateOrCreateMeta('name', 'description', '웹 개발, JavaScript, AI, 개발 도구에 대한 실전 경험과 통찰을 공유하는 FRANDEER의 개발자 블로그입니다. Claude Skills, React, TypeScript 등 최신 기술 트렌드를 다룹니다.');
    updateOrCreateMeta('property', 'og:title', 'FRANDEER DEV - 개발자 블로그');
    updateOrCreateMeta('property', 'og:description', '웹 개발, JavaScript, AI, 개발 도구에 대한 실전 경험과 통찰을 공유하는 FRANDEER의 개발자 블로그입니다.');
    updateOrCreateMeta('property', 'og:url', baseUrl);
    updateOrCreateMeta('property', 'og:type', 'website');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.href = baseUrl;
    }
}

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    loadPosts();

    // Configure marked.js options
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false,
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.error('Highlight error:', err);
                    }
                }
                return hljs.highlightAuto(code).value;
            }
        });
    }
});

// ========================================
// Hash-based routing (optional)
// ========================================
window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', handleHashChange);

function handleHashChange() {
    const hash = window.location.hash.slice(1);

    if (hash.startsWith('post/')) {
        const slug = hash.substring(5);
        // Only load if it's a different post
        if (!currentPost || currentPost.slug !== slug) {
            loadPost(slug);
        }
    } else if (hash === 'about') {
        navigateToPage('about');
    } else if (hash === '' || hash === 'home') {
        navigateToPage('home');
    }
}

// ========================================
// Scroll Handler - Auto Hide/Show Navbar
// ========================================
function handleScroll() {
    const navbar = document.querySelector('.navbar');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 최상단에서는 항상 표시
    if (scrollTop <= 100) {
        navbar.classList.remove('navbar-hidden');
        navbar.classList.remove('navbar-visible');
        lastScrollTop = scrollTop;
        return;
    }

    // 스크롤 방향 감지
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // 아래로 스크롤 - 숨김
        navbar.classList.add('navbar-hidden');
        navbar.classList.remove('navbar-visible');
    } else if (scrollTop < lastScrollTop) {
        // 위로 스크롤 - 표시
        navbar.classList.remove('navbar-hidden');
        navbar.classList.add('navbar-visible');
    }

    lastScrollTop = scrollTop;
}

// 스크롤 이벤트 리스너 (throttle 적용)
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }

    scrollTimeout = window.requestAnimationFrame(() => {
        handleScroll();
        toggleScrollToTopButton();
    });
}, { passive: true });

// ========================================
// Scroll to Top Button
// ========================================
function toggleScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 상단 이동 버튼 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }
});
