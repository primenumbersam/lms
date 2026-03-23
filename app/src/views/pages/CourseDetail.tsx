import { Layout } from '../layout';

export const CourseDetail = ({ user, course, sessions }: { user: any, course: any, sessions: any[] }) => {
  return (
    <Layout title={course.title} user={user} description={course.description} keywords={course.keywords}>
      <div style="display: grid; grid-template-columns: 1fr 350px; gap: 60px; padding: 40px 0;">
        <div>
          <h1 style="font-size: 2.2rem; font-weight: 200; margin-bottom: 20px;">{course.title}</h1>
          <section style="margin-bottom: 2rem;">
            <div class="prose" style="font-weight: 300; line-height: 1.8; color: var(--text-main); margin-bottom: 3rem;" dangerouslySetInnerHTML={{ __html: course.descriptionHtml || course.description }} />
            
            <h2 style="font-size: 1.1rem; font-weight: 400; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px; letter-spacing: 0.1em; color: var(--text-sub);">
              CURRICULUM
            </h2>
            <ul style="list-style: none; padding: 0;">
              {sessions.length === 0 ? <p style="color: var(--text-sub); font-weight: 300;">Coming Soon</p> : sessions.map((s) => (
                <li style="padding: 1rem 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                  {s.is_preview ? (
                    <a href={`/my/courses/${course.slug}/sessions/${s.slug}`} style="text-decoration: none; color: inherit; display: flex; justify-content: space-between; width: 100%; align-items: center;">
                      <span style="font-weight: 400; border-bottom: 1px solid var(--border);">{s.title}</span>
                      <span class="badge badge-blue" style="font-size: 0.6rem;">PREVIEW</span>
                    </a>
                  ) : (
                    <>
                      <span style="font-weight: 300; color: var(--text-sub);">{s.title}</span>
                      <span style="font-size: 0.8rem; color: var(--text-sub);">🔒</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside>
          <div class="card" style="position: sticky; top: 100px;">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-sub); letter-spacing: 0.1em; margin-bottom: 8px;">ENROLLMENT</div>
            <h3 style="font-weight: 600; font-size: 1.5rem; margin-bottom: 1rem;">
              {course.price === 0 ? 'FREE' : `₩ ${course.price.toLocaleString()}`}
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-sub); margin-bottom: 30px;">
              수강 기간: {course.access_days === 0 ? '무제한' : `${course.access_days}일`}
            </p>

            <div id="payment-method" style="margin-bottom: 1rem;"></div>
            <div id="agreement" style="margin-bottom: 1rem;"></div>
            <button id="payment-button" class="line-btn" style="width: 100%; padding: 12px;">수강 신청하기</button>
          </div>
        </aside>
      </div>
      <script src="https://js.tosspayments.com/v2/standard"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
        async function initPayment() {
          const res = await fetch('/payment/prepare?course_id=${course.id}');
          if (res.status === 401) {
            document.getElementById('payment-button').addEventListener('click', () => { 
                window.location.href = '/auth/google?next=' + encodeURIComponent(window.location.pathname); 
            });
            return;
          }
          const data = await res.json();
          if (!data.clientKey) return;
          const { orderId, amount, courseTitle, clientKey, customerKey } = data;
          const tossPayments = TossPayments(clientKey);
          const widgets = tossPayments.widgets({ customerKey });
          await widgets.setAmount({ currency: 'KRW', value: amount });
          await widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' });
          await widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' });
          document.getElementById('payment-button').addEventListener('click', async () => {
            await widgets.requestPayment({
              orderId: orderId,
              orderName: courseTitle,
              successUrl: window.location.origin + '/payment/success?amount=' + amount,
              failUrl: window.location.origin + '/payment/fail',
            });
          });
        }
        initPayment().catch(console.error);
      `}} />
    </Layout>
  );
};
