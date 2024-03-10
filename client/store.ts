import { create } from "zustand";
import { TMsg, TPlayer, TStore } from "@skribble/shared";
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
  answeredBy: new Set(),
  setInfoText: (infoText: string | null) => set({ infoText }),
  setRound: (round: number) => set({ round }),
  setUser: (user: TPlayer) => set({ user }),
  setCurrentPlayerId: (currentPlayerId: string) => set({ currentPlayerId }),
  addMsg: (msg: TMsg) => {
    set((state) => ({ msgList: [...state.msgList, msg] }));
    if (msg.isCorrect) {
      set({ answeredBy: get().answeredBy.add(msg.sender.id) });
    }
  },
  addPlayers: (players: TPlayer[]) => set({ players: [...players] }),
  updatePlayer: (player: TPlayer) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === player.id ? player : p)),
    })),
  startTimer: () => {
    const tid = get().timerId;
    set({timer: 180})
    if (tid) clearInterval(tid);
    const audio = new Audio("/tick.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    const timerId = setInterval(() => {
      const timeLeft = get().timer;

      if (timeLeft == 0) {
        audio.pause();
        clearInterval(timerId);
        set({ timer:180 });
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
  resetAnsweredBy: () => set({ answeredBy: new Set() }),
}));

export default useStore;
