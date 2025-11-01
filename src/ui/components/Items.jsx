import {
  ALargeSmall,
  Brush,
  Circle,
  Dot,
  Egg,
  Eraser,
  LucideMousePointer,
  Pencil,
  RectangleHorizontal,
  ShapesIcon,
  Tally1,
  Trash2,
  Triangle,
  Tv,
} from "lucide-react";

const Items = [
  {
    id: 1,
    icon: <ShapesIcon />,
    title: "Add Shapes",
    child: [
      {
        icon: <Circle />,
        name: "circle",
        title: "Circle",
      },
      {
        icon: <RectangleHorizontal />,
        title: "Rectangle",
        name: "rectangle",
      },
      {
        icon: <Triangle />,
        title: "Triangle",
        name: "triangle",
      },
      {
        icon: <Egg />,
        title: "Ellipse",
        name: "ellipse",
      },
      {
        icon: <Tally1 />,
        title: "Line",
        name: "line",
      },
    ],
  },
];
export const Setting = [
   {
    id: 9,
    icon: <LucideMousePointer />,
    title: "Cursor",
    name: "cursor",
  },
  {
    id: 10,
    icon: <Pencil />,
    title: "Pencil",
    name: "pencil",
  },
  {
    id: 12,
    icon: <Trash2 />,
    title: "Clear",
    name: "clear",
  },
  {
    id: 13,
    icon: <Dot />,
    title: "Stroke",
    name: "stroke",
  },
    {
    id: 15,
    icon: <ALargeSmall />,
    title: "Text",
    name: "text",
  },
   {
    id: 27,
    icon: <Tv />,
    title: "WhiteBoard",
    name: "whiteboard",
  },
   {
    id: 17,
    icon: <Eraser />,
    title: "Eraser",
    name: "eraser",
  },
   {
    id: 20,
    icon: <Brush  />,
    title: "Brush",
    name: "color",
  },
];
export default Items;
