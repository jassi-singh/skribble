import { Socket } from "socket.io-client";

export interface TPlayer {
  id: string;
  name: string;
  rank?: number;
  score: number;
  isAdmin: boolean;
}

export interface TMsg {
  id: string | null;
  sender: Pick<TPlayer, "id" | "name">;
  message: string;
  isCorrect: boolean;
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
  user: TPlayer | null;
  round: number;
  currentPlayerId: string | null;
  currentWord: string | null;
  msgList: TMsg[];
  players: TPlayer[];
  timer: number;
  timerId: NodeJS.Timeout | null;
  socket: Socket;
  infoText: string | null;
  setInfoText: (text: string | null) => void;
  addMsg: (msg: TMsg) => void;
  addPlayers: (players: TPlayer[]) => void;
  updatePlayer: (player: TPlayer) => void;
  startTimer: () => void;
  setUser: (user: TPlayer) => void;
  setCurrentPlayerId: (currentPlayerId: string) => void;
  setRound: (round: number) => void;
  setCurrentWord: (word: string) => void;
  syncTimer: (time: number) => void;
}

export interface TRoomInfo {
  currentWord?: string;
  currentPlayerId?: string;
  players: TPlayer[];
  currentDrawingInfo: Array<TDrawInfo | "stop">;
  round: number;
  answeredBy: Set<string>;
  timeLeft: number;
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
  message = "message",
  startGame = "start-game",
  showWords = "show-words",
  selectWord = "select-word",
  setInfoText = "set-info-text",
  syncTimer = "sync-timer",
  setRound = "set-round",
}
