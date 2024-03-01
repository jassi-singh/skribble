import useStore from "@/store";
import moment from "moment";
import { Button } from "./ui/button";
import { ClockIcon } from "@radix-ui/react-icons";

const Timer = () => {
  const timeLeft = useStore((state) => state.timer);
  return (
    <Button
      variant={timeLeft > 5 ? "outline" : "destructive"}
      className="absolute top-0 right-4 flex gap-2 items-center"
    >
      <ClockIcon width={20} height={20} />
      {moment.utc(timeLeft * 1000).format("mm:ss")}
    </Button>
  );
};

export default Timer;