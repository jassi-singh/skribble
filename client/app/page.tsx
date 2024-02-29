"use client";

import PlayersList from "@/components/player-list";
import DrawArea from "@/components/draw-area";
import MsgList from "@/components/msg-list";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useEffect, useState } from "react";
import useStore from "@/store";
import { TPlayer } from '@/types';
export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-items-stretch">
      <nav className="py-4 w-full">
        <h1 className="text-3xl font-bold text-center">Skribble</h1>
      </nav>

      <div className="relative flex-grow w-full p-4 grid grid-cols-4 gap-4 overflow-auto">
        <PlayersList />
        <DrawArea />
        <MsgList />
        <PlayerDetailsDialog />
      </div>
    </main>
  );
}

const PlayerDetailsDialog = () => {
  const [open, setOpen] = useState(true);
  const socket = useStore((state) => state.socket);
  const [player, setPlayer] = useState<TPlayer>({
    id: "",
    name: "",
    score: 0,
    isDrawing: false,
  });

  const addPlayer = useStore((state) => state.addPlayer);

  const handleSave = () => {
    setOpen(false);
    console.log(player);
    addPlayer(player);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayer((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    socket.on("connect", () => {
      setPlayer((player) => ({ ...player, id: socket.id ?? "" }));
    });
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Enter Player Name</DialogTitle>
        </DialogHeader>
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
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
