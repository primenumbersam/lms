import { Layout } from '../layout';

export const SessionViewer = ({
  user,
  course,
  session,
  sessions,
  progress,
  currentIndex,
  prevSession,
  nextSession,
  contentHtml,
  isCompleted
}: any) => {
  return (
    <Layout title={`${session.title} - ${course.title}`} user={user}>
      <style dangerouslySetInnerHTML={{ __html: `
        .viewer-container {
          display: flex;
          gap: 0;
          padding: 20px 0;
          transition: all 0.3s ease;
        }
        .sidebar {
          width: 300px;
          border-right: 1px solid var(--border);
          padding-right: 20px;
          margin-right: 30px;
          transition: opacity 0.3s ease, width 0.3s ease;
          overflow: hidden;
          flex-shrink: 0;
        }
        .sidebar.collapsed {
          width: 0;
          margin-right: 0;
          padding-right: 0;
          border-right: none;
          opacity: 0;
          pointer-events: none;
        }
        .content-main {
          flex: 1;
          min-width: 0;
        }
        .sidebar-toggle {
          background: var(--bg-color);
          border: 1px solid var(--border);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 4px;
          box-shadow: 2px 2px 0px var(--border);
          transition: all 0.2s ease;
          margin-bottom: 20px;
        }
        .sidebar-toggle:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--border);
          border-color: var(--accent);
        }
        .nav-footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid var(--border);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 20px;
        }
        /* Code block styling fix */
        pre {
          background-color: #f6f8fa !important;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          padding: 16px;
        }
        [data-theme="dark"] pre {
          background-color: #1e1e1e !important;
          border-color: #333;
        }
        .prose code:not(pre code) {
          background-color: rgba(175, 184, 193, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          font-size: 85%;
        }
      `}} />

      <div class="viewer-container">
        <aside id="course-sidebar" class="sidebar">
          <h3 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-sub); margin-bottom: 20px;">CURRICULUM</h3>
          <ul style="list-style: none; padding: 0;">
            {sessions.map((s: any) => (
              <li style="margin-bottom: 10px;">
                <a href={`/my/courses/${course.slug}/sessions/${s.slug}`} 
                   style={{
                     textDecoration: 'none',
                     fontSize: '0.9rem',
                     color: s.slug === session.slug ? 'var(--text-main)' : 'var(--text-sub)',
                     fontWeight: s.slug === session.slug ? '600' : '300',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     padding: '8px 12px',
                     border: s.slug === session.slug ? '1px solid var(--accent)' : '1px solid transparent'
                   }}>
                  <span>{s.title}</span>
                  {progress[s.id] && (
                    <span style="font-size: 0.7rem; color: var(--accent);">✓</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <main class="content-main">
          <button id="sidebar-toggle-btn" class="sidebar-toggle" title="Toggle Sidebar">
            <span id="toggle-icon">✕</span>
          </button>

          <div style="margin-bottom: 30px;">
            <div>
              <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-sub);">{course.title}</span>
              <h1 style="font-size: 2.2rem; font-weight: 200; margin-top: 5px;">{session.title}</h1>
            </div>
          </div>

          {session.video_uid && (
            <div style="aspect-ratio: 16/9; background: #000; margin-bottom: 40px; border: 1px solid var(--border); overflow: hidden;">
              <iframe
                src={`https://customer-v7v6p5vjv5v5v5v.cloudflarestream.com/${session.video_uid}/iframe?poster=https%3A%2F%2Fcustomer-v7v6p5vjv5v5v5v.cloudflarestream.com%2F${session.video_uid}%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600`}
                style="border: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen;"
              ></iframe>
            </div>
          )}

          <article id="content-prose" class="prose" style="font-weight: 300; line-height: 1.8;" dangerouslySetInnerHTML={{ __html: contentHtml }} />

          <div class="nav-footer">
            <div style="text-align: left;">
              {prevSession && (
                <a href={`/my/courses/${course.slug}/sessions/${prevSession.slug}`} class="line-btn" style="font-size: 0.75rem;">← PREVIOUS</a>
              )}
            </div>

            <div style="text-align: center;">
              {user && progress !== null && (
                <button 
                  id="complete-btn"
                  data-session-id={session.id}
                  data-completed={isCompleted ? 'true' : 'false'}
                  class="line-btn" 
                  style={{ 
                    fontSize: '0.8rem',
                    padding: '8px 24px',
                    borderColor: isCompleted ? 'var(--accent)' : 'var(--border)',
                    color: isCompleted ? 'var(--accent)' : 'var(--text-sub)'
                  }}>
                  {isCompleted ? 'COMPLETED ✓' : 'MARK AS DONE'}
                </button>
              )}
            </div>

            <div style="text-align: right;">
              {nextSession && (
                <a href={`/my/courses/${course.slug}/sessions/${nextSession.slug}`} class="line-btn" style="font-size: 0.75rem;">NEXT →</a>
              )}
            </div>
          </div>
        </main>
      </div>

      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js"></script>
      <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', () => {
          // Sidebar Toggle
          const sidebar = document.getElementById('course-sidebar');
          const toggleBtn = document.getElementById('sidebar-toggle-btn');
          const toggleIcon = document.getElementById('toggle-icon');
          
          if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
              sidebar.classList.toggle('collapsed');
              toggleIcon.innerText = sidebar.classList.contains('collapsed') ? '☰' : '✕';
            });
          }

          // Render Math
          const renderMath = () => {
             const content = document.getElementById('content-prose');
             if (content) {
               renderMathInElement(content, {
                delimiters: [
                  {left: '36092', right: '36092', display: true},
                  {left: '$', right: '$', display: false},
                  {left: '\\\\(', right: '\\\\)', display: false},
                  {left: '\\\\[', right: '\\\\]', display: true}
                ],
                throwOnError: false
              });
             }
          };
          renderMath();

          // Render Mermaid
          const renderMermaid = async () => {
            const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');
            for (const block of mermaidBlocks) {
              const pre = block.parentElement;
              const code = block.textContent;
              const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
              
              const { svg } = await mermaid.render(id, code);
              const div = document.createElement('div');
              div.className = 'mermaid-rendered';
              div.style.margin = '2rem 0';
              div.style.textAlign = 'center';
              div.innerHTML = svg;
              
              if (pre && pre.parentElement) {
                if (pre.parentElement.className === 'code-block-wrapper') {
                  pre.parentElement.parentElement.replaceChild(div, pre.parentElement);
                } else {
                  pre.parentElement.replaceChild(div, pre);
                }
              }
            }
          };

          mermaid.initialize({ 
            startOnLoad: false,
            theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose'
          });
          
          renderMermaid().catch(console.error);

          // Highlight.js
          document.querySelectorAll('pre code:not(.language-mermaid)').forEach((el) => {
            hljs.highlightElement(el);
          });

          // Add copy buttons
          document.querySelectorAll('pre code').forEach((codeBlock) => {
            const pre = codeBlock.parentNode;
            if (pre.tagName !== 'PRE') return;
            if (pre.parentNode.className === 'code-block-wrapper') return;

            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            const button = document.createElement('button');
            button.className = 'copy-button';
            button.type = 'button';
            button.innerText = 'COPY';

            button.addEventListener('click', () => {
              const text = codeBlock.innerText;
              navigator.clipboard.writeText(text).then(() => {
                button.innerText = 'COPIED!';
                button.classList.add('copied');
                setTimeout(() => {
                  button.innerText = 'COPY';
                  button.classList.remove('copied');
                }, 2000);
              });
            });

            wrapper.appendChild(button);
          });

          // Complete Button Logic
          const btn = document.getElementById('complete-btn');
          if (btn) {
            btn.addEventListener('click', async () => {
              const sessionId = btn.getAttribute('data-session-id');
              const isCompleted = btn.getAttribute('data-completed') === 'true';
              const nextState = !isCompleted;
              
              const res = await fetch(\`/my/sessions/\${sessionId}/progress\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: nextState })
              });
              
              if (res.ok) {
                btn.setAttribute('data-completed', nextState.toString());
                btn.innerText = nextState ? 'COMPLETED ✓' : 'MARK AS DONE';
                btn.style.borderColor = nextState ? 'var(--accent)' : 'var(--border)';
                btn.style.color = nextState ? 'var(--accent)' : 'var(--text-sub)';
              }
            });
          }
        });
      `}} />
    </Layout>
  );
};
