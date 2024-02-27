import { PersonIcon } from "@radix-ui/react-icons";
import Player from "./player";
import useStore from "@/store";

const PlayersList = () => {
  const players = useStore((state) => state.players);
  return (
    <section className="rounded-md border text-center px-4 space-y-4 pb-4 overflow-auto">
      <div className="sticky top-0 flex gap-2 items-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur py-4">
        Players <PersonIcon />
      </div>

      {players.map((player) => (
        <Player key={player.id} player={player} />
      ))}
    </section>
  );
};

export default PlayersList;
