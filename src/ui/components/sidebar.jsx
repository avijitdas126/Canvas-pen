import { PenToolIcon } from "lucide-react";
import { EraserBrush, ClippingGroup } from "@erase2d/fabric";
import React, { useEffect, useRef, useState } from "react";
import Items, { Setting } from "./Items";
// import { useCanvasEditor } from "../App";
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
  // const [selectedShape, setSelectedShape] = useState(null);
  const [item, setitem] = useState(<></>);
  const [width, setwidth] = useState(20);
  // const { canvasEditor } = useCanvasEditor();
  // PencilBrush()
  const [pos, setPos] = useState({ x: 3, y: 3 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // const [color, setcolor] = useState("#000000");
  const onDrag = useRef(null);

  const onMouseDownEvent = (e) => {
    setDragging(true);
    window.electron.dragStart();

    setOffset({ x: e.clientX, y: e.clientY });
  };

  const onMouseMoveEvent = (e) => {
    if (!dragging) return;
    window.electron.setWinPosition({
      x: e.screenX - offset.x,
      y: e.screenY - offset.y,
    });
  };

  const onMouseUpEvent = () => {
    setDragging(false);

    window.electron.dragEnd();
  };

  const [isMouseDown, setisMouseDown] = useState(false);

  function enableSidebar() {
    window.electron.allowSidebarClicks(true);
  }

  function disableSidebar() {
    if (!isMouseDown) {
      window.electron.allowSidebarClicks(false);
    }
  }

  // const [bgColor, setBgColor] = useState("transparent");

  // useEffect(() => {
  // if (!canvasEditor) return;
  // canvasEditor.backgroundColor = bgColor;
  // canvasEditor.requestRenderAll();

  // }, [
  // canvasEditor,
  //  bgColor]);

  // useEffect(() => {
  // if (!canvasEditor) return;
  // canvasEditor.freeDrawingBrush.width = width;
  // }, [width]);

  // useEffect(() => {
  // if (!canvasEditor) return;
  // const onhandleShape = (opt) => {
  // if (!selectedShape) return;
  //     const pointer = canvasEditor.getPointer(opt.e);
  //     const { x, y } = pointer;
  //     const properties = {
  //       left: x,
  //       top: y,
  //       fill: "transparent",
  //       stroke: color,
  //       strokeWidth: 2,
  //       erasable: true,
  //     };
  //     let shape = null;
  //     switch (selectedShape) {
  //       case "circle":
  //         shape = new Circle({ ...properties, radius: 50 });
  //         break;
  //       case "rectangle":
  //         shape = new Rect({ ...properties, width: 100, height: 60 });

  //         break;
  //       case "triangle":
  //         shape = new Triangle({ ...properties, width: 100, height: 60 });

  //         break;
  //       case "ellipse":
  //         shape = new Ellipse({
  //           ...properties,
  //           rx: 80,
  //           ry: 40,
  //         });

  //         break;
  //       case "line":
  //         shape = new Line([x, y, x + 100, y + 50], {
  //           stroke: color,
  //           strokeWidth: 2,
  //           erasable: true,
  //         });

  //         break;
  //       default:
  //         break;
  //     }
  //     if (shape) {
  //       canvasEditor.add(shape);
  //       canvasEditor.setActiveObject(shape);
  //       canvasEditor.renderAll();
  //     }
  //     // ✅ After drawing, deselect the shape
  //     setSelectedShape(null);
  //   };
  //   canvasEditor.on("mouse:down", onhandleShape);
  //   return () => {
  //     canvasEditor.off("mouse:down", onhandleShape);
  //   };
  // }, [canvasEditor, selectedShape]);
  // useEffect(() => {

  // }, []);
  // useEffect(() => {
  //   if (!canvasEditor) return;
  //   canvasEditor.on("path:created", (e) => {
  //     e.path.erasable = true;
  //   });
  // }, [canvasEditor]);

  // function onhandleSetting(setting) {
  //   if (!canvasEditor || !window.electron) return;

  //   switch (setting) {
  //     case "clear":
  //       canvasEditor.clear();
  //       break;
  //     case "cursor":
  //       canvasEditor.isDrawingMode = false;
  //       window.electron.setDrawMode(true);

  //       break;
  //     case "pencil":
  //       canvasEditor.isDrawingMode = true;
  //       const pencil = new PencilBrush(canvasEditor);
  //       pencil.width = width;
  //       pencil.color = color;
  //       canvasEditor.freeDrawingBrush = pencil;

  //       break;
  //     case "eraser":
  //       canvasEditor.isDrawingMode = true;
  //       const eraser = new EraserBrush(canvasEditor);
  //       eraser.width = width;
  //       canvasEditor.freeDrawingBrush = eraser;

  //       break;
  //     case "text":
  //       let text = new IText("Add Line", {
  //         fontSize: 30,
  //         fontWeight: "bold",
  //         fill: color,
  //         left: 100,
  //         top: 100,
  //         erasable: true,
  //       });
  //       canvasEditor.add(text);
  //       break;
  //     case "whiteboard":
  //       setBgColor("#fafafa");
  //       break;
  //     default:
  //       break;
  //   }
  // }
  return (
    <>
      <div
        className="sidebar"
        id="sidebar"
        style={{
          cursor: "pointer",
        }}
        onMouseEnter={enableSidebar}
        onMouseLeave={disableSidebar}
      >
        <div
          className="dragArea"
          onMouseDown={onMouseDownEvent}
          onMouseUp={onMouseUpEvent}
          onMouseMove={onMouseMoveEvent}
        >
          <div style={{ WebkitAppRegion: "no-drag" }} className="onDrag">
            <PenToolIcon size={22} />
          </div>
        </div>

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
