import { Layout } from '../layout';

export const Dashboard = ({ user, stats, recentPayments, courses }: { user: any, stats: any, recentPayments: any[], courses: any[] }) => {
  return (
    <Layout title="Admin Dashboard" user={user}>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-section {
          margin-bottom: 60px;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .admin-table thead th {
          text-align: left;
          padding: 12px 10px;
          font-weight: 400;
          color: var(--text-sub);
          border-bottom: 1px solid var(--border);
          font-family: 'Outfit';
          letter-spacing: 0.05em;
        }
        .admin-table tbody td {
          padding: 15px 10px;
          border-bottom: 1px solid var(--border);
          font-weight: 300;
        }
        .stat-card {
           display: flex;
           flex-direction: column;
           gap: 10px;
        }
        .admin-btn {
          padding: 6px 12px;
          font-size: 0.75rem;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-main);
          cursor: pointer;
          transition: var(--transition);
        }
        .admin-btn:hover {
          border-color: var(--accent);
          background: var(--accent);
          color: var(--bg-color);
        }
      `}} />

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
        <h1 style="font-size: 2.2rem; font-weight: 200;">Admin Console</h1>
        <div style="display: flex; gap: 10px;">
          <button class="line-btn" onclick="location.reload()">REFRESH DATA</button>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 60px;">
        <div class="card stat-card">
          <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-sub); letter-spacing: 0.1em;">Total Users</div>
          <div style="font-size: 2rem; font-weight: 200;">{stats.total_users}</div>
        </div>
        <div class="card stat-card">
          <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-sub); letter-spacing: 0.1em;">Courses</div>
          <div style="font-size: 2rem; font-weight: 200;">{stats.total_courses}</div>
        </div>
        <div class="card stat-card">
          <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-sub); letter-spacing: 0.1em;">Gross Revenue</div>
          <div style="font-size: 2rem; font-weight: 200;">₩ {stats.total_revenue.toLocaleString()}</div>
        </div>
        <div class="card stat-card">
          <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-sub); letter-spacing: 0.1em;">Enrollments</div>
          <div style="font-size: 2rem; font-weight: 200;">{stats.total_enrollments}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 40px;">
        <section class="admin-section">
          <h2 style="font-size: 1rem; font-weight: 400; margin-bottom: 25px; letter-spacing: 0.1em; color: var(--text-sub);">CONTENT MANAGEMENT</h2>
          <table class="admin-table">
            <thead>
              <tr>
                <th>TITLE</th>
                <th>SLUG</th>
                <th>TYPE</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {courses && courses.map((c: any) => (
                <tr>
                  <td style="font-weight: 400;">{c.title}</td>
                  <td><code style="font-size: 0.8rem; background: rgba(0,0,0,0.05); padding: 2px 4px; border-radius: 4px;">{c.slug}</code></td>
                  <td>{c.type.toUpperCase()}</td>
                  <td>₩ {c.price.toLocaleString()}</td>
                  <td>
                    <span class={`badge ${c.status === 'published' ? 'badge-blue' : 'badge-ghost'}`} style="font-size: 0.6rem;">
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <a href={`/courses/${c.slug}`} class="admin-btn" style="text-decoration: none;">VIEW</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section class="admin-section">
          <h2 style="font-size: 1rem; font-weight: 400; margin-bottom: 25px; letter-spacing: 0.1em; color: var(--text-sub);">RECENT ACTIVITY</h2>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            {recentPayments && recentPayments.map((p: any) => (
              <div class="card" style="padding: 15px; font-size: 0.85rem; border-color: var(--border); box-shadow: none;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span style="font-weight: 400;">{p.course_title}</span>
                  <span style="color: var(--accent); font-weight: 600;">₩ {p.amount.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--text-sub);">
                  <span style="font-size: 0.75rem;">{p.user_email}</span>
                  <span style="font-size: 0.75rem;">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};
