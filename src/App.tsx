import React from "react";
import Keyboard from "./components/Keyboard/Keyboard";
import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="notes"></div>
      <Keyboard />
    </div>
  );
}

export default App;
