import { UsersThree } from "@phosphor-icons/react";
import Player from "./Player";
import useStore from "@/store";

const PlayersList = () => {
  const players = useStore((state) => state.players);
  return (
    <section className="rounded-md ring ring-zinc-900 text-center px-4 space-y-4 pb-4 overflow-auto">
      <div className="sticky top-0 flex gap-2 items-center bg-zinc-950/50 backdrop-blur py-4">
        Players <UsersThree weight="bold" />
      </div>

      {players.map((player) => (
        <Player key={player.id} player={player} />
      ))}
    </section>
  );
};

export default PlayersList;
