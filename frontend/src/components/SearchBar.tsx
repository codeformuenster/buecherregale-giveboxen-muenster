import {
  MoreVerticalIcon,
  SearchIcon,
  SquareArrowOutUpRight,
} from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement>;

export const SearchBar = ({ className, ...rest }: SearchBarProps) => (
  <div className="p-4 pb-0 flex gap-2">
    <div className="flex-1 pointer-events-auto shadow-xl h-13 rounded-full bg-white/80 filter backdrop-blur-sm backdrop-saturate-180 w-full">
      <div className="flex items-center h-full gap-3 relative">
        <SearchIcon className="w-6 h-6 text-black/60 absolute left-4" />
        <input
          {...rest}
          placeholder="Was suchst du?"
          className={`w-full h-full outline-none placeholder:text-gray-700 pl-13 ${
            className ?? ""
          }`.trim()}
        />
      </div>
    </div>

    <DialogTrigger>
      <Button className="pointer-events-auto bg-white/80 filter backdrop-blur-sm backdrop-saturate-180 rounded-full w-13 h-13 flex items-center justify-center shadow-xl">
        <MoreVerticalIcon className="w-6 h-6 text-black/70" />
      </Button>

      <Popover className="pointer-events-auto">
        <Dialog className="bg-white/80 filter shadow-2xl backdrop-blur-sm backdrop-saturate-180 rounded-3xl w-50 shadow-3xl">
          <div className="flex-col">
            <div className="flex items-center gap-2 p-4">
              <SquareArrowOutUpRight className="w-4 h-4" />
              Box hinzufügen
            </div>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  </div>
);
