import { UsersThree } from "@phosphor-icons/react";
import Player from "./Player";
import { faker } from "@faker-js/faker";
import { PlayerType } from "@/types";

const createRandomData = (): PlayerType => ({
  id: faker.string.uuid(),
  name: faker.person.firstName(),
  profilePic: faker.image.avatar(),
  isDrawing: false,
  rank: faker.number.int({ max: 20 }),
  score: faker.number.int({ max: 999 }),
});

const players = faker.helpers.multiple(createRandomData, { count: 20 });

const PlayersList = () => {
  return (
    <section className="rounded-md ring ring-zinc-900 text-center px-4 space-y-4 pb-4 overflow-auto">
      <div className="sticky top-0 flex gap-2 items-center bg-zinc-950/50 backdrop-blur py-4">
        Players <UsersThree weight="bold" />
      </div>

      {players.map((player) => (
        <Player player={player} />
      ))}
    </section>
  );
};

export default PlayersList;
