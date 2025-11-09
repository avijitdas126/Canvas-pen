import { useContext, useState } from "react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/sidebar";
import { CanvasContext } from "./context/CanvaContext";

function App() {

  return (
    <>
        <div className="container">
          <Sidebar />
        </div>
     
    </>
  );
}

export default App;
