import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog";
import useStore from "@/store";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Dispatch, SetStateAction } from "react";
import Player from "../player";

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
          <Player
            key={player.id}
            player={player}
            rank={id + 1}
            type={"leaderboard"}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default ShowResultsDialog;
