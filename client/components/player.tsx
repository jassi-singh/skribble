import { TPlayer } from "@skribble/shared";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Crown, Pencil } from "@phosphor-icons/react";
import useStore from "@/store";
import { cn } from "@/lib/utils";

const Player = ({
  player,
  rank = 1,
  type = "list",
}: {
  player: TPlayer;
  rank?: number;
  type?: "leaderboard" | "list";
}) => {
  const isDrawing = useStore((state) => player.id == state.currentPlayerId);
  const hasGuessed = useStore((state) => state.answeredBy.has(player.id));

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-2",
        hasGuessed && type === "list" && "bg-green-700"
      )}
    >
      <span className="text-primary/80 text-xl w-10 text-start">#{rank}</span>
      <div className="relative">
        <Avatar>
          <AvatarFallback>{player.name[0]}</AvatarFallback>
        </Avatar>
        {player.isAdmin && type === "list" && (
          <Crown fill="yellow" className="absolute -top-1 right-0 rotate-45" />
        )}
      </div>
      <div className="space-y-2 text-start">
        <div className="text-sm">{player.name}</div>
        <div className="text-xs">{player.score}</div>
      </div>

      {isDrawing && type === "list" && <Pencil className="ml-auto" />}
    </div>
  );
};

export default Player;
