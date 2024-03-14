import useStore from "@/store";
import moment from "moment";
import { Button } from "./ui/button";
import { Clock } from "@phosphor-icons/react";
import { SocketEvents } from "@skribble/shared";
import { useSearchParams } from "next/navigation";

const GameInfo = () => {
  const timeLeft = useStore((state) => state.timer);
  const user = useStore((state) => state.user);
  const socket = useStore((state) => state.socket);
  const round = useStore((state) => state.round);
  const currentWord = useStore((state) => state.currentWord);
  const resetScores = useStore((state) => state.resetScores);
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const startGame = () => {
    socket.emit(SocketEvents.startGame, roomId);
    resetScores();
  };

  return (
    <div className="p-4 rounded-md flex justify-between items-center border">
      <Button variant={"outline"}>Round {round}/3</Button>
      {currentWord ? (
        <span>{currentWord.split("").map((ch) => `${ch} `)}</span>
      ) : user?.isAdmin ? (
        <Button onClick={startGame}>Start Game</Button>
      ) : (
        <></>
      )}
      <Button
        variant={timeLeft > 5 ? "outline" : "destructive"}
        className="flex gap-2 items-center"
      >
        <Clock width={20} height={20} />
        {moment.utc(timeLeft * 1000).format("mm:ss")}
      </Button>
    </div>
  );
};

export default GameInfo;
