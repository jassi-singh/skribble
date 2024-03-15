"use client";

import PlayersList from "@/components/player-list";
import DrawArea from "@/components/draw-area";
import MsgList from "@/components/msg-list";
import { Suspense, useEffect, useState } from "react";
import useStore from "@/store";
import { SocketEvents } from "@skribble/shared";
import GameInfo from "@/components/game-info";
import StartupDialog from "@/components/dialogs/startup";
import SelectWordDialog from "@/components/dialogs/select-word";
import ShowResultsDialog from "@/components/dialogs/show-result";
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
      <Suspense fallback={<p>Loading..</p>}>
        <GameInfo />
        <div className="relative flex-grow w-full grid grid-cols-4 gap-4 overflow-auto">
          <PlayersList />
          <DrawArea />
          <MsgList />
          <StartupDialog />
          <SelectWordDialog open={open} setOpen={setOpen} words={words} />
          <ShowResultsDialog open={showResults} setOpen={setShowResults} />
        </div>
      </Suspense>
    </main>
  );
}
