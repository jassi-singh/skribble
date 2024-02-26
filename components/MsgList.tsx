import useStore from "@/store";
import { TMsg } from "@/types";
import { faker } from "@faker-js/faker";
import { Chat, PaperPlaneTilt } from "@phosphor-icons/react";
import { FormEvent, useEffect, useRef, useState } from "react";

const MsgList = () => {
  const msgList = useStore((state) => state.msgList);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [msgList]);

  return (
    <section className="rounded-md ring ring-zinc-900 text-center px-4 space-y-4 overflow-auto flex flex-col">
      <div className="sticky top-0 flex gap-2 items-center bg-zinc-950/50 backdrop-blur py-4">
        Chat <Chat weight="bold" />
      </div>

      <div className="flex flex-col flex-1 justify-end">
        {msgList.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      <Form />
    </section>
  );
};

export default MsgList;

const Message = ({ msg }: { msg: TMsg }) => {
  return (
    <div className="flex gap-4">
      <div className="italic">{msg.sender.name}:</div>
      <div>{msg.message}</div>
    </div>
  );
};

const Form = () => {
  const [msg, setMsg] = useState("");
  const addMsg = useStore((state) => state.addMsg);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMsg(e.target.value);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const newMsg: TMsg = {
      id: faker.string.uuid(),
      sender: {
        id: faker.string.uuid(),
        name: faker.person.firstName(),
      },
      message: msg,
    };

    addMsg(newMsg);
    setMsg("");
  };
  return (
    <form className="flex gap-4 text-zinc-950 sticky bottom-0 bg-zinc-950 py-4">
      <input
        name="msg"
        value={msg}
        className="w-full rounded-md outline-none px-2 text-sm"
        placeholder="Type here"
        onChange={handleChange}
      />
      <button
        onClick={handleSendMessage}
        className="bg-white rounded-md p-2 text-xl"
      >
        <PaperPlaneTilt weight="fill" />
      </button>
    </form>
  );
};
