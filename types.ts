import { RefObject } from "react";

export interface TPlayer {
  id: string;
  name: string;
  rank?: number;
  score: number;
  profilePic: string;
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
  canvasRef: RefObject<HTMLCanvasElement>;

  addMsg: (msg: TMsg) => void;
  addPlayer: (player: TPlayer) => void;
  updatePlayer: (player: TPlayer) => void;
}
