import React, { useEffect, useRef, useState } from "react";
import {
  Canvas,
  Circle,
  Ellipse,
  IText,
  Line,
  PencilBrush,
  Rect,
  Triangle,
} from "fabric";
import { EraserBrush } from "@erase2d/fabric";

export default function () {
  const canvasRef = useRef();
  const [canvas, setcanvas] = useState(null);
  const [onshape, setshape] = useState(null);
  const [ontool, settool] = useState(null);
  const [width, setwidth] = useState(20);
  const [color, setcolor] = useState("#000000");
  const [bgColor, setBgColor] = useState("transparent");
  useEffect(() => {
    if (!canvas) return;
    canvas.backgroundColor = bgColor;
    canvas.requestRenderAll();
  }, [canvas, bgColor]);

  useEffect(() => {
    if (window.electronCanvas) {
      window.electronCanvas.sendSelectedItem((data) => {
        if (data?.shape) {
          setshape(data?.shape || null);
        } else if (data?.tool) {
          settool(data?.tool || null);
        }
      });
    }
  }, []);
  useEffect(() => {
    if (window.electronCanvas) {
      window.electronCanvas.sendRange((data) => {
        console.log(data);
        setwidth(data);
      });
    }
  }, []);
  useEffect(() => {
    if (window.electronCanvas) {
      window.electronCanvas.sendToggle((data) => {
        if (data) {
          setBgColor("#fafafa");
        } else {
          setBgColor("transparent");
        }
      });
    }
  }, []);
  useEffect(() => {
    if (window.electronCanvas) {
      window.electronCanvas.sendColor((data) => {
        console.log(data);
        setcolor(data);
      });
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: window.innerWidth - 20,
        height: window.innerHeight - 20,
        backgroundColor: bgColor,
        isDrawingMode: false,
        selection: false,
      });
      initCanvas.freeDrawingBrush = new PencilBrush(initCanvas);
      setcanvas(initCanvas);
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
  //render shapes
  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = false;
    const onhandleShape = (opt) => {
      if (!onshape) return;
      const pointer = canvas.getPointer(opt.e);
      const { x, y } = pointer;
      const properties = {
        left: x,
        top: y,
        fill: "transparent",
        stroke: color,
        strokeWidth: 2,
        erasable: true,
      };
      let shape = null;
      switch (onshape) {
        case "circle":
          shape = new Circle({ ...properties, radius: 50 });
          break;
        case "rectangle":
          shape = new Rect({ ...properties, width: 100, height: 60 });
          break;
        case "triangle":
          shape = new Triangle({ ...properties, width: 100, height: 60 });
          break;
        case "ellipse":
          shape = new Ellipse({
            ...properties,
            rx: 80,
            ry: 40,
          });

          break;
        case "line":
          shape = new Line([x, y, x + 100, y + 50], {
            stroke: color,
            strokeWidth: 2,
            erasable: true,
          });

          break;
        default:
          break;
      }
      if (shape) {
        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
      }
      // ✅ After drawing, deselect the shape
      setshape(null);
    };
    canvas.on("mouse:down", onhandleShape);
    return () => {
      canvas.off("mouse:down", onhandleShape);
    };
  }, [canvas, onshape]);

  useEffect(() => {
    if (!canvas) return;
    canvas.on("path:created", (e) => {
      e.path.erasable = true;
    });
  }, [canvas]);
  useEffect(() => {
    if (!canvas) return;
    // helpers to enable/disable selection on canvas objects
    const enableSelection = () => {
      try {
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
        });
        canvas.requestRenderAll();
      } catch (e) {
        console.error("enableSelection error:", e);
      }
    };

    const disableSelection = () => {
      try {
        canvas.selection = false;
        canvas.forEachObject((obj) => {
          obj.selectable = false;
        });
        canvas.requestRenderAll();
      } catch (e) {
        console.error("disableSelection error:", e);
      }
    };

    switch (ontool) {
      case "clear":
        canvas.clear();
        canvas.backgroundColor = bgColor;
        canvas.requestRenderAll();
        canvas.isDrawingMode = false;
        disableSelection();
        break;
      case "pencil":
        canvas.isDrawingMode = true;
        const pencil = new PencilBrush(canvas);
        pencil.width = width;
        pencil.color = color;
        canvas.freeDrawingBrush = pencil;
        disableSelection();
        break;
      case "eraser":
        canvas.isDrawingMode = true;
        const eraser = new EraserBrush(canvas);
        eraser.width = width;
        canvas.freeDrawingBrush = eraser;
        disableSelection();
        break;
      case "text":
        canvas.isDrawingMode = false;
        let text = new IText("Add Line", {
          fontSize: 30,
          fontWeight: "bold",
          fill: color,
          left: 100,
          top: 100,
          erasable: true,
        });
        canvas.add(text);
        disableSelection();
        break;
        case "whiteboard":
          canvas.isDrawingMode = false;
          disableSelection();
        break
      case "select":
        // enable object selection & interaction
        canvas.isDrawingMode = false;
        enableSelection();
        break;
      default:
        break;
    }
  }, [canvas, ontool]);

  return (
    <>
      <center>
        <canvas ref={canvasRef}></canvas>
      </center>
    </>
  );
}
