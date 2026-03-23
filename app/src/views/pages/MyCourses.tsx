import { Layout } from '../layout';

export const MyCourses = ({ user, enrollments }: { user: any, enrollments: any[] }) => {
  return (
    <Layout title="My Account" user={user}>
      <h1 style="font-size: 2.5rem; font-weight: 200; margin-bottom: 40px;">My Account</h1>
      <section style="padding: 0;">
        <h2 style="font-size: 1.25rem; font-weight: 400; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">ENROLLED CONTENT</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;">
          {enrollments.length === 0 ? (
            <p style="color: var(--text-sub); font-weight: 300;">수강 중인 항목이 없습니다.</p>
          ) : (
            enrollments.map((item) => (
              <article class="card">
                <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-sub);">{item.type.toUpperCase()}</span>
                <h3 style="font-size: 1.25rem; font-weight: 400; margin-top: 5px;">{item.title}</h3>
                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border);">
                  <a href={`/courses/${item.slug}`} class="line-btn" style="width: 100%; text-align: center;">{item.type === 'download' ? 'DOWNLOAD' : 'CONTINUE LEARNING'}</a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
};
