import { html } from 'hono/html'
import { Layout } from './layout'

export const ErrorView = ({ message, status, user }: { message: string, status: number, user?: any }) => {
  return html`
    <Layout title="Error" user={user}>
      <div style="padding: 100px 0; text-align: center; border: 1px dashed var(--border);">
        <div style="font-size: 5rem; font-weight: 200; color: var(--text-sub); margin-bottom: 20px;">${status}</div>
        <h1 style="font-size: 1.5rem; font-weight: 300; margin-bottom: 20px;">${message}</h1>
        <p style="color: var(--text-sub); margin-bottom: 40px;">문제가 발생했습니다. 다시 시도해 주세요.</p>
        <a href="/" class="line-btn">BACK TO HOME</a>
      </div>
    </Layout>
  `
}
