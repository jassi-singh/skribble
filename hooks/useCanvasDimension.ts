import { RefObject, useEffect } from "react";

const useCanvasDimensions = (
  canvasRef: RefObject<HTMLCanvasElement>,
  containerRef: RefObject<HTMLDivElement>
) => {
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    }
  }, []);
};

export default useCanvasDimensions;
