import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true, linkify: true, typographer: true })

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

export function renderMarkdown(content: string | null | undefined, courseSlug?: string, sessionSlug?: string): string {
  if (!content) return ''
  
  let processedContent = content
  
  if (courseSlug) {
    // 1. 이미지 및 리소스 링크(![alt](path)) 치환
    processedContent = processedContent.replace(
      /!\[(.*?)\]\((?!http)(.*?)\)/g,
      (match, alt, path) => {
        // 비디오 파일(.mp4)인 경우 <video> 태그로 변환
        if (path.endsWith('.mp4')) {
          let finalUrl = '';
          if (path.startsWith('../')) {
             finalUrl = `/assets/courses/${courseSlug}/${path.substring(3)}`;
          } else if (sessionSlug) {
             finalUrl = `/assets/courses/${courseSlug}/${sessionSlug}/${path}`;
          } else {
             finalUrl = `/assets/courses/${courseSlug}/${path}`;
          }
          return `<div style="margin: 2rem 0; width: 100%;"><video src="${finalUrl}" controls style="width: 100%; border: 1px solid var(--border); border-radius: 8px;"></video></div>`;
        }

        let finalPath = path;
        // ../thumbnail.jpg 같은 상위 경로 처리
        if (path.startsWith('../')) {
          finalPath = path.substring(3); // ../ 제거
          return `![${alt}](/assets/courses/${courseSlug}/${finalPath})`;
        }
        
        // 일반 상대 경로
        if (sessionSlug) {
          return `![${alt}](/assets/courses/${courseSlug}/${sessionSlug}/${finalPath})`;
        } else {
          return `![${alt}](/assets/courses/${courseSlug}/${finalPath})`;
        }
      }
    )
  }

  // 2. 수식 파싱 보호 (마크다운 엔진이 렌더링하면서 _, *, 등의 기호를 변형하는 것을 방지)
  const mathBlocks: string[] = [];
  processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
    mathBlocks.push(p1);
    return `\n\n<div style="margin: 1.5rem 0;" class="math-block-wrapper">MATH_BLOCK_PLACEHOLDER_${mathBlocks.length - 1}X</div>\n\n`;
  });

  const mathInlines: string[] = [];
  processedContent = processedContent.replace(/(^|[^\\])\$([^\$]+?)\$/g, (match, p1, p2) => {
    mathInlines.push(p2);
    return `${p1}MATH_INLINE_PLACEHOLDER_${mathInlines.length - 1}X`;
  });

  // 3. 마크다운 렌더링
  let html = md.render(processedContent)

  // 4. 수식 복원
  mathBlocks.forEach((math, i) => {
    const escaped = escapeHtml(math);
    html = html.replace(`MATH_BLOCK_PLACEHOLDER_${i}X`, `$$ \\displaystyle ${escaped} $$`);
  });
  
  mathInlines.forEach((math, i) => {
    const escaped = escapeHtml(math);
    html = html.replace(`MATH_INLINE_PLACEHOLDER_${i}X`, `$${escaped}$`);
  });

  return html
}
