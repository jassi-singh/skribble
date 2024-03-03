import { TPlayer } from "@skribble/shared";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Crown, Pencil } from "@phosphor-icons/react";
import useStore from "@/store";

const Player = ({ player }: { player: TPlayer }) => {
  const isDrawing = useStore((state) => player.id == state.currentPlayerId);
  return (
    <div className="flex items-center gap-4">
      <span className="text-primary/80 text-xl w-10 text-start">
        #{player.rank}
      </span>
      <div className="relative">
        <Avatar>
          <AvatarFallback>{player.name[0]}</AvatarFallback>
        </Avatar>
        {player.isAdmin && (
          <Crown fill="yellow" className="absolute -top-1 right-0 rotate-45" />
        )}
      </div>
      <div className="space-y-2 text-start">
        <div className="text-sm">{player.name}</div>
        <div className="text-xs">{player.score}</div>
      </div>

      {isDrawing && <Pencil className="ml-auto" />}
    </div>
  );
};

export default Player;
