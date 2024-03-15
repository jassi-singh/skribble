import { SocketEvents } from "@skribble/shared";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import useStore from "@/store";
import { useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

const SelectWordDialog = ({
  open,
  setOpen,
  words,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  words: string[];
}) => {
  const socket = useStore((store) => store.socket);
  const currentPlayerId = useStore((store) => store.currentPlayerId);
  const setCurrentWord = useStore((store) => store.setCurrentWord);
  const startTimer = useStore((store) => store.startTimer);
  const resetAnsweredBy = useStore((state) => state.resetAnsweredBy);
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const handleSelectWord = (word: string) => () => {
    setOpen(false);
    setCurrentWord(word);
    startTimer();
    resetAnsweredBy();
    socket.emit(SocketEvents.selectWord, word, roomId, currentPlayerId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle>Select a word</DialogTitle>
        {words.map((word) => (
          <Button key={word} onClick={handleSelectWord(word)} variant="outline">
            {word}
          </Button>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default SelectWordDialog;
