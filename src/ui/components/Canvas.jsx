import React, { useEffect, useRef, useState } from "react";
import { Canvas, Circle, PencilBrush } from "fabric";
import { useCanvasEditor } from "../App";

export default function () {
  const canvasRef = useRef();
  const [canvas, setcanvas] = useState(null);
  const { setcanvasEditor } = useCanvasEditor();
  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: window.innerWidth - 20,
        height: window.innerHeight - 20,
        backgroundColor: "transparent",
        isDrawingMode: false,
        selection:false,
      });
      initCanvas.freeDrawingBrush = new PencilBrush(initCanvas);
      setcanvas(initCanvas);
      setcanvasEditor(initCanvas);
      // Optional: handle window resize
      const handleResize = () => {
        initCanvas.setWidth(window.innerWidth - 20);
        initCanvas.setHeight(window.innerHeight - 20);
        initCanvas.renderAll();
      };
      window.addEventListener("resize", handleResize);
      return () => {
        initCanvas.dispose();
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <>
      <center>
        <canvas ref={canvasRef}></canvas>
      </center>
    </>
  );
}
