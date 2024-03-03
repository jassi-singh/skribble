import { RefObject, useEffect, useState } from "react";

const useCanvasCtx = (
  canvasRef: RefObject<HTMLCanvasElement>,
  containerRef: RefObject<HTMLDivElement>
): CanvasRenderingContext2D | null => {
  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(
    null
  );
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height - 2;

      setCanvasCtx(canvasRef.current.getContext("2d"));
    }
  }, []);

  return canvasCtx;
};

export default useCanvasCtx;
