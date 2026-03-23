import { Layout } from '../layout';

export const DownloadDetail = ({ user, course }: { user: any, course: any }) => {
  return (
    <Layout title={course.title} user={user} description={course.description} keywords={course.keywords}>
      <div style="display: grid; grid-template-columns: 1fr 350px; gap: 60px; padding: 40px 0;">
        <div>
          <h1 style="font-size: 2.2rem; font-weight: 200; margin-bottom: 20px;">{course.title}</h1>
          <section style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.1rem; font-weight: 400; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px; letter-spacing: 0.1em; color: var(--text-sub);">
              DESCRIPTION
            </h2>
            <div class="prose" style="font-weight: 300; line-height: 1.8; color: var(--text-main);" dangerouslySetInnerHTML={{ __html: course.descriptionHtml || course.description }} />
            
            <div style="margin-top: 3rem; padding: 2.5rem; border: 1px dashed var(--border); text-align: center; background: rgba(0,0,0,0.02);">
              <p style="color: var(--text-main); font-weight: 400; margin-bottom: 10px; letter-spacing: 0.05em;">DIGITAL ASSET ONLY</p>
              <p style="color: var(--text-sub); font-size: 0.85rem; font-weight: 300;">이 상품은 구매 후 즉시 다운로드 가능한 디지털 애셋입니다. <br/> 구매 후 '내 강의실'에서 바로 확인하실 수 있습니다.</p>
            </div>
          </section>
        </div>

        <aside>
          <div class="card" style="position: sticky; top: 100px;">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-sub); letter-spacing: 0.1em; margin-bottom: 8px;">DIGITAL GOOD</div>
            <h3 style="font-weight: 600; font-size: 1.5rem; margin-bottom: 1rem;">
              ₩ {course.price.toLocaleString()}
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-sub); margin-bottom: 30px;">사용 기한: 무제한</p>

            <div id="payment-method" style="margin-bottom: 1rem;"></div>
            <div id="agreement" style="margin-bottom: 1rem;"></div>
            <button id="payment-button" class="line-btn" style="width: 100%; padding: 12px;">구매하기</button>
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
