"use client";

import PlayersList from "@/components/PlayerList";
import DrawArea from "@/components/DrawArea";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-items-stretch">
      <nav className="py-4 w-full">
        <h1 className="text-3xl font-bold text-center">Skribble</h1>
      </nav>

      <div className="relative flex-grow w-full p-4 grid grid-cols-4 gap-4 overflow-auto">
        <PlayersList />
        <DrawArea />
        <Chat />
      </div>
    </main>
  );
}
