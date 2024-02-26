import { Chat as ChatIcon } from "@phosphor-icons/react";

const Chat = () => {
  return (
    <section className="rounded-md ring ring-zinc-900 text-center p-4">
      <div className="sticky top-0 flex items-center gap-2">
        Chat <ChatIcon weight="bold" />
      </div>
    </section>
  );
};

export default Chat;
