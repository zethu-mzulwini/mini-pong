# 🎮 Mini Pong Game (HTML5 Canvas)

A simple **Pong clone** built with **HTML5 `<canvas>`**, vanilla JavaScript, and CSS.  

This project demonstrates **animation loops, event handling, and collision detection** without any external libraries.  

Perfect for learning canvas basics or extending into your own game! 🚀

---

## 📂 Project Structure

```
/mini-pong/
├── index.html # Main HTML file, sets up canvas
├── css/
│ └── styles.css # Page & canvas styling
└── js/
└── game.js # Core game logic (animation, input, collisions)
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

🧩 How It Works

This game uses requestAnimationFrame for smooth animation, handles keyboard events for paddle movement and detects collisions with paddles and walls.  The ball will be reset when it leaves the screen.

---

🔧 Extending the Game

Want to make it your own? Some easy extensions:

- Add a score system (display text at the top for each player)
- Add sound effects when ball hits paddles/walls
- Increase ball speed after each rally
- Add a simple AI opponent (auto-move right paddle)
- Customize colors, paddle sizes, or ball shape

---

📜 License

This project is released under the MIT License.