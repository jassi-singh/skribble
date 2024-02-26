import useCanvasDimensions from "@/hooks/useCanvasDimension";
import { useRef } from "react";

const DrawArea = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useCanvasDimensions(canvasRef, containerRef);
  return (
    <section
      ref={containerRef}
      className="col-span-2 rounded-md ring ring-zinc-900 text-center"
    >
      <canvas ref={canvasRef} className=""></canvas>
    </section>
  );
};

export default DrawArea;
