import { Pencil, UsersThree } from "@phosphor-icons/react";
import Image from "next/image";

const PlayersList = () => {
  return (
    <section className="rounded-md ring ring-zinc-900 text-center p-4 space-y-4">
      <div className="sticky top-0 flex gap-2 items-center">
        Players <UsersThree weight="bold" />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-zinc-500 text-xl">#1</span>
        <Image
          height={40}
          width={40}
          src={"https://github.com/shadcn.png"}
          alt="avatar"
          className="rounded-full"
        />
        <div className="space-y-2 text-start">
          <div className="text-sm">Jaswinder</div>
          <div className="text-xs">180</div>
        </div>

        <Pencil className="ml-auto" />
      </div>
    </section>
  );
};

export default PlayersList;
