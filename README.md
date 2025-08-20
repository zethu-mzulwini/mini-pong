# 🎮 Mini Pong (HTML5 Canvas)

A small Pong clone built with HTML5 Canvas, vanilla JavaScript and CSS. Lightweight and easy to extend — intended as a learning/example project.

This project demonstrates **animation loops, event handling, and collision detection** without any external libraries.  

Perfect for learning canvas basics or extending into your own game! 🚀

---

## 📂 Project Structure

```
/mini-pong/
├── index.html    # Main HTML file, sets up canvas
├── css/
  └── styles.css  # Page & canvas styling
└── js/
  └── game.js     # Core game logic (animation, input, collisions)
├── LICENSE
├── README.md     # This file
```

---

## New features & extensions (added)
- Start button now shows a 3 → 0 countdown before the game begins.
- Stop button pauses the game (preserves ball/paddle positions and scores).
- Quit button stops the game and fully resets state (scores, positions, centered ball).
- When the target score is reached the game shows a "Congratulations" popup.
  - Popup includes a fireworks-style visual celebration (trail + burst particles).
  - Popup includes a "Try Again" button which clears effects and restarts.
- Appearance controls:
  - Ball color & shape (circle / square)
  - Paddle color & paddle size
  - Ball size
  - Theme selector (Dark / Neon / Retro / Galaxy) using CSS variables
- AI opponent with difficulty selector (Easy / Hard). Toggleable.
- Touch support: drag on left/right half of canvas to move paddles on mobile.
- Sound effects for paddle/wall/cheer (loaded on user gesture).
- Responsive layout and consolidated CSS variables for easier theming and DRY rules.
- Defensive DOM fallbacks and robust event wiring to avoid runtime errors.

## Controls
- Player 1 (left): `W` (up), `S` (down)
- Player 2 (right): Arrow `↑` / `↓` (or toggle AI)
- Start: begins a 3→0 countdown, then starts the game
- Stop: pauses the game
- Quit: resets the game and centers the ball
- Try Again (in popup): resets scores and restarts with countdown

---

## 🚀 Getting Started

1. **Clone this repo**  
    ```bash
    git clone git@github.com:zethu-mzulwini/mini-pong.git
    cd mini-pong
    ```

2. Open in browser
Simply double-click index.html or open it in your favorite browser. (No server required!)

---

## 🗂️ Technology Stack Demonstrations

To show versatility, this project includes multiple versions of the same Pong game implemented in different stacks.

- Node.js + Express
```
cd stacks/node-pong
npm install
node server.js
```
- Open http://localhost:3000 in your browser.

---

- Vite + React

```
cd stacks/react-pong
npm install
npm start
```

- Open http://localhost:3000.

---
- PHP

Run with PHP’s built-in server:

```
cd stacks/php-pong
php -S localhost:8000
```

- Open http://localhost:8000.

---
- Laravel

Make sure you’ve installed dependencies:

```
cd stacks/laravel-pong
composer install
php artisan serve
```

- Open http://localhost:8000/pong.

## 🧩 How It Works

This game uses requestAnimationFrame for smooth animation, handles keyboard events for paddle movement, and detects collisions with paddles and walls.
The ball resets when it leaves the screen.

## 🔧 Extending the Game

Want to make it your own? Some easy extensions:

- Add a score system (display text at the top for each player)
- Add sound effects when ball hits paddles/walls
- Increase ball speed after each rally
- Add a simple AI opponent (auto-move right paddle)
- Customize colors, paddle sizes, or ball shape

---

### 📜 License

This project is released under the [MIT License](./LICENSE).