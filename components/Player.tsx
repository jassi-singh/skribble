import { Pencil } from "@phosphor-icons/react";
import Image from "next/image";
import { PlayerType } from "@/types";

const Player = ({ player }: { player: PlayerType }) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-zinc-500 text-xl w-10 text-start">#{player.rank}</span>
      <Image
        height={40}
        width={40}
        src={player.profilePic}
        alt="avatar"
        className="rounded-full"
      />
      <div className="space-y-2 text-start">
        <div className="text-sm">{player.name}</div>
        <div className="text-xs">{player.score}</div>
      </div>

      {player.isDrawing && <Pencil className="ml-auto" />}
    </div>
  );
};

export default Player;
