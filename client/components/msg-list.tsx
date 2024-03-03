import useStore from "@/store";
import { SocketEvents, TMsg } from "@skribble/shared";
import { Chat, PaperPlaneTilt } from "@phosphor-icons/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useSearchParams } from "next/navigation";

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
        Chat <Chat />
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
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [msg, setMsg] = useState("");
  const addMsg = useStore((state) => state.addMsg);
  const socket = useStore((state) => state.socket);
  const user = useStore((state) => state.user);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMsg(e.target.value);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (msg.trim() === "" || !user) return;
    const newMsg: TMsg = {
      id: null,
      sender: {
        id: user.id,
        name: user.name,
      },
      message: msg,
    };

    socket.send(newMsg, roomId);
    setMsg("");
  };

  useEffect(() => {
    socket.on(SocketEvents.message, addMsg);

    return () => {
      socket.removeListener(SocketEvents.message, addMsg);
    };
  }, []);
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
        <PaperPlaneTilt size={20} />
      </Button>
    </form>
  );
};
