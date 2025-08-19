import { useEffect, useRef } from "react";

export default function PongGame() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let ballX = canvas.width / 2, ballY = canvas.height / 2;
    let dx = 4, dy = 4;
    const ballSize = 10;

    function drawBall() {
      ctx.fillStyle = "hotpink";
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBall();

      ballX += dx;
      ballY += dy;

      if (ballX < 0 || ballX > canvas.width) dx *= -1;
      if (ballY < 0 || ballY > canvas.height) dy *= -1;

      requestAnimationFrame(draw);
    }
    draw();
  }, []);

  return (
    <div>
      <h1 style={{ color: "hotpink", textShadow: "2px 2px 4px #000" }}>
        React Pong
      </h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ border: "3px solid hotpink", background: "#000" }}
      />
    </div>
  );
}
