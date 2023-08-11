import React, { createContext, useState } from "react";
import Keyboard from "./components/Keyboard/Keyboard";
import "./App.css";
import NotesCanvas from "./components/NotesCanvas/NotesCanvas";

export const ActiveNotesContext = createContext<{
  active: Map<number, boolean>;
  setActive: React.Dispatch<React.SetStateAction<Map<any, any>>>;
}>({ active: new Map(), setActive: () => {} });

function App() {
  const [active, setActive] = useState(new Map());
  return (
    <ActiveNotesContext.Provider value={{ active, setActive }}>
      <div className="App">
        <NotesCanvas />
        <Keyboard />
      </div>
    </ActiveNotesContext.Provider>
  );
}

export default App;
