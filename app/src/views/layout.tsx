import { html } from 'hono/html'

export const Layout = ({ children, title, user, description, keywords }: { children: any; title?: string; user?: any; description?: string; keywords?: string }) => {
  const metaDescription = description || 'Logical Learning - 테트리스처럼 차곡차곡 쌓아가는 지식. 호구낚시 방어 학습 플랫폼.'
  const metaTitle = title ? `${title} - MINI-LMS` : 'MINI-LMS | Logical Learning'
  const metaKeywords = keywords || 'programming, learning, coding, lms'

  const isLoggedIn = !!(user && user.id)

  return html`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/assets/favicon.png" />
        
        <!-- Primary Meta Tags -->
        <title>${metaTitle}</title>
        <meta name="title" content="${metaTitle}">
        <meta name="description" content="${metaDescription}">
        <meta name="keywords" content="${metaKeywords}">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:title" content="${metaTitle}">
        <meta property="og:description" content="${metaDescription}">
        <meta property="og:url" content="https://mini-lms.com/">
        <meta property="og:image" content="https://mini-lms.com/assets/favicon.png">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:title" content="${metaTitle}">
        <meta property="twitter:description" content="${metaDescription}">
        <meta property="twitter:image" content="https://mini-lms.com/assets/favicon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;600&family=Noto+Sans+KR:wght@100;300;400;500&display=swap" rel="stylesheet">
        
        <style>
          :root {
            --bg-color: #ffffff;
            --text-main: #1a1a1a;
            --text-sub: #666666;
            --accent: #2d2d2d;
            --border: #e0e0e0;
            --nav-bg: rgba(255, 255, 255, 0.9);
            --card-shadow: rgba(0, 0, 0, 0.02);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --nav-height: 60px;
          }

          [data-theme="dark"] {
            --bg-color: #121212;
            --text-main: #f5f5f5;
            --text-sub: #a0a0a0;
            --accent: #ffffff;
            --border: #2a2a2a;
            --nav-bg: rgba(18, 18, 18, 0.9);
            --card-shadow: rgba(255, 255, 255, 0.05);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Outfit', 'Noto Sans KR', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            line-height: 1.6;
            letter-spacing: -0.02em;
            transition: background-color 0.3s ease, color 0.3s ease;
            overflow-x: hidden;
          }

          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 40px;
          }

          nav {
            height: var(--nav-height);
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            background: var(--nav-bg);
            backdrop-filter: blur(10px);
            z-index: 1000;
            display: flex;
            align-items: center;
          }

          .nav-content {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .logo {
            font-size: 1.25rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            text-decoration: none;
            color: var(--text-main);
            display: flex;
            align-items: center;
          }

          .nav-links {
            display: flex;
            gap: 25px;
            list-style: none;
            align-items: center;
          }

          .nav-links a {
            text-decoration: none;
            color: var(--text-sub);
            font-size: 0.8rem;
            font-weight: 400;
            transition: var(--transition);
            letter-spacing: 0.05em;
          }

          .nav-links a:hover {
            color: var(--text-main);
          }

          .theme-toggle {
            background: none;
            border: 1px solid var(--border);
            color: var(--text-main);
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            transition: var(--transition);
            border-radius: 4px;
          }

          .theme-toggle:hover {
            border-color: var(--accent);
            background: rgba(0, 0, 0, 0.05);
          }

          [data-theme="dark"] .theme-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          [data-theme="dark"] .theme-toggle .sun { display: none; }
          html:not([data-theme="dark"]) .theme-toggle .moon { display: none; }

          .hamburger {
            display: none;
            cursor: pointer;
            background: none;
            border: none;
            padding: 8px;
            z-index: 1100;
          }

          .hamburger span {
            display: block;
            width: 22px;
            height: 1px;
            background: var(--text-main);
            margin: 5px 0;
            transition: var(--transition);
          }

          .mobile-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 100%;
            height: 100vh;
            background: var(--bg-color);
            z-index: 1050;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 30px;
            transition: var(--transition);
            padding: 40px;
            text-align: center;
          }

          .mobile-menu.active {
            right: 0;
          }

          .mobile-menu a {
            font-size: 1.8rem;
            text-decoration: none;
            color: var(--text-main);
            font-weight: 200;
            letter-spacing: 0.05em;
            padding: 10px 0;
            width: 100%;
            border-bottom: 1px solid transparent;
            transition: var(--transition);
          }
          
          .mobile-menu a:hover {
            border-bottom-color: var(--accent);
          }

          .line-btn {
            display: inline-block;
            padding: 8px 20px;
            border: 1px solid var(--accent);
            color: var(--accent);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.8rem;
            transition: var(--transition);
            background: transparent;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .line-btn:hover {
            background: var(--accent);
            color: var(--bg-color);
            transform: translateY(-1px);
          }

          .hero {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;

          }

          .tetris-wrapper {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background: var(--bg-color);
            width: 100%;
            max-width: 380px;
            justify-self: center;
          }

          .tetris-ui {
            position: absolute;
            right: -100px;
            top: 20px;
            text-align: left;
          }

          .card {
            border: 1px solid var(--border);
            padding: 25px;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: var(--bg-color);
          }

          .card:hover {
            border-color: var(--accent);
            box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.02);
            transform: translate(-3px, -3px);
          }

          .badge {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 2px 8px;
            border: 1px solid var(--border);
          }

          .badge-blue { border-color: #3b82f6; color: #3b82f6; }
          .badge-ghost { color: var(--text-sub); border-style: dashed; }

          .fade-in {
            animation: fadeIn 0.8s ease forwards;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }

          footer {
            padding: 40px 0;
            text-align: center;
            font-size: 0.75rem;
            color: var(--text-sub);
            border-top: 1px solid var(--border);
            margin-top: 60px;
          }

          /* Content Specific Styling (Prose/Markdown) */
          .prose {
             max-width: 100%;
             overflow-x: hidden;
          }
          .prose img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            border: 1px solid var(--border);
            margin: 1.5rem 0;
            display: block;
          }
          .prose video {
             max-width: 100%;
             border-radius: 8px;
             margin: 1.5rem 0;
          }

          @media (max-width: 900px) {
            .hero {
                grid-template-columns: 1fr;
                gap: 40px;
                padding: 40px 0;
                text-align: center;
            }
            .hero-text {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .tetris-ui {
                position: static;
                margin-top: 20px;
                display: flex;
                gap: 40px;
                justify-content: center;
                width: 100%;
            }
            .controls-hint {
                display: none;
            }
            .tetris-wrapper {
                flex-direction: column;
                max-width: 100%;
                border: none;
                padding: 0;
            }
          }

          @media (max-width: 768px) {
            .container { padding: 0 24px; }
            .nav-links { display: none; }
            .hamburger { display: block; }
            .viewer-container {
               flex-direction: column;
            }
            .sidebar {
               width: 100% !important;
               border-right: none !important;
               border-bottom: 1px solid var(--border);
               padding-right: 0 !important;
               margin-right: 0 !important;
               margin-bottom: 20px;
            }
          }

          /* Code block copy button styling */
          .code-block-wrapper {
            position: relative;
            margin: 1.5rem 0;
          }
          .copy-button {
            position: absolute;
            top: 8px;
            right: 8px;
            padding: 4px 8px;
            font-size: 0.65rem;
            background: rgba(45, 45, 45, 0.05);
            border: 1px solid var(--border);
            color: var(--text-sub);
            cursor: pointer;
            transition: var(--transition);
            z-index: 10;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          [data-theme="dark"] .copy-button {
            background: rgba(255, 255, 255, 0.05);
          }
          .copy-button:hover {
            background: var(--accent);
            color: var(--bg-color);
            border-color: var(--accent);
          }
          .copy-button.copied {
            background: #10b981;
            color: white;
            border-color: #10b981;
          }
        </style>
        
        <script>
          const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', currentTheme);
        </script>
      </head>
      <body>
        <nav>
          <div class="container nav-content">
            <a href="/" class="logo">MINI-LMS</a>
            
            <div style="display: flex; align-items: center; gap: 20px;">
              <ul class="nav-links">
                <li><a href="/#courses">COURSES</a></li>
                <li><a href="/#downloads">DIGITAL GOODS</a></li>
                ${isLoggedIn
      ? html`
                       <li><a href="/dashboard">MY ACCOUNT</a></li>
                       ${user.role === 'admin' ? html`<li><a href="/admin/dashboard" style="color: var(--accent); font-weight: 600;">ADMIN</a></li>` : ''}
                       <li><a href="/auth/logout" class="line-btn">LOGOUT</a></li>
                     `
      : html`<li><a href="/auth/google" class="line-btn">LOGIN</a></li>`
    }
              </ul>
              
              <button class="theme-toggle" id="theme-btn" aria-label="Toggle Theme">
                <span class="sun">☀️</span>
                <span class="moon">🌙</span>
              </button>
              
              <button class="hamburger" id="menu-btn">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </nav>
        
        <div class="mobile-menu" id="mobile-nav">
          <a href="/">HOME</a>
          <a href="/#courses">COURSES</a>
          <a href="/#downloads">DIGITAL GOODS</a>
          ${isLoggedIn
      ? html`
                <a href="/dashboard">MY ACCOUNT</a>
                ${user.role === 'admin' ? html`<a href="/admin/dashboard">ADMIN</a>` : ''}
                <a href="/auth/logout">LOGOUT</a>
              `
      : html`<a href="/auth/google">LOGIN</a>`
    }
        </div>

        <main class="container fade-in">
          ${children}
        </main>

        <footer>
          <div class="container">
            <p>© 2026 MINI-LMS. Built by gitsam.</p>
          </div>
        </footer>

        <script>
          const themeBtn = document.getElementById('theme-btn');
          themeBtn.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            // Also need to trigger tetris redraw if page has it
            if (window.draw) window.draw();
          });

          const menuBtn = document.getElementById('menu-btn');
          const mobileNav = document.getElementById('mobile-nav');
          menuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
          });

          // Close mobile menu on link click
          document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
              mobileNav.classList.remove('active');
            });
          });
        </script>
      </body>
    </html>
  `
}
