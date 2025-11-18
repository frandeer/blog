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

// ========================================
// Theme Management
// ========================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
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
            mangle: false
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
        loadPost(slug);
    } else if (hash === 'about') {
        navigateToPage('about');
    } else {
        navigateToPage('home');
    }
}
