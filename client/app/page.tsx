"use client";

import PlayersList from "@/components/player-list";
import DrawArea from "@/components/draw-area";
import MsgList from "@/components/msg-list";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  Suspense,
  useEffect,
  useState,
} from "react";
import useStore from "@/store";
import { SocketEvents, TPlayer } from "@skribble/shared";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import GameInfo from "@/components/game-info";
import Player from "@/components/player";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const socket = useStore((state) => state.socket);
  const startTimer = useStore((state) => state.startTimer);
  const setCurrentPlayerId = useStore((state) => state.setCurrentPlayerId);
  const setCurrentWord = useStore((state) => state.setCurrentWord);
  const setInfoText = useStore((state) => state.setInfoText);
  const addPlayers = useStore((state) => state.addPlayers);
  const syncTimer = useStore((state) => state.syncTimer);
  const setRound = useStore((state) => state.setRound);
  const addMsg = useStore((state) => state.addMsg);
  const resetAnsweredBy = useStore((state) => state.resetAnsweredBy);
  const stopTimer = useStore((state) => state.stopTimer);

  useEffect(() => {
    const onSelectWord = (wordLength: number, playerId: string) => {
      setCurrentPlayerId(playerId);
      setCurrentWord("_".repeat(wordLength));
      startTimer();
      resetAnsweredBy();
    };

    const showWords = (words: string[], playerId: string) => {
      setOpen(true);
      setWords(words);
      setCurrentPlayerId(playerId);
      stopTimer();
    };

    const showResult = () => {
      setShowResults(true);
      resetAnsweredBy();
      setCurrentPlayerId(null);
      setCurrentWord(null);
    };

    const handleInfo = (text: string | null) => {
      console.log("stoptimer");
      setInfoText(text);
      if (text) stopTimer();
    };

    socket.on(SocketEvents.updatePlayers, addPlayers);
    socket.on(SocketEvents.selectWord, onSelectWord);
    socket.on(SocketEvents.setInfoText, handleInfo);
    socket.on(SocketEvents.syncTimer, syncTimer);
    socket.on(SocketEvents.showWords, showWords);
    socket.on(SocketEvents.setRound, setRound);
    socket.on(SocketEvents.message, addMsg);
    socket.on(SocketEvents.showResults, showResult);

    return () => {
      socket.removeListener(SocketEvents.updatePlayers, addPlayers);
      socket.removeListener(SocketEvents.selectWord, onSelectWord);
      socket.removeListener(SocketEvents.setInfoText, setInfoText);
      socket.removeListener(SocketEvents.syncTimer, syncTimer);
      socket.removeListener(SocketEvents.showWords, showWords);
      socket.removeListener(SocketEvents.setRound, setRound);
      socket.removeListener(SocketEvents.message, addMsg);
      socket.removeListener(SocketEvents.showResults, showResult);
    };
  }, []);
  return (
    <main className="flex h-screen flex-col p-4 gap-4">
      <nav className="w-full">
        <h1 className="text-3xl font-bold">Skribble</h1>
      </nav>
      <GameInfo />
      <div className="relative flex-grow w-full grid grid-cols-4 gap-4 overflow-auto">
        <PlayersList />
        <DrawArea />
        <MsgList />
        <Suspense fallback={<p>Loading..</p>}>
          <StartupDialog />
        </Suspense>
        <SelectWordDialog open={open} setOpen={setOpen} words={words} />
        <ShowResultsDialog open={showResults} setOpen={setShowResults} />
      </div>
    </main>
  );
}

const StartupDialog = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(true);
  const socket = useStore((state) => state.socket);
  const setUser = useStore((state) => state.setUser);
  const [player, setPlayer] = useState<TPlayer>({
    id: "",
    name: "",
    score: 0,
    isAdmin: false,
  });

  const handleStart = () => {
    setOpen(false);
    setUser(player);
    socket.emit(SocketEvents.userJoin, player, searchParams.get("roomId"));
  };

  const handleCreateRoom = () => {
    setOpen(false);
    const cb = (roomId: string) => {
      const current = new URLSearchParams();
      current.set("roomId", roomId);
      const search = current.toString();
      const query = search ? `?${search}` : "";

      router.push(`${pathname}${query}`);
    };
    player.isAdmin = true;
    setUser(player);
    socket.emit(SocketEvents.createRoom, player, cb);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayer((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const updateId = () => {
      setPlayer((player) => ({ ...player, id: socket.id ?? "" }));
    };
    socket.on("connect", updateId);

    return () => {
      socket.removeListener("connect", updateId);
    };
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              name="name"
              value={player.name}
              onChange={handleChange}
              className="col-span-3"
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant={"secondary"}
            className="w-32"
            type="submit"
            onClick={handleCreateRoom}
          >
            Create Room
          </Button>
          <Button className="w-32" type="submit" onClick={handleStart}>
            Enter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SelectWordDialog = ({
  open,
  setOpen,
  words,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  words: string[];
}) => {
  const socket = useStore((store) => store.socket);
  const currentPlayerId = useStore((store) => store.currentPlayerId);
  const setCurrentWord = useStore((store) => store.setCurrentWord);
  const startTimer = useStore((store) => store.startTimer);
  const resetAnsweredBy = useStore((state) => state.resetAnsweredBy);
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const handleSelectWord = (word: string) => () => {
    setOpen(false);
    setCurrentWord(word);
    startTimer();
    resetAnsweredBy();
    socket.emit(SocketEvents.selectWord, word, roomId, currentPlayerId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle>Select a word</DialogTitle>
        {words.map((word) => (
          <Button onClick={handleSelectWord(word)} variant="outline">
            {word}
          </Button>
        ))}
      </DialogContent>
    </Dialog>
  );
};

const ShowResultsDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const players = useStore((state) =>
    [...state.players].sort((a, b) => b.score - a.score)
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <Cross2Icon className="h-4 w-4" />
        </DialogClose>
        <DialogTitle>Leaderboard </DialogTitle>
        {players.map((player, id) => (
          <Player player={player} rank={id + 1} type={"leaderboard"} />
        ))}
      </DialogContent>
    </Dialog>
  );
};
