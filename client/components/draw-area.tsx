import useCanvasCtx from "@/hooks/useCanvasCtx";
import useStore from "@/store";
import {
  Circle,
  Eraser,
  Pencil,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import {
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
import { SocketEvents, TDrawInfo } from "@skribble/shared";
import { useSearchParams } from "next/navigation";

const DrawArea = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [isErasing, setIsErasing] = useState(false);
  const socket = useStore((state) => state.socket);
  const isDrawing = useStore(
    (state) => state.user?.id == state.currentPlayerId
  );
  const infoText = useStore((state) => state.infoText);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasCtx = useCanvasCtx(canvasRef, containerRef);
  let isMoving = false;

  const startDrawing = (e: MouseEvent) => {
    if (!canvasRef.current || !isDrawing) return;
    isMoving = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const drawInfo: TDrawInfo = {
      x: e.clientX - rect.x,
      y: e.clientY - rect.y,
      lineWidth: canvasCtx!.lineWidth,
      strokeStyle: canvasCtx!.strokeStyle,
      eraseMode: isErasing,
      width: canvasRef.current.width,
      height: canvasRef.current.height,
      type: "start",
    };
    socket.emit(SocketEvents.startDraw, drawInfo, roomId);
    draw(drawInfo);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return;
    if (isMoving && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const drawInfo: TDrawInfo = {
        x: e.clientX - rect.x,
        y: e.clientY - rect.y,
        lineWidth: canvasCtx!.lineWidth,
        strokeStyle: canvasCtx!.strokeStyle,
        eraseMode: isErasing,
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        type: "drawing",
      };
      socket.emit(SocketEvents.drawing, drawInfo, roomId);
      draw(drawInfo);
    }
  };

  const draw = (drawInfo: TDrawInfo) => {
    if (!canvasRef.current || !isMoving || !canvasCtx) return;
    canvasCtx.lineCap = "round";
    if (drawInfo.eraseMode) {
      canvasCtx.globalCompositeOperation = "destination-out";
    } else {
      canvasCtx.globalCompositeOperation = "source-over";
    }

    const [scaleX, scaleY] = [
      canvasRef.current.width / drawInfo.width,
      canvasRef.current.height / drawInfo.height,
    ];

    canvasCtx.strokeStyle = drawInfo.strokeStyle;
    canvasCtx.lineWidth = drawInfo.lineWidth * scaleX * scaleY;
    canvasCtx.lineTo(drawInfo.x * scaleX, drawInfo.y * scaleY);
    canvasCtx.stroke();
  };

  const stopDrawing = (e: MouseEvent) => {
    if (!isDrawing) return;
    canvasCtx?.beginPath();
    isMoving = false;
    socket.emit(SocketEvents.stopDraw, roomId);
  };

  useEffect(() => {
    const start = (drawInfo: TDrawInfo) => {
      isMoving = true;
      draw(drawInfo);
    };

    const drawing = (drawInfo: TDrawInfo) => {
      draw(drawInfo);
    };

    const stop = () => {
      canvasCtx?.beginPath();
      isMoving = false;
    };

    const sync = (commands: Array<TDrawInfo | "stop">) => {
      commands.forEach((cmd) => {
        if (cmd == "stop") {
          stop();
        } else {
          if (cmd.type == "start") {
            start(cmd);
          } else {
            drawing(cmd);
          }
        }
      });
    };

    socket.on(SocketEvents.startDraw, start);
    socket.on(SocketEvents.drawing, drawing);
    socket.on(SocketEvents.stopDraw, stop);
    socket.on(SocketEvents.syncCanvas, sync);

    return () => {
      socket.removeListener(SocketEvents.startDraw, start);
      socket.removeListener(SocketEvents.drawing, drawing);
      socket.removeListener(SocketEvents.stopDraw, stop);
      socket.removeListener(SocketEvents.syncCanvas, sync);
    };
  }, [canvasCtx]);

  return (
    <section
      ref={containerRef}
      className="col-span-2 rounded-md text-center relative border"
    >
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={onMouseMove}
        ref={canvasRef}
      ></canvas>

      <Form setIsErasing={setIsErasing} canvasCtx={canvasCtx} roomId={roomId} />

      {infoText && (
        <div className="absolute bottom-0 p-4 w-full h-full flex items-center justify-center bg-white/10 rounded-md border">
          {infoText}
        </div>
      )}
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
  canvasCtx,
  roomId,
}: {
  setIsErasing: Dispatch<SetStateAction<boolean>>;
  canvasCtx: CanvasRenderingContext2D | null;
  roomId: string | null;
}) => {
  const isDrawing = useStore(
    (state) => state.user?.id == state.currentPlayerId
  );
  const [strokeStyle, setStrokeStyle] = useState<TStrokeStyle>({
    size: 1,
    color: "#ffffff",
    eraser: false,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const socket = useStore((state) => state.socket);

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

  const onReset = () => {
    socket.emit(SocketEvents.resetCanvas, roomId);
    resetCanvas();
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

  useEffect(() => {
    socket.on(SocketEvents.resetCanvas, resetCanvas);

    return () => {
      socket.removeListener(SocketEvents.resetCanvas, resetCanvas);
    };
  }, [canvasCtx]);

  if (isDrawing)
    return (
      <div className="absolute bottom-0 p-4 w-full flex justify-between items-center">
        <div className="rounded-md flex gap-4 dark:bg-zinc-950 bg-white">
          <div className="flex gap-2 items-center">
            <Circle />
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
                  <Pencil />
                </SelectItem>
                <SelectItem value="eraser">
                  <Eraser />
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

        <Button variant={"outline"} onClick={onReset}>
          <ArrowCounterClockwise />
        </Button>
      </div>
    );
};

export default DrawArea;
