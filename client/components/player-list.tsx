import { UsersThree } from "@phosphor-icons/react";
import Player from "./player";
import useStore from "@/store";
import { useMemo } from "react";

const PlayersList = () => {
  const players = useStore((state) => state.players);
  const sortedPlayers = useStore((state) =>
    [...state.players].sort((a, b) => b.score - a.score)
  );
  const rankMap = useMemo(() => {
    const mp = new Map<string, number>();
    sortedPlayers.forEach((player, idx) => mp.set(player.id, idx + 1));
    return mp;
  }, [sortedPlayers]);
  return (
    <section className="rounded-md border text-center space-y-4 pb-4 overflow-auto">
      <div className="px-4 sticky top-0 flex gap-2 items-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur py-4">
        Players <UsersThree />
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <Player
            key={player.id}
            player={player}
            rank={rankMap.get(player.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default PlayersList;
