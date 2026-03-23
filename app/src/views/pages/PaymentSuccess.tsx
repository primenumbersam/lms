import { html } from 'hono/html'

export const PaymentSuccess = () => {
  return (
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <title>Payment Success - MINI-LMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;600&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: 'Outfit', sans-serif; background: #ffffff; color: #1a1a1a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { border: 1px solid #e0e0e0; padding: 40px; text-align: center; max-width: 450px; width: 100%; transition: all 0.3s ease; }
          .card:hover { border-color: #1a1a1a; transform: translate(-3px, -3px); box-shadow: 8px 8px 0px rgba(0,0,0,0.02); }
          .spinner { border: 1px solid #e0e0e0; border-top: 1px solid #1a1a1a; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h2 { font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 15px; }
          p { color: #666; font-weight: 300; font-size: 0.9rem; margin-bottom: 25px; }
          .line-btn { display: inline-block; padding: 10px 28px; border: 1px solid #1a1a1a; color: #1a1a1a; text-decoration: none; font-weight: 500; font-size: 0.85rem; transition: all 0.3s ease; background: transparent; cursor: pointer; }
          .line-btn:hover { background: #1a1a1a; color: #fff; }
          #fallback { display: none; margin-top: 10px; }
        ` }} />
      </head>
      <body>
        <div class="card">
          <div id="status-icon" class="spinner"></div>
          <h2 id="status-text">Confirming...</h2>
          <p id="description">잠시만 기다려 주세요. 결제를 확인하고 있습니다.</p>
          <div id="fallback">
            <a href="/dashboard" class="line-btn">DASHBOARD</a>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          const urlParams = new URLSearchParams(window.location.search);
          async function confirm() {
            const paymentKey = urlParams.get('paymentKey');
            const orderId = urlParams.get('orderId');
            const amount = Number(urlParams.get('amount'));
            
            if (!paymentKey || !orderId || !amount) {
              document.getElementById('status-text').innerText = 'Invalid Parameters';
              document.getElementById('description').innerText = '필수 결제 정보가 누락되었습니다.';
              document.getElementById('status-icon').style.display = 'none';
              document.getElementById('fallback').style.display = 'block';
              return;
            }

            try {
              const res = await fetch('/payment/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentKey, orderId, amount })
              });
              
              const data = await res.json();
              if (res.ok && (data.status === 'DONE' || data.paymentKey)) {
                document.getElementById('status-text').innerText = 'Success';
                document.getElementById('description').innerText = '결제가 완료되었습니다. 잠시 후 이동합니다.';
                document.getElementById('status-icon').style.display = 'none';
                setTimeout(() => window.location.href = '/dashboard', 1000);
              } else {
                window.location.href = '/payment/fail?message=' + encodeURIComponent(data.message || 'Confirmation failed');
              }
            } catch (err) {
              window.location.href = '/payment/fail?message=Network error';
            }
          }
          confirm();
          // Fallback button after 5 seconds
          setTimeout(() => { document.getElementById('fallback').style.display = 'block'; }, 5000);
        ` }} />
      </body>
    </html>
  );
};
