import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PongGame from "./PongGame";

export default function App() {
  return (
    <div>
      <h1>React Pong</h1>
      <PongGame />
    </div>
  );
}
