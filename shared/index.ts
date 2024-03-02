import { Socket } from "socket.io-client";

export interface TPlayer {
  id: string;
  name: string;
  rank?: number;
  score: number;
  isDrawing: boolean;
  isAdmin: boolean;
}

export interface TMsg {
  id: string;
  sender: Pick<TPlayer, "id" | "name">;
  message: string;
}

export interface TDrawInfo {
  x: number;
  y: number;
  height: number;
  width: number;
  lineWidth: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  eraseMode: boolean;
  type: "start" | "drawing";
}

export interface TStore {
  msgList: TMsg[];
  players: TPlayer[];
  timer: number;
  socket: Socket;
  addMsg: (msg: TMsg) => void;
  addPlayers: (players: TPlayer[]) => void;
  updatePlayer: (player: TPlayer) => void;
  startTimer: () => void;
}

export interface TRoomInfo {
  currentWord?: string;
  currentPlayerId?: string;
  players: TPlayer[];
  currentDrawingInfo: Array<TDrawInfo | "stop">;
}

export enum SocketEvents {
  resetCanvas = "reset-canvas",
  startDraw = "start-draw",
  drawing = "drawing",
  stopDraw = "stop-draw",
  updatePlayers = "update-players",
  syncCanvas = "sync-canvas",
  userJoin = "user-join",
  createRoom = "create-room",
}
