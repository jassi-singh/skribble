import { create } from "zustand";
import { SocketEvents, TMsg, TPlayer, TStore } from "@skribble/shared";
import { io } from "socket.io-client";

const useStore = create<TStore>((set, get) => ({
  user: null,
  currentPlayerId: null,
  currentWord: null,
  round: 1,
  msgList: [],
  players: [],
  timer: 180,
  timerId: null,
  socket: io("http://localhost:5000"),
  infoText: null,
  setInfoText: (infoText: string | null) => set({ infoText }),
  setRound: (round: number) => set({ round }),
  setUser: (user: TPlayer) => set({ user }),
  setCurrentPlayerId: (currentPlayerId: string) => set({ currentPlayerId }),
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
        audio.pause();
        clearInterval(timerId);
        set({ timer: 30 });
        return;
      } else if (timeLeft == 9) {
        audio.play();
      }
      set((state) => ({ timer: state.timer - 1 }));
    }, 1000);

    set({ timerId });
  },
  syncTimer: (time: number) => set({ timer: time }),
  setCurrentWord: (word: string) => set({ currentWord: word }),
}));

export default useStore;
