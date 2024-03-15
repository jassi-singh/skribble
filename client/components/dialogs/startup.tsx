import { SocketEvents, TPlayer } from "@skribble/shared";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import useStore from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

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

export default StartupDialog;
