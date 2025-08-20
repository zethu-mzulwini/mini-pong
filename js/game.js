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

// Robust Start/Stop handlers (improve: start via requestAnimationFrame and add defensive checks)
function startGame() {
  console.debug('startGame called — running=', running);
  try { initSounds(); } catch(e) { /* ignore */ }
  if (running) return;
  // ensure canvas/context exist
  if (!canvas || !ctx) { console.error('Canvas or context missing'); return; }

  running = true;
  // give UI feedback
  const btnStart = document.getElementById('startBtn');
  const btnStop = document.getElementById('stopBtn');
  if (btnStart) { btnStart.disabled = true; btnStart.textContent = 'Running'; btnStart.classList.add('active'); }
  if (btnStop) { btnStop.disabled = false; }

  // reset positions/scores optionally
  leftPaddleY = (canvas.height - paddleHeight) / 2;
  rightPaddleY = (canvas.height - paddleHeight) / 2;
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = baseSpeed * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = baseSpeed * (Math.random() > 0.5 ? 1 : -1);

  // start loop via RAF to avoid blocking
  try {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
  } catch (err) { console.error('gameLoop start failed', err); running = false; }
}
function stopGame() {
  console.debug('stopGame called');
  running = false;
  if (animationId) cancelAnimationFrame(animationId);
  const btnStart = document.getElementById('startBtn');
  const btnStop = document.getElementById('stopBtn');
  if (btnStart) { btnStart.disabled = false; btnStart.textContent = 'Start'; btnStart.classList.remove('active'); }
  if (btnStop) { btnStop.disabled = false; }
}
// expose for debugging
window.startGame = startGame;
window.stopGame = stopGame;

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
    btn.textContent = 'Play Again';
    btn.style.marginTop = '12px';
    btn.style.padding = '10px 16px';
    btn.style.fontSize = '16px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', ()=>{
      // reset scores
      leftScore = 0; rightScore = 0;
      try { leftScoreEl.querySelector('.value').textContent = leftScore; } catch(e){}
      try { rightScoreEl.querySelector('.value').textContent = rightScore; } catch(e){}
      // remove overlay and any sparkles
      const o = document.getElementById('gameOverOverlay'); if (o) o.remove();
      // clear gameOver flag and restart
      gameOver = false;
      startGame();
    });

    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // spawn sparkles across the canvas area
    const rect = canvas.getBoundingClientRect();
    const sparkleCount = 24;
    for (let i=0;i<sparkleCount;i++){
      const s = document.createElement('div');
      s.className = 'sparkle';
      // randomize position over canvas
      const left = rect.left + Math.random() * rect.width;
      const top = rect.top + Math.random() * rect.height;
      s.style.left = `${left}px`;
      s.style.top = `${top}px`;
      // randomize size and duration
      const size = 6 + Math.floor(Math.random() * 10);
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.borderRadius = '50%';
      s.style.animationDuration = `${0.8 + Math.random() * 1.2}s`;
      s.style.opacity = String(0.6 + Math.random() * 0.4);
      // append to body so absolute coords line up with viewport
      document.body.appendChild(s);
      // remove individual sparkle after its animation finishes
      (function(el){
        setTimeout(()=>{ try{ el.remove(); }catch(e){} }, 1800 + Math.random()*1200);
      })(s);
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

// --- DEBUG: show player name inputs ---
(function showPlayerInputs(){
  const existing = document.getElementById('playerInputs');
  if (existing) { existing.remove(); console.log('Removed existing player input div'); }
  const div = document.createElement('div');
  div.id = 'playerInputs';
  div.style.position = 'absolute';
  div.style.left = '50%';
  div.style.top = '10px';
  div.style.transform = 'translateX(-50%)';
  div.style.zIndex = '100';
  div.innerHTML = `
    <div style="margin-bottom:4px">
      <input id="debugPlayer1" placeholder="Player 1 name" style="padding:8px;width:120px;font-size:16px">
      <input id="debugPlayer2" placeholder="Player 2 name" style="padding:8px;width:120px;font-size:16px">
    </div>
    <button id="setNames" style="padding:8px 12px;font-size:16px">Set Names</button>
  `;
  document.body.appendChild(div);

  const p1n = document.getElementById('debugPlayer1');
  const p2n = document.getElementById('debugPlayer2');
  const btnSet = document.getElementById('setNames');
  if (p1n && p2n && btnSet) {
    btnSet.addEventListener('click', ()=>{
      const p1 = p1n.value && p1n.value.trim().length > 0 ? p1n.value.trim() : 'Player 1';
      const p2 = p2n.value && p2n.value.trim().length > 0 ? p2n.value.trim() : 'Player 2';
      // update scores UI
      leftScoreEl.querySelector('.label').textContent = p1 + ':';
      rightScoreEl.querySelector('.label').textContent = p2 + ':';
      // remove inputs
      div.remove();
      // restore any removed player name labels (in case this was a re-show)
      const lbls = document.querySelectorAll('label.control-row');
      lbls.forEach(l => {
        if (l.textContent && (l.textContent.includes('Player 1') || l.textContent.includes('Player 2'))) {
          if (l.parentNode) l.parentNode.removeChild(l);
        }
      });
    });
  }
})();
});