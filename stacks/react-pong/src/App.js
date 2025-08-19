import React, { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const paddleHeight = 75;
  const paddleWidth = 10;
  const ballRadius = 8;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let rightPaddleY = (canvas.height - paddleHeight) / 2;
    let leftPaddleY = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let dx = 2;
    let dy = 2;

    const keys = {};

    const drawPaddle = (x, y) => {
      ctx.fillStyle = '#e75480'; // pink
      ctx.fillRect(x, y, paddleWidth, paddleHeight);
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#e75480';
      ctx.fill();
      ctx.closePath();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // paddles
      drawPaddle(0, leftPaddleY);
      drawPaddle(canvas.width - paddleWidth, rightPaddleY);

      // ball
      drawBall();

      // move ball
      ballX += dx;
      ballY += dy;

      // wall collision
      if (ballY + dy < ballRadius || ballY + dy > canvas.height - ballRadius) {
        dy = -dy;
      }

      // paddle collision
      if (
        (ballX - ballRadius < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ||
        (ballX + ballRadius > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)
      ) {
        dx = -dx;
      }

      // reset if out of bounds
      if (ballX < 0 || ballX > canvas.width) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
      }

      // player controls
      if (keys['w'] && leftPaddleY > 0) leftPaddleY -= 4;
      if (keys['s'] && leftPaddleY < canvas.height - paddleHeight) leftPaddleY += 4;
      if (keys['ArrowUp'] && rightPaddleY > 0) rightPaddleY -= 4;
      if (keys['ArrowDown'] && rightPaddleY < canvas.height - paddleHeight) rightPaddleY += 4;

      requestAnimationFrame(draw);
    };

    const keyDownHandler = (e) => { keys[e.key] = true; };
    const keyUpHandler = (e) => { keys[e.key] = false; };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    draw();

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
    };
  }, []);

  return (
    <div className="App">
      <h1>🎮 React Pong</h1>
      <canvas ref={canvasRef} width={600} height={400} />
    </div>
  );
}

export default App;
