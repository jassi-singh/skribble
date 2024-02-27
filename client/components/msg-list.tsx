import useStore from "@/store";
import { TMsg } from "@/types";
import { faker } from "@faker-js/faker";
import { ChatBubbleIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
    <section className="rounded-md border text-center px-4 space-y-4 overflow-auto flex flex-col">
      <div className="sticky top-0 flex gap-2 items-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur py-4">
        Chat <ChatBubbleIcon />
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
    if (msg.trim() === "") return;
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
    <form className="flex gap-4 sticky bottom-0 bg-white dark:bg-zinc-950 py-4">
      <Input
        name="msg"
        value={msg}
        placeholder="Type here"
        autoComplete="off"
        onChange={handleChange}
      />
      <Button onClick={handleSendMessage}>
        <PaperPlaneIcon />
      </Button>
    </form>
  );
};
