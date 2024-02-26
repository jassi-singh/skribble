import { create } from "zustand";
import { TMsg, TPlayer, TStore } from "./types";
import { createRef, useRef } from "react";

const useStore = create<TStore>((set) => ({
  msgList: [],
  players: [],
  canvasRef: createRef<HTMLCanvasElement>(),

  addMsg: (msg: TMsg) => set((state) => ({ msgList: [...state.msgList, msg] })),
  addPlayer: (player: TPlayer) =>
    set((state) => ({ players: [...state.players, player] })),
  updatePlayer: (player: TPlayer) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === player.id ? player : p)),
    })),
}));

export default useStore;
