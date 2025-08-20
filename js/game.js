document.addEventListener('DOMContentLoaded', () => {

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Scoreboard UI (show label + numeric value)
const scoreboard = document.createElement('div');
scoreboard.className = 'scoreboard';
const leftScoreEl = document.createElement('div');
leftScoreEl.className = 'score';
leftScoreEl.innerHTML = `<span class="label">Player 1:</span> <span class="value">0</span>`;
const rightScoreEl = document.createElement('div');
rightScoreEl.className = 'score';
rightScoreEl.innerHTML = `<span class="label">Player 2:</span> <span class="value">0</span>`;
scoreboard.appendChild(leftScoreEl);
scoreboard.appendChild(rightScoreEl);
document.body.appendChild(scoreboard);

// Controls
let startBtn = document.getElementById('startBtn');
let stopBtn = document.getElementById('stopBtn');
let aiToggle = document.getElementById('aiToggle');
let ballShapeSelect = document.getElementById('ballShape');
let ballColorInput = document.getElementById('ballColor');
let paddleColorInput = document.getElementById('paddleColor');
let paddleSizeInput = document.getElementById('paddleSize');
let ballSizeInput = document.getElementById('ballSize');
let targetScoreInput = document.getElementById('targetScore');

// Defensive fallbacks if elements are not found (prevents runtime exceptions)
if (!startBtn) { console.warn('startBtn not found in DOM'); startBtn = { addEventListener: () => {} }; }
if (!stopBtn) { console.warn('stopBtn not found in DOM'); stopBtn = { addEventListener: () => {} }; }
if (!aiToggle) { console.warn('aiToggle not found in DOM'); aiToggle = { checked: true }; }
if (!ballShapeSelect) { console.warn('ballShape select not found'); ballShapeSelect = { value: 'circle' }; }
if (!ballColorInput) { console.warn('ballColor input not found'); ballColorInput = { value: '#ff69b4' }; }
if (!paddleColorInput) { console.warn('paddleColor input not found'); paddleColorInput = { value: '#ffffff' }; }
if (!paddleSizeInput) { console.warn('paddleSize input not found'); paddleSizeInput = { value: '100', addEventListener: () => {} }; }
if (!ballSizeInput) { console.warn('ballSize input not found'); ballSizeInput = { value: '10', addEventListener: () => {} }; }
if (!targetScoreInput) { console.warn('targetScore input not found'); targetScoreInput = { value: '5', addEventListener: () => {} }; }

let animationId = null;
let running = false;

// Customizable settings (defaults)
let paddleHeight = parseInt(paddleSizeInput.value, 10) || 100;
let paddleWidth = 10;
let leftPaddleY = (canvas.height - paddleHeight) / 2;
let rightPaddleY = (canvas.height - paddleHeight) / 2;
let paddleSpeed = 6;

let ballSize = parseInt(ballSizeInput.value, 10) || 10;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let baseSpeed = 4;
let ballSpeedX = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = baseSpeed * (Math.random() > 0.5 ? 1 : -1);

// Scores
let leftScore = 0;
let rightScore = 0;
let targetScore = parseInt(targetScoreInput.value, 10) || 5;
let gameOver = false;

// add paused + countdown state
let paused = false;
let countdownTimer = null;
let countdownOverlay = null;

// --- Remove player-name UI (if any was dynamically injected earlier) ---
(function removePlayerInputs(){
  const p1 = document.getElementById('player1Name');
  const p2 = document.getElementById('player2Name');
  if (p1 && p1.parentNode) p1.parentNode.remove();
  if (p2 && p2.parentNode) p2.parentNode.remove();
  // remove any leftover labels referencing them
  const lbls = document.querySelectorAll('label.control-row');
  lbls.forEach(l => {
    if (l.textContent && (l.textContent.includes('Player 1') || l.textContent.includes('Player 2'))) {
      if (l.parentNode) l.parentNode.removeChild(l);
    }
  });
})();

// (Replace/init) Sound initialization (deferred until user gesture)
function initSounds(){
  if (typeof window.soundsInitialized !== 'undefined' && window.soundsInitialized) return;
  try{
    // Try explicit relative paths
    paddleSound = new Audio('./sounds/ping.wav');
    wallSound = new Audio('./sounds/boop.wav');
    cheerSound = new Audio('./sounds/cheer.wav');
    [paddleSound, wallSound, cheerSound].forEach(s => { if(s) s.volume = 0.6; });
    [paddleSound, wallSound, cheerSound].forEach(s => { try{ s.load(); }catch(e){} });
    window.soundsInitialized = true;
  }catch(err){
    console.warn('initSounds failed', err);
    window.soundsInitialized = false;
  }
}

// Robust playSound wrapper
function playSound(name){
  try{
    initSounds();
    if (!window.soundsInitialized) return;
    let s = null;
    if (name === 'paddle') s = paddleSound;
    if (name === 'wall') s = wallSound;
    if (name === 'cheer') s = cheerSound;
    if (s) { try { s.currentTime = 0; s.play().catch(()=>{}); } catch(e){} }
  }catch(e){ console.warn('playSound error', e); }
}

// Ensure Start button primes sounds on first click (user gesture)
if (typeof startBtn !== 'undefined' && startBtn) {
  const _origStartHandler = startBtn.onclick || null;
  startBtn.addEventListener('click', (e)=>{
    initSounds();
    // if there was an original click handler assigned inline, leave it intact
    if (_origStartHandler) try{ _origStartHandler.call(startBtn, e); }catch(err){}
  });
}

// Event handling
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function drawPaddle(x, y) {
  ctx.fillStyle = paddleColorInput.value || '#fff';
  ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawBall() {
  ctx.fillStyle = ballColorInput.value || 'hotpink';
  if (ballShapeSelect.value === 'square') {
    ctx.fillRect(ballX - ballSize/2, ballY - ballSize/2, ballSize, ballSize);
  } else {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function movePaddles() {
  // Left player (W/S)
  if (keys["w"] && leftPaddleY > 0) leftPaddleY -= paddleSpeed;
  if (keys["s"] && leftPaddleY < canvas.height - paddleHeight) leftPaddleY += paddleSpeed;

  // Right player (ArrowUp/ArrowDown) only if AI disabled
  if (!aiToggle.checked) {
    if (keys["ArrowUp"] && rightPaddleY > 0) rightPaddleY -= paddleSpeed;
    if (keys["ArrowDown"] && rightPaddleY < canvas.height - paddleHeight) rightPaddleY += paddleSpeed;
  }
}

// AI personalities
let aiDifficulty = 'easy'; // 'easy' or 'hard'
// expose a simple dropdown if not present
let aiSelect = document.getElementById('aiDifficulty');
if (!aiSelect) {
  // create and insert after AI toggle if available
  const aiToggleEl = document.getElementById('aiToggle');
  if (aiToggleEl && aiToggleEl.parentNode) {
    const wrapper = document.createElement('label');
    wrapper.className='control-row';
    wrapper.innerHTML = 'AI Level: ';
    const sel = document.createElement('select');
    sel.id='aiDifficulty';
    sel.innerHTML = '<option value="easy">Easy</option><option value="hard">Hard</option>';
    wrapper.appendChild(sel);
    aiToggleEl.parentNode.parentNode.appendChild(wrapper);
    aiSelect = sel;
  }
}
if (aiSelect) aiSelect.addEventListener('change', e=> aiDifficulty = e.target.value );

function aiMove() {
  if (!aiToggle.checked) return;
  const center = rightPaddleY + paddleHeight/2;
  if (aiDifficulty === 'easy') {
    // lazy movement with random misses
    if (Math.random() < 0.02) { /* occasional pause */ }
    if (center < ballY - 12) rightPaddleY += paddleSpeed * 0.75;
    else if (center > ballY + 12) rightPaddleY -= paddleSpeed * 0.75;
    // random offset to miss
    if (Math.random() < 0.01) rightPaddleY += (Math.random() - 0.5) * 60;
  } else {
    // hard: predict where the ball will intersect the paddle x (simple linear prediction)
    const timeToReach = (canvas.width - paddleWidth - ballX) / (ballSpeedX || 0.0001);
    let predictedY = ballY + ballSpeedY * timeToReach;
    // reflect predictedY when outside bounds
    while (predictedY < 0 || predictedY > canvas.height) {
      if (predictedY < 0) predictedY = -predictedY;
      if (predictedY > canvas.height) predictedY = 2*canvas.height - predictedY;
    }
    const aim = predictedY - paddleHeight/2;
    if (rightPaddleY < aim - 6) rightPaddleY += paddleSpeed * 1.1;
    else if (rightPaddleY > aim + 6) rightPaddleY -= paddleSpeed * 1.1;
  }
  rightPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddleY));
}

// Mobile touch controls: drag right/left half to move respective paddle
let activeTouch = null;
canvas.addEventListener('touchstart', (e)=>{
  const t = e.touches[0];
  activeTouch = { id: t.identifier, startY: t.clientY };
  e.preventDefault();
});
canvas.addEventListener('touchmove', (e)=>{
  for (let i=0;i<e.touches.length;i++){
    const t=e.touches[i];
    const rect = canvas.getBoundingClientRect();
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    if (x < canvas.width/2) {
      // move left paddle to center at y
      leftPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, y - paddleHeight/2));
    } else {
      rightPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, y - paddleHeight/2));
    }
  }
  e.preventDefault();
});
canvas.addEventListener('touchend', (e)=>{ activeTouch=null; e.preventDefault(); });

