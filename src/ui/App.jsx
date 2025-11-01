import { useContext, useState } from "react";
import Canvas from "./components/Canvas";
import Sidebar from "./components/sidebar";
import { CanvasContext } from "./context/CanvaContext";

function App() {
  const [canvasEditor, setcanvasEditor] = useState();
  return (
    <>
      {/* <CanvasContext.Provider value={{ canvasEditor, setcanvasEditor }}> */}
        <div className="container">
          {/* <Canvas /> */}
          <Sidebar />
        </div>
      {/* </CanvasContext.Provider> */}
    </>
  );
}

export default App;
export const useCanvasEditor = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("Error");
  }
  return context;
};
