<?php $player = "Guest"; ?>
<!DOCTYPE html>
<html>
<head>
  <title>Pong in PHP</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <h1>Welcome, <?= htmlspecialchars($player) ?>!</h1>
  <canvas id="gameCanvas" width="800" height="500"></canvas>
  <script src="../js/game.js"></script>
</body>
</html>