// Replace Robust Start/Stop handlers with countdown-aware start + pause behavior
function showCountdown(startSeconds = 3, onComplete) {
  // cleanup any existing
  if (countdownOverlay) countdownOverlay.remove();
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }

  countdownOverlay = document.createElement('div');
  countdownOverlay.id = 'countdownOverlay';
  countdownOverlay.style.position = 'absolute';
  countdownOverlay.style.top = '0';
  countdownOverlay.style.left = '0';
  countdownOverlay.style.width = '100%';
  countdownOverlay.style.height = '100%';
  countdownOverlay.style.display = 'flex';
  countdownOverlay.style.alignItems = 'center';
  countdownOverlay.style.justifyContent = 'center';
  countdownOverlay.style.zIndex = '100';
  countdownOverlay.style.pointerEvents = 'none';
  countdownOverlay.style.color = 'white';
  countdownOverlay.style.fontSize = '120px';
  countdownOverlay.style.fontWeight = '700';
  countdownOverlay.style.textAlign = 'center';
  countdownOverlay.style.background = 'rgba(0,0,0,0.25)';

  document.body.appendChild(countdownOverlay);

  let remaining = startSeconds;
  countdownOverlay.textContent = remaining > 0 ? remaining : 'Go';
  countdownTimer = setInterval(() => {
    remaining--;
    if (remaining > 0) countdownOverlay.textContent = remaining;
    else {
      countdownOverlay.textContent = 'Go';
      clearInterval(countdownTimer);
      countdownTimer = null;
      setTimeout(() => {
        if (countdownOverlay) countdownOverlay.remove();
        countdownOverlay = null;
        if (typeof onComplete === 'function') onComplete();
      }, 300);
    }
  }, 1000);
}

