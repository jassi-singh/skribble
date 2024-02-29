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

export interface TDrawInfo {
  id: string;
  x: number;
  y: number;
  lineWidth: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  eraseMode: boolean;
}

export interface TStore {
  msgList: TMsg[];
  players: TPlayer[];
  timer: number;
  socket: Socket;
  addMsg: (msg: TMsg) => void;
  addPlayer: (player: TPlayer) => void;
  updatePlayer: (player: TPlayer) => void;
  startTimer: () => void;
}
