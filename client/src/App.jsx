import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <h1 className="text-6xl font-bold underline align-center justify-center flex items-center h-screen">
          AI Healthcare
        </h1>
      </div>
    </>
  );
}

export default App;