function startGame() {
  try { initSounds(); } catch(e) { /* ignore */ }
  if (running) return; // already running

  // Ensure ball and paddles are centered and stationary while countdown runs
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 0;
  ballSpeedY = 0;
  leftPaddleY = (canvas.height - paddleHeight) / 2;
  rightPaddleY = (canvas.height - paddleHeight) / 2;

  // start with countdown then begin RAF loop
  // if paused, we still show countdown to resume
  showCountdown(3, () => {
    running = true;
    paused = false;

    const btnStart = document.getElementById('startBtn');
    const btnStop = document.getElementById('stopBtn');
    if (btnStart) { btnStart.disabled = true; btnStart.textContent = 'Running'; btnStart.classList.add('active'); }
    if (btnStop) { btnStop.disabled = false; }

    // ensure positions are reasonable on first start or after quit
    if (typeof leftPaddleY === 'undefined' || typeof rightPaddleY === 'undefined') {
      leftPaddleY = (canvas.height - paddleHeight) / 2;
      rightPaddleY = (canvas.height - paddleHeight) / 2;
    }
    // randomize initial motion only after countdown
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
    ballSpeedY = baseSpeed * (Math.random() > 0.5 ? 1 : -1);

    try {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(gameLoop);
    } catch (err) { console.error('gameLoop start failed', err); running = false; }
  });
}

