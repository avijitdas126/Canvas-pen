import { Monitor, MonitorX, PenToolIcon } from "lucide-react";
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
  const [toggle, settoggle] = useState(false);
  const [isClose, setisClose] = useState(false);
  // const [selectedShape, setSelectedShape] = useState(null);
  const [item, setitem] = useState(<></>);
  const [width, setwidth] = useState(20);
  // const { canvasEditor } = useCanvasEditor();
  // PencilBrush()
  const [pos, setPos] = useState({ x: 3, y: 3 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [color, setcolor] = useState("#000000");
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
                                    window.electron.getSelectedOption({
                                      shape: elem.name,
                                    });
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
                        if (e.name == "close") {
                          window.electron.getSelectedOption({
                            tool: e.name,
                            isClose: !isClose,
                          });
                          setisClose(!isClose);
                        } else {
                          window.electron.getSelectedOption({ tool: e.name });
                        }
                      }}
                    >
                      {e.name == "whiteboard" ? (
                        <span
                          onClick={() => {
                            window.electron.toggleWin(!toggle);
                            settoggle(!toggle);
                          }}
                        >
                          {toggle ? <Monitor /> : e.icon}
                        </span>
                      ) : (
                        e.icon
                      )}
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
                            window.electron.setRange(event.target.value);
                          }}
                        />
                      </div>
                    )}
                    {e.name == "color" && (
                      <div className="subchild">
                        <input
                          type="color"
                          value={color}
                          onChange={(event) => {
                            setcolor(event.target.value);
                            window.electron.setColors(event.target.value);
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
