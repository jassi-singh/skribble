import { Duration } from "moment";
import { Socket } from "socket.io-client";

export interface TPlayer {
  id: string;
  name: string;
  rank?: number;
  score: number;
  isDrawing: boolean;
}

export interface TMsg {
  id: string;
  sender: Pick<TPlayer, "id" | "name">;
  message: string;
}

export interface TStore {
  msgList: TMsg[];
  players: TPlayer[];
  canvasCtx: CanvasRenderingContext2D | null;
  timer: number;
  socket: Socket;

  addMsg: (msg: TMsg) => void;
  addPlayer: (player: TPlayer) => void;
  updatePlayer: (player: TPlayer) => void;
  setCanvasCtx: (ctx: CanvasRenderingContext2D) => void;
  startTimer: () => void;
}