function stopGame() {
  // pause the game (preserve positions/scores)
  paused = true;
  running = false;
  if (animationId) cancelAnimationFrame(animationId);
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  if (countdownOverlay) { countdownOverlay.remove(); countdownOverlay = null; }

  const btnStart = document.getElementById('startBtn');
  const btnStop = document.getElementById('stopBtn');
  if (btnStart) { btnStart.disabled = false; btnStart.textContent = 'Start'; btnStart.classList.remove('active'); }
  if (btnStop) { btnStop.disabled = true; }
}

// Quit: stop and fully reset game state/UI
function quitGame() {
  try { stopGame(); } catch (e) {}
  // reset scores
  leftScore = 0; rightScore = 0;
  try { leftScoreEl.querySelector('.value').textContent = leftScore; } catch(e){}
  try { rightScoreEl.querySelector('.value').textContent = rightScore; } catch(e){}

  // reset sizes from UI
  paddleHeight = parseInt(paddleSizeInput.value, 10) || paddleHeight;
  ballSize = parseInt(ballSizeInput.value, 10) || ballSize;

  // center paddles and ball, stop motion
  leftPaddleY = (canvas.height - paddleHeight) / 2;
  rightPaddleY = (canvas.height - paddleHeight) / 2;
  ballX = Math.floor(canvas.width / 2);
  ballY = Math.floor(canvas.height / 2);
  ballSpeedX = 0;
  ballSpeedY = 0;

  // ensure RAF cancelled
  try { if (animationId) cancelAnimationFrame(animationId); } catch(e){}
  animationId = null;

  // remove overlays and sparkles
  const go = document.getElementById('gameOverOverlay');
  if (go) go.remove();
  if (countdownOverlay) { countdownOverlay.remove(); countdownOverlay = null; }
  document.querySelectorAll('.sparkle').forEach(s => { try { s.remove(); } catch(e){} });

  gameOver = false;
  paused = false;

  // clear canvas and draw centered state so user sees the reset immediately
  try { ctx.clearRect(0,0,canvas.width,canvas.height); draw(); } catch(e){}

  // ensure UI buttons reflect stopped/reset state
  const btnStart = document.getElementById('startBtn');
  const btnStop = document.getElementById('stopBtn');
  if (btnStart) { btnStart.disabled = false; btnStart.textContent = 'Start'; btnStart.classList.remove('active'); }
  if (btnStop) { btnStop.disabled = true; }
}

// wire up Start/Stop/Quit safely (keep existing priming listener intact)
if (typeof startBtn !== 'undefined' && startBtn && typeof startBtn.addEventListener === 'function') {
  startBtn.addEventListener('click', (e) => {
    try { startGame(); } catch (err) { console.error('startBtn handler error', err); }
  });
}
if (typeof stopBtn !== 'undefined' && stopBtn && typeof stopBtn.addEventListener === 'function') {
  stopBtn.addEventListener('click', (e) => {
    try { stopGame(); } catch (err) { console.error('stopBtn handler error', err); }
  });
  try { stopBtn.disabled = true; } catch(e){}
}
const quitBtn = document.getElementById('quitBtn');
if (quitBtn) {
  quitBtn.addEventListener('click', (e) => {
    try { quitGame(); } catch (err) { console.error('quitBtn handler error', err); }
  });
}

