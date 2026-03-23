import { html } from 'hono/html'

export const PaymentFail = ({ message }: { message: string }) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <title>Payment Failed - MINI-LMS</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;600&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: 'Outfit', sans-serif; background: #ffffff; color: #1a1a1a; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { border: 1px solid #e0e0e0; padding: 40px; text-align: center; max-width: 450px; width: 100%; transition: all 0.3s ease; }
          .card:hover { border-color: #1a1a1a; transform: translate(-3px, -3px); box-shadow: 8px 8px 0px rgba(0,0,0,0.02); }
          h2 { font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 15px; }
          p { color: #666; font-weight: 300; font-size: 0.9rem; margin-bottom: 25px; }
          .line-btn { display: inline-block; padding: 10px 28px; border: 1px solid #1a1a1a; color: #1a1a1a; text-decoration: none; font-weight: 500; font-size: 0.85rem; transition: all 0.3s ease; background: transparent; cursor: pointer; }
          .line-btn:hover { background: #1a1a1a; color: #fff; }
        ` }} />
      </head>
      <body>
        <div class="card">
          <h2>Payment Failed</h2>
          <p>{message}</p>
          <div>
            <a href="/" class="line-btn">RETURN HOME</a>
          </div>
        </div>
      </body>
    </html>
  );
};
