import useCanvasDimensions from "@/hooks/useCanvasDimension";
import useStore from "@/store";
import {
  CircleIcon,
  ClockIcon,
  EraserIcon,
  Pencil1Icon,
  ReloadIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import Timer from "./timer";

const DrawArea = () => {
  const canvasCtx = useStore((state) => state.canvasCtx);
  const setCanvasCtx = useStore((state) => state.setCanvasCtx);
  const [isErasing, setIsErasing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  let isMoving = false;
  useCanvasDimensions(canvasRef, containerRef);

  const startDrawing = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    isMoving = true;
    draw(e);
  };

  const draw = (e: MouseEvent) => {
    if (!canvasRef.current || !isMoving || !canvasCtx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    canvasCtx.lineCap = "round";
    if (isErasing) {
      canvasCtx.clearRect(
        e.clientX - rect.x,
        e.clientY - rect.y,
        canvasCtx.lineWidth,
        canvasCtx.lineWidth
      );
    } else {
      canvasCtx.lineTo(e.clientX - rect.x, e.clientY - rect.y);
      canvasCtx.stroke();
    }
  };

  const stopDrawing = (e: MouseEvent) => {
    canvasCtx?.beginPath();
    isMoving = false;
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    setCanvasCtx(canvasRef.current.getContext("2d")!);
  }, []);

  return (
    <section
      ref={containerRef}
      className="col-span-2 rounded-md text-center relative"
    >
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      ></canvas>

      <Form setIsErasing={setIsErasing} />

      <Timer />
    </section>
  );
};

type TStrokeStyle = {
  size: number;
  color: string;
  eraser: boolean;
};

const solids = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#7FFF00",
  "#00FF00",
  "#00FF7F",
  "#00FFFF",
  "#007FFF",
  "#0000FF",
  "#7F00FF",
  "#FF00FF",
  "#FF007F",
  "#800000",
  "#8B4513",
  "#2F4F4F",
  "#008080",
  "#000080",
  "#4B0082",
  "#696969",
  "#808080",
  "#A9A9A9",
  "#C0C0C0",
  "#FFA07A",
  "#FA8072",
  "#E9967A",
  "#F08080",
  "#CD5C5C",
  "#DC143C",
  "#B22222",
  "#FF4500",
];

const Form = ({
  setIsErasing,
}: {
  setIsErasing: Dispatch<SetStateAction<boolean>>;
}) => {
  const canvasCtx = useStore((state) => state.canvasCtx);
  const [strokeStyle, setStrokeStyle] = useState<TStrokeStyle>({
    size: 1,
    color: "#ffffff",
    eraser: false,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);

  const changeColor = (color: string) => {
    setStrokeStyle((style) => ({ ...style, color }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStrokeStyle((style) => ({
      ...style,
      [e.target.name]: e.target.value,
    }));
  };

  const handleModeChange = (type: string) => {
    setStrokeStyle((style) => ({ ...style, eraser: type === "eraser" }));
  };

  const resetCanvas = () => {
    if (canvasCtx) {
      canvasCtx.reset();
      canvasCtx.lineWidth = strokeStyle.size;
      canvasCtx.strokeStyle = strokeStyle.color;
    }
  };

  useEffect(() => {
    if (canvasCtx) {
      canvasCtx.lineWidth = strokeStyle.size;
      canvasCtx.strokeStyle = strokeStyle.color;
      setIsErasing(strokeStyle.eraser);
    }
  }, [canvasCtx, strokeStyle]);

  return (
    <div className="absolute bottom-4 w-full flex justify-between items-center">
      <div className="rounded-md p-4 flex gap-4 dark:bg-zinc-950 bg-white">
        <div className="flex gap-2 items-center">
          <CircleIcon />
          <Input
            max={100}
            min={1}
            type="number"
            name="size"
            className="w-20"
            value={strokeStyle.size}
            onChange={handleChange}
          />
        </div>

        <Select defaultValue={"pencil"} onValueChange={handleModeChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="pencil">
                <Pencil1Icon />
              </SelectItem>
              <SelectItem value="eraser">
                <EraserIcon />
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger>
            <Button variant="outline">
              <span
                style={{ background: strokeStyle.color }}
                className="h-full w-5 rounded-sm mr-4"
              ></span>
              {strokeStyle.color}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="space-y-4">
            <div className="text-lg font-semi">Select Color</div>

            <div className="flex flex-wrap gap-4 max-h-40 overflow-auto">
              {solids.map((color) => (
                <span
                  key={color}
                  className="h-5 w-5 rounded-sm"
                  style={{ background: color }}
                  onClick={() => {
                    changeColor(color);
                    setPopoverOpen(false);
                  }}
                ></span>
              ))}
            </div>

            <Input
              value={strokeStyle.color}
              onChange={(e) => changeColor(e.target.value)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button variant={"outline"} onClick={resetCanvas}>
        <ReloadIcon />
      </Button>
    </div>
  );
};

export default DrawArea;