// Add concrete moveBall() and draw() implementations so RAF loop actually runs
function moveBall() {
  // update position
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // top/bottom wall collisions
  if (ballY - ballSize <= 0) {
    ballY = ballSize;
    ballSpeedY = -ballSpeedY;
    try{ playSound('wall'); }catch(e){}
  } else if (ballY + ballSize >= canvas.height) {
    ballY = canvas.height - ballSize;
    ballSpeedY = -ballSpeedY;
    try{ playSound('wall'); }catch(e){}
  }

  // left paddle collision or left miss
  if (ballX - ballSize <= paddleWidth) {
    if (ballY >= leftPaddleY && ballY <= leftPaddleY + paddleHeight) {
      // bounce
      ballX = paddleWidth + ballSize;
      ballSpeedX = -ballSpeedX;
      const delta = ballY - (leftPaddleY + paddleHeight / 2);
      ballSpeedY += delta * 0.05;
      try{ playSound('paddle'); }catch(e){}
    } else {
      // right scores
      rightScore++;
      try { rightScoreEl.querySelector('.value').textContent = rightScore; } catch(e){}
      resetAfterPoint('right');
    }
  }

  // right paddle collision or right miss
  if (ballX + ballSize >= canvas.width - paddleWidth) {
    if (ballY >= rightPaddleY && ballY <= rightPaddleY + paddleHeight) {
      ballX = canvas.width - paddleWidth - ballSize;
      ballSpeedX = -ballSpeedX;
      const delta = ballY - (rightPaddleY + paddleHeight / 2);
      ballSpeedY += delta * 0.05;
      try{ playSound('paddle'); }catch(e){}
    } else {
      // left scores
      leftScore++;
      try { leftScoreEl.querySelector('.value').textContent = leftScore; } catch(e){}
      resetAfterPoint('left');
    }
  }
}

