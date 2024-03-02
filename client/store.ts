import { create } from "zustand";
import { TMsg, TPlayer, TStore } from "@skribble/shared";
import { io } from "socket.io-client";

const useStore = create<TStore>((set, get) => ({
  msgList: [],
  players: [],
  timer: 180,
  socket: io("http://localhost:5000"),

  addMsg: (msg: TMsg) => set((state) => ({ msgList: [...state.msgList, msg] })),
  addPlayers: (players: TPlayer[]) => set({ players: [...players] }),
  updatePlayer: (player: TPlayer) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === player.id ? player : p)),
    })),
  startTimer: () => {
    const audio = new Audio("/tick.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    const timerId = setInterval(() => {
      const timeLeft = get().timer;

      if (timeLeft == 0) {
        clearInterval(timerId);
        audio.pause();
        set({ timer: 180 });
        return;
      } else if (timeLeft == 9) {
        audio.play();
      }
      set((state) => ({ timer: state.timer - 1 }));
    }, 1000);
  },
}));

export default useStore;
