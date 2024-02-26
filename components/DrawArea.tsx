import useCanvasDimensions from "@/hooks/useCanvasDimension";
import useStore from "@/store";
import { useRef } from "react";

const DrawArea = () => {
  const canvasRef = useStore((state) => state.canvasRef);
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