function draw() {
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // center dashed line
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.setLineDash([6,6]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // paddles and ball
  drawPaddle(0, leftPaddleY);
  drawPaddle(canvas.width - paddleWidth, rightPaddleY);
  drawBall();
}

// gameLoop with debug logs
function gameLoop(timestamp) {
  if (!running) return;
  try {
    // debug tick
    // console.debug('gameLoop tick', timestamp);
    movePaddles();
    if (typeof aiMove === 'function') aiMove();
    if (typeof moveBall === 'function') moveBall();
    if (typeof draw === 'function') draw();
  } catch (err) {
    console.error('Error during game loop:', err);
    running = false;
    if (animationId) cancelAnimationFrame(animationId);
    return;
  }
  animationId = requestAnimationFrame(gameLoop);
}

// Replace debug-wrapper implementations with real, non-recursive game logic
function resetAfterPoint(scoredBy) {
  // read current target score (if user changed it)
  targetScore = parseInt(targetScoreInput.value, 10) || targetScore;
  if (leftScore >= targetScore || rightScore >= targetScore) {
    gameOver = true;
    stopGame();
    // determine winner label
    const winner = (leftScore >= targetScore) ? 'Player 1' : 'Player 2';
    // show celebration overlay
    showGameOver(winner);
    return;
  }

  // no winner yet — reset ball to center and randomize direction
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
}

// Show a full-screen overlay announcing the winner and spawning sparkles
function showGameOver(winner) {
  try {
    // avoid duplicate overlays
    const existing = document.getElementById('gameOverOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gameOverOverlay';
    overlay.className = 'game-over-overlay';

    const box = document.createElement('div');
    box.className = 'game-over-box';
    box.innerHTML = `<h2>Congratulations!</h2><p style="font-size:18px;margin:10px 0">${winner} wins!</p>`;

    const btn = document.createElement('button');
    btn.textContent = 'Try Again';
    btn.style.marginTop = '12px';
    btn.style.padding = '10px 16px';
    btn.style.fontSize = '16px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', ()=>{
      // reset scores
      leftScore = 0; rightScore = 0;
      try { leftScoreEl.querySelector('.value').textContent = leftScore; } catch(e){}
      try { rightScoreEl.querySelector('.value').textContent = rightScore; } catch(e){}
      // remove overlay and any sparkles immediately
      const o = document.getElementById('gameOverOverlay'); if (o) o.remove();
      document.querySelectorAll('.sparkle').forEach(s => { try { s.remove(); } catch(e){} });
      // clear gameOver flag and restart
      gameOver = false;
      startGame();
    });

    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // spawn fireworks across the canvas area (trail -> burst particles)
    const rect = canvas.getBoundingClientRect();
    const launches = 6;
    const colors = ['#ffec5c','#ff6b6b','#ffd08a','#9b7bff','#39ff14','#ff69b4'];
    for (let i = 0; i < launches; i++) {
      (function(){
        const launchX = rect.left + rect.width * (0.15 + Math.random() * 0.7);
        const launchY = rect.top + rect.height * (0.8 + Math.random() * 0.12); // slightly below top of canvas area
        const color = colors[Math.floor(Math.random() * colors.length)];

        // create launch trail element
        const trail = document.createElement('div');
        trail.className = 'firework';
        trail.style.left = `${launchX}px`;
        trail.style.top = `${launchY}px`;
        trail.style.color = color; // currentColor used by CSS
        document.body.appendChild(trail);

        // animate trail upward
        const rise = rect.height * (0.35 + Math.random() * 0.25); // how high it rises
        const riseDuration = 700 + Math.random() * 300;
        const riseAnim = trail.animate([
          { transform: 'translateY(0)', opacity: 1 },
          { transform: `translateY(-${rise}px)`, opacity: 0.95 }
        ], { duration: riseDuration, easing: 'cubic-bezier(.2,.8,.2,1)' });

        // when trail reaches top, burst into particles
        riseAnim.onfinish = () => {
          try { trail.remove(); } catch(e){}
          const burstCount = 16 + Math.floor(Math.random() * 16);
          const burstX = launchX;
          const burstY = launchY - rise;
          for (let p = 0; p < burstCount; p++) {
            const part = document.createElement('div');
            part.className = 'firework-particle';
            // randomize particle color variant
            const c = colors[Math.floor(Math.random() * colors.length)];
            part.style.background = c;
            part.style.left = `${burstX}px`;
            part.style.top = `${burstY}px`;
            document.body.appendChild(part);

            // compute random direction & distance
            const angle = Math.random() * Math.PI * 2;
            const distance = 60 + Math.random() * 140;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            const dur = 800 + Math.random() * 700;

            // animate particle outward and fade
            const anim = part.animate([
              { transform: 'translate(0,0) scale(1)', opacity: 1 },
              { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0 }
            ], { duration: dur, easing: 'cubic-bezier(.2,.6,.2,1)' });

            // cleanup after animation
            anim.onfinish = (() => {
              try { part.remove(); } catch(e){}
            });
          }
        };
        // ensure trail removed after safety timeout
        setTimeout(()=>{ try{ trail.remove(); }catch(e){} }, riseDuration + 1200);
      })();
    }

    // play a cheer if available
    try{ playSound('cheer'); } catch(e){}
  } catch (err) {
    console.error('showGameOver error', err);
  }
}

// Theme switching: applies body class to use CSS variables defined in style.css
function applyTheme(theme) {
  const body = document.body;
  body.classList.remove('theme-neon','theme-retro','theme-galaxy');
  if (!theme || theme === 'dark') return; // dark uses default :root variables
  if (theme === 'neon') body.classList.add('theme-neon');
  if (theme === 'retro') body.classList.add('theme-retro');
  if (theme === 'galaxy') body.classList.add('theme-galaxy');
}

// wire up theme selector (exists in index.html)
const themeSelect = document.getElementById('themeSelect');
if (themeSelect) {
  try {
    // normalize values (index.html uses 'neon','retro','galaxy','dark')
    applyTheme(themeSelect.value);
    themeSelect.addEventListener('change', (e)=> applyTheme(e.target.value));
  } catch(e) { console.warn('theme wiring error', e); }
}

// --- DEBUG: force dark theme + disable AI ---
applyTheme('dark');
if (aiToggle) aiToggle.checked = false;

// Removed debug player-name input injection (was creating #playerInputs and Set Names button)
// (Previously an IIFE created temporary inputs for player names; removed per user request)
});