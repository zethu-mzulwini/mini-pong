const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleHeight = 100, paddleWidth = 10;
let leftPaddleY = (canvas.height - paddleHeight) / 2;
let rightPaddleY = (canvas.height - paddleHeight) / 2;
const paddleSpeed = 6;

const ballSize = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 4, ballSpeedY = 4;

// Event handling
const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function drawPaddle(x, y) {
  const gradient = ctx.createLinearGradient(x, y, x + paddleWidth, y + paddleHeight);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, "deeppink");
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawBall() {
  ctx.fillStyle = "hotpink";
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
  ctx.fill();
}

function movePaddles() {
  if (keys["w"] && leftPaddleY > 0) leftPaddleY -= paddleSpeed;
  if (keys["s"] && leftPaddleY < canvas.height - paddleHeight) leftPaddleY += paddleSpeed;
  if (keys["ArrowUp"] && rightPaddleY > 0) rightPaddleY -= paddleSpeed;
  if (keys["ArrowDown"] && rightPaddleY < canvas.height - paddleHeight) rightPaddleY += paddleSpeed;
}

function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY < 0 || ballY > canvas.height) ballSpeedY *= -1;

  if (ballX < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
    ballSpeedX *= -1;
  }
  if (ballX > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
    ballSpeedX *= -1;
  }

  if (ballX < 0 || ballX > canvas.width) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle(0, leftPaddleY);
  drawPaddle(canvas.width - paddleWidth, rightPaddleY);
  drawBall();
}

function gameLoop() {
  movePaddles();
  moveBall();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
