"use client";

import PlayersList from "@/components/player-list";
import DrawArea from "@/components/draw-area";
import MsgList from "@/components/msg-list";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChangeEvent, Suspense, useEffect, useState } from "react";
import useStore from "@/store";
import { SocketEvents, TPlayer } from "@skribble/shared";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Home() {
  const socket = useStore((state) => state.socket);
  const addPlayers = useStore((state) => state.addPlayers);

  useEffect(() => {
    socket.on(SocketEvents.updatePlayers, addPlayers);
    return () => {
      socket.removeListener(SocketEvents.updatePlayers, addPlayers);
    };
  }, []);
  return (
    <main className="flex h-screen flex-col items-center justify-items-stretch">
      <nav className="py-4 w-full">
        <h1 className="text-3xl font-bold text-center">Skribble</h1>
      </nav>

      <div className="relative flex-grow w-full p-4 grid grid-cols-4 gap-4 overflow-auto">
        <PlayersList />
        <DrawArea />
        <MsgList />
        <Suspense fallback={<p>Loading..</p>}>
          <StartupDialog />
        </Suspense>
      </div>
    </main>
  );
}

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
    isDrawing: false,
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
    setUser(player)
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
