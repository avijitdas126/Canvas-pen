import { EyeClosed, Monitor, MonitorX, PenToolIcon } from "lucide-react";
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

  // Refs used to avoid rerenders while dragging
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const pendingPosRef = useRef(null);

  // Pointer-based handlers for smoother dragging (works across devices)
  const onPointerDownEvent = (e) => {
    // avoid React synthetic event reuse issues
    const ev = e.nativeEvent || e;
    draggingRef.current = true;
    window.electron.dragStart();
    // store pointer offset inside the window so window top-left = screen - client
    offsetRef.current = { x: ev.clientX, y: ev.clientY };
    // capture pointer so we continue to receive move/up even if pointer leaves element
    try {
      e.currentTarget &&
        e.currentTarget.setPointerCapture &&
        e.currentTarget.setPointerCapture(ev.pointerId);
    } catch (err) {
      // ignore if not supported
    }
    // Add global listeners so we still receive pointerup/move if pointer leaves the element/window
    window.addEventListener("pointermove", onPointerMoveEvent);
    window.addEventListener("pointerup", onPointerUpEvent);
    window.addEventListener("pointercancel", onPointerUpEvent);
  };

  const flushPos = () => {
    rafRef.current = null;
    if (pendingPosRef.current) {
      window.electron.setWinPosition(pendingPosRef.current);
      pendingPosRef.current = null;
    }
  };

  const onPointerMoveEvent = (e) => {
    if (!draggingRef.current) return;
    const ev = e.nativeEvent || e;
    // compute top-left of window so the pointer stays at the same offset
    const x = ev.screenX - offsetRef.current.x;
    const y = ev.screenY - offsetRef.current.y;
    pendingPosRef.current = { x, y };
    if (!rafRef.current)
      rafRef.current = window.requestAnimationFrame(flushPos);
  };

  const onPointerUpEvent = (e) => {
    const ev = e.nativeEvent || e;
    draggingRef.current = false;
    window.electron.dragEnd();
    try {
      e.currentTarget &&
        e.currentTarget.releasePointerCapture &&
        e.currentTarget.releasePointerCapture(ev.pointerId);
    } catch (err) {}
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (pendingPosRef.current) {
      window.electron.setWinPosition(pendingPosRef.current);
      pendingPosRef.current = null;
    }
    // Remove the global listeners we added on pointerdown
    try {
      window.removeEventListener("pointermove", onPointerMoveEvent);
      window.removeEventListener("pointerup", onPointerUpEvent);
      window.removeEventListener("pointercancel", onPointerUpEvent);
    } catch (err) {
      // ignore
    }
  };

  // Ensure we clean up listeners and end drag if the component unmounts while dragging
  useEffect(() => {
    return () => {
      if (draggingRef.current) {
        try {
          window.electron.dragEnd();
        } catch (err) {}
        draggingRef.current = false;
      }
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      try {
        window.removeEventListener("pointermove", onPointerMoveEvent);
        window.removeEventListener("pointerup", onPointerUpEvent);
        window.removeEventListener("pointercancel", onPointerUpEvent);
      } catch (err) {}
    };
  }, []);

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
          // pointer events provide smoother dragging and better capture
          onPointerDown={onPointerDownEvent}
          onPointerMove={onPointerMoveEvent}
          onPointerUp={onPointerUpEvent}
          onPointerCancel={onPointerUpEvent}
          role="presentation"
        >
          <div style={{ WebkitAppRegion: "no-drag" }} className="onDrag">
            <PenToolIcon size={22} />
          </div>
        </div>
        {isClose ? (
          <>
            <div className="item-list list active">
              <ul>
                <li>
                  <p
                    className="text-center"
                    title="Open"
                    onClick={() => {
                      window.electron.getSelectedOption({
                        tool: "close",
                        isClose: !isClose,
                      });
                      setisClose(!isClose);
                    }}
                  >
                    <EyeClosed />
                  </p>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {" "}
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
                          className={`text-center ${
                            select == e.id && "active"
                          }`}
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
                              window.electron.getSelectedOption({
                                tool: e.name,
                              });
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
          </>
        )}
      </div>
    </>
  );
}
