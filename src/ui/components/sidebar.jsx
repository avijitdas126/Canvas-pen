import { PenToolIcon } from "lucide-react";
import { EraserBrush, ClippingGroup } from "@erase2d/fabric";
import React, { useEffect, useState } from "react";
import Items, { Setting } from "./Items";
import { useCanvasEditor } from "../App";
import {
  Circle,
  Ellipse,
  IText,
  Line,
  PencilBrush,
  Rect,
  Triangle,
} from "fabric";
export default function Sidebar() {
  const [select, setselect] = useState(9);
  const [selectedShape, setSelectedShape] = useState(null);
  const [item, setitem] = useState(<></>);
  const [width, setwidth] = useState(20);
  const { canvasEditor } = useCanvasEditor();
  // PencilBrush()
  const [pos, setPos] = useState({ x: 3, y: 3 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [color, setcolor] = useState("#000000");

  const onMouseDown = (e) => {
    setDragging(true);
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const onMouseUp = () => setDragging(false);

  const onMouseMove = (e) => {
    if (dragging) {
      setPos({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };
  useEffect(() => {
    if (!canvasEditor) return;
    canvasEditor.freeDrawingBrush.width = width;
  }, [width]);

  useEffect(() => {
    if (!canvasEditor) return;
    const onhandleShape = (opt) => {
      if (!selectedShape) return;
      const pointer = canvasEditor.getPointer(opt.e);
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
      switch (selectedShape) {
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
        canvasEditor.add(shape);
        canvasEditor.setActiveObject(shape);
        canvasEditor.renderAll();
      }
      // ✅ After drawing, deselect the shape
      setSelectedShape(null);
    };
    canvasEditor.on("mouse:down", onhandleShape);
    return () => {
      canvasEditor.off("mouse:down", onhandleShape);
    };
  }, [canvasEditor, selectedShape]);
  useEffect(() => {
    if (!canvasEditor) return;
    canvasEditor.on("path:created", (e) => {
      e.path.erasable = true;
    });
  }, [canvasEditor]);

  function onhandleSetting(setting) {
    switch (setting) {
      case "clear":
        canvasEditor.clear();
        break;
      case "cursor":
        canvasEditor.isDrawingMode = false;
        break;
      case "pencil":
        if (!canvasEditor) return;
        canvasEditor.isDrawingMode = true;
        const pencil = new PencilBrush(canvasEditor);
        pencil.width = width;
        pencil.color = color;
        canvasEditor.freeDrawingBrush = pencil;
        break;
      case "eraser":
        if (!canvasEditor) return;
        canvasEditor.isDrawingMode = true;
        const eraser = new EraserBrush(canvasEditor);
        eraser.width = width;
        canvasEditor.freeDrawingBrush = eraser;
        break;
      case "text":
        if (!canvasEditor) return;
        let text = new IText("Add Line", {
          fontSize: 30,
          fontWeight: "bold",
          fill: color,
          left: 100,
          top: 100,
          erasable: true,
        });
        canvasEditor.add(text);
        break;
      default:
        break;
    }
  }
  return (
    <>
      <div
        className="sidebar"
        id="sidebar"
        style={{
          left: pos.x,
          top: pos.y,
          cursor: "pointer",
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        <center>
          <PenToolIcon size={22} />
        </center>

        <div className="item-list list">
          <ul>
            {Items.map((e) => {
              return (
                <>
                  <li>
                    <p
                      className={`text-center ${select == 1 && "active"}`}
                      title={e.title}
                      onClick={() => {
                        if (select == 1) {
                          setitem(item);
                        } else {
                          setitem(e.icon);
                        }
                        setselect(e.id);
                      }}
                    >
                      {select == e.id ? <>{item}</> : <>{e.icon}</>}
                    </p>
                    {e.child.length ? (
                      <>
                        <div className="subchild">
                          {e.child.map((elem) => {
                            return (
                              <>
                                <p
                                  className="text-center"
                                  title={elem.title}
                                  onClick={() => {
                                    setitem(elem.icon);
                                    setSelectedShape(elem.name);
                                  }}
                                >
                                  {elem.icon}
                                </p>
                              </>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </li>
                </>
              );
            })}
          </ul>
        </div>
        <div className="item-list">
          <ul>
            {Setting.map((e) => {
              return (
                <>
                  <li>
                    <p
                      className={`text-center ${select == e.id && "active"}`}
                      title={e.title}
                      onClick={() => {
                        setselect(e.id);
                        onhandleSetting(e.name);
                      }}
                    >
                      {e.icon}
                    </p>
                    {e.name == "stroke" && (
                      <div className="subchild">
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={width}
                          onChange={(event) => {
                            setwidth(event.target.value);
                          }}
                        />
                      </div>
                    )}
                    {e.name == "color" && (
                      <div className="subchild">
                        <input
                          type="color"
                          onChange={(event) => {
                            setcolor(event.target.value);
                          }}
                        />
                      </div>
                    )}
                  </li>
                </>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
