# 🎮 Mini Pong Game (HTML5 Canvas)

A simple **Pong clone** built with **HTML5 `<canvas>`**, vanilla JavaScript, and CSS.  

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

## 🕹️ Controls
- **Player 1 (Left Paddle)**:  
  - `W` = Move Up  
  - `S` = Move Down  
- **Player 2 (Right Paddle)**:  
  - `↑` (Arrow Up) = Move Up  
  - `↓` (Arrow Down) = Move Down  

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

- React

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