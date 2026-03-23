import { Layout } from '../layout';

export const Home = ({ user, courses, downloads }: { user: any, courses: any[], downloads: any[] }) => {
  return (
    <Layout title="Logical Learning" user={user}>
      <section class="fade-in" style="padding: 20px 0; border-bottom: 1px solid var(--border);">
        <div class="hero">
          <div class="hero-text">
            <h1 style="font-size: 2.2rem; font-weight: 200; line-height: 1.1; margin-bottom: 25px;">High-Logic <br /> Low-Code.</h1>
            <p style="font-size: 1rem; font-weight: 300; color: var(--text-sub); margin-bottom: 35px; max-width: 400px;">호구낚시/팔이피플 방어 학습. <br /> 테트리스처럼 차곡차곡 쌓아가는 이성.</p>
            <div style="display: flex; gap: 15px;">
              <a href="#courses" class="line-btn">GET STARTED</a>
              <button id="start-btn" class="line-btn" style="border-style: dashed;">PLAY TETRIS</button>
            </div>
          </div>

          <div class="tetris-wrapper">
            <canvas id="tetris" width="240" height="400" style="border: 1.5px solid var(--accent); background: var(--bg-color); display: block; width: 200px; height: 333px;"></canvas>
            <div class="tetris-ui">
              <div>
                <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-sub);">Score</div>
                <div id="score" style="font-size: 1.3rem; font-weight: 600;">0</div>
              </div>
              <div class="controls-hint">
                ← → : Move<br />
                ↑ : Rotate<br />
                ↓ : Soft Drop<br />
                Space : Hard Drop
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" style="padding: 20px 0; border-bottom: 1px solid var(--border);">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="font-size: 1.8rem; font-weight: 300; margin-bottom: 10px;">Curated Courses</h2>
          <p style="color: var(--text-sub);">호구낚시 방어용 강의 팔이 (1년 구독권)</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;">
          {courses.map((course) => (
            <article class="card">
              <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-sub);">Course</span>
              <h3 style="font-size: 1.2rem; font-weight: 400; margin-top: 5px;">{course.title}</h3>
              <p style="font-size: 0.9rem; color: var(--text-sub); font-weight: 300; min-height: 3rem;">{course.description}</p>
              <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 1rem;">
                  {course.price === 0 ? 'FREE' : `₩ ${course.price.toLocaleString()}`}
                </span>
                <a href={`/courses/${course.slug}`} class="line-btn" style="padding: 6px 16px; font-size: 0.75rem;">VIEW DETAILS</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="downloads" style="padding: 20px 0;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="font-size: 1.8rem; font-weight: 300; margin-bottom: 10px;">Digital Goods</h2>
          <p style="color: var(--text-sub);">창작자의 시간을 절약해 줄 디지털 파일들</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px;">
          {downloads.map((download) => (
            <article class="card">
              <span style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-sub);">Asset</span>
              <h3 style="font-size: 1.2rem; font-weight: 400; margin-top: 5px;">{download.title}</h3>
              <p style="font-size: 0.9rem; color: var(--text-sub); font-weight: 300; min-height: 3rem;">{download.description}</p>
              <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 1rem;">
                  ₩ {download.price.toLocaleString()}
                </span>
                <a href={`/courses/${download.slug}`} class="line-btn" style="padding: 6px 16px; font-size: 0.75rem;">VIEW DETAILS</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <script dangerouslySetInnerHTML={{
        __html: `
        // Tetris Logic from mockup
        const canvas = document.getElementById('tetris');
        const context = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const scale = 20;

        context.scale(scale, scale);

        function arenaSweep() {
            let rowCount = 1;
            outer: for (let y = arena.length - 1; y > 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) {
                    if (arena[y][x] === 0) continue outer;
                }
                const row = arena.splice(y, 1)[0].fill(0);
                arena.unshift(row);
                ++y;
                player.score += rowCount * 10;
                rowCount *= 2;
            }
            updateScore();
        }

        function collide(arena, player) {
            const [m, o] = [player.matrix, player.pos];
            for (let y = 0; y < m.length; ++y) {
                for (let x = 0; x < m[y].length; ++x) {
                    if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
                }
            }
            return false;
        }

        function createMatrix(w, h) {
            const matrix = [];
            while (h--) matrix.push(new Array(w).fill(0));
            return matrix;
        }

        function createPiece(type) {
            if (type === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
            if (type === 'L') return [[0,1,0],[0,1,0],[0,1,1]];
            if (type === 'J') return [[0,1,0],[0,1,0],[1,1,0]];
            if (type === 'O') return [[1,1],[1,1]];
            if (type === 'Z') return [[1,1,0],[0,1,1],[0,0,0]];
            if (type === 'S') return [[0,1,1],[1,1,0],[0,0,0]];
            if (type === 'T') return [[0,1,0],[1,1,1],[0,0,0]];
        }

        function draw() {
            context.fillStyle = '#fff';
            if (document.body.classList.contains('dark-mode')) context.fillStyle = '#121212';
            context.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
            drawMatrix(arena, {x:0, y:0});
            drawMatrix(player.matrix, player.pos);
        }

        function drawMatrix(matrix, offset) {
            const isDark = document.body.classList.contains('dark-mode');
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        context.fillStyle = isDark ? '#fff' : '#1a1a1a';
                        context.fillRect(x + offset.x, y + offset.y, 1, 1);
                        context.lineWidth = 0.05;
                        context.strokeStyle = isDark ? '#121212' : '#fff';
                        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                    }
                });
            });
        }

        function merge(arena, player) {
            player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
                });
            });
        }

        function playerDrop() {
            player.pos.y++;
            if (collide(arena, player)) {
                player.pos.y--;
                merge(arena, player);
                playerReset();
                arenaSweep();
            }
            dropCounter = 0;
        }

        function playerMove(dir) {
            player.pos.x += dir;
            if (collide(arena, player)) player.pos.x -= dir;
        }

        function playerReset() {
            const pieces = 'ILJOTSZ';
            player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
            player.pos.y = 0;
            player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
            if (collide(arena, player)) {
                arena.forEach(row => row.fill(0));
                player.score = 0;
                updateScore();
            }
        }

        function playerRotate(dir) {
            const pos = player.pos.x;
            let offset = 1;
            rotate(player.matrix, dir);
            while (collide(arena, player)) {
                player.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > player.matrix[0].length) {
                    rotate(player.matrix, -dir);
                    player.pos.x = pos;
                    return;
                }
            }
        }

        function rotate(matrix, dir) {
            for (let y = 0; y < matrix.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
                }
            }
            if (dir > 0) matrix.forEach(row => row.reverse());
            else matrix.reverse();
        }

        let dropCounter = 0;
        let dropInterval = 1000;
        let lastTime = 0;

        function update(time = 0) {
            if (!gameRunning) return;
            const deltaTime = time - lastTime;
            lastTime = time;
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) playerDrop();
            draw();
            requestAnimationFrame(update);
        }

        window.draw = draw;

        function updateScore() {
            scoreElement.innerText = player.score;
        }

        const arena = createMatrix(12, 20);
        const player = { pos: {x:0, y:0}, matrix: null, score: 0 };
        let gameRunning = false;

        document.getElementById('start-btn').onclick = () => {
            const btn = document.getElementById('start-btn');
            if (!gameRunning) {
                // Start or Resume
                gameRunning = true;
                lastTime = performance.now(); // Reset time to prevent skipping
                if (!player.matrix) playerReset();
                updateScore();
                update();
                btn.innerText = 'STOP';
            } else {
                // Stop/Pause
                gameRunning = false;
                btn.innerText = 'PLAY TETRIS';
            }
        };

        document.addEventListener('keydown', event => {
            if (!gameRunning) return;
            
            // Prevent default behavior for game keys to avoid scrolling
            if ([37, 38, 39, 40, 32].includes(event.keyCode)) {
                event.preventDefault();
            }

            if (event.keyCode === 37) playerMove(-1);
            else if (event.keyCode === 39) playerMove(1);
            else if (event.keyCode === 40) playerDrop();
            else if (event.keyCode === 38) playerRotate(1);
            else if (event.keyCode === 32) {
                while (!collide(arena, player)) player.pos.y++;
                player.pos.y--;
                merge(arena, player);
                playerReset();
                arenaSweep();
            }
        });
      `}} />
    </Layout>
  );
};
