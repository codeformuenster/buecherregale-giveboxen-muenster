import {
  MoreVerticalIcon,
  SearchIcon,
  SquareArrowOutUpRight,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type InputHTMLAttributes } from "react";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement>;

export const SearchBar = ({ className, ...rest }: SearchBarProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
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

      <div className="w-13 h-13 relative">
        <AnimatePresence>
          {popoverOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-0 left-0 h-[100lvh] w-[100lvw] z-40 pointer-events-auto bg-black/10"
              onClick={() => setPopoverOpen(false)}
            ></motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="absolute z-50 top-0 right-0 bg-white/80 filter backdrop-blur-sm backdrop-saturate-180 rounded-4xl shadow-xl"
          animate={{
            width: popoverOpen ? "14rem" : "3.25rem",
            height: popoverOpen ? "7rem" : "3.25rem",
            transition: { type: "spring", stiffness: 700, damping: 60 },
          }}
        >
          {popoverOpen ? (
            <div className="flex-col p-2 w-60">
              <div className="flex items-center gap-2 px-4 py-3">
                <SquareArrowOutUpRight className="w-4 h-4" />
                Box hinzufügen
              </div>
              <div className="flex items-center gap-2 px-4 py-3">
                <svg
                  className="w-4 h-4 rounded-sm"
                  xmlns="http://www.w3.org/2000/svg"
                  id="flag-icons-de"
                  viewBox="0 0 512 512"
                >
                  <path fill="#fc0" d="M0 341.3h512V512H0z" />
                  <path fill="#000001" d="M0 0h512v170.7H0z" />
                  <path fill="red" d="M0 170.7h512v170.6H0z" />
                </svg>
                Sprache: Deutsch
              </div>
            </div>
          ) : (
            <motion.button
              className="pointer-events-auto w-13 h-13 flex items-center justify-center"
              onClick={() => setPopoverOpen(!popoverOpen)}
            >
              <MoreVerticalIcon className="w-6 h-6 text-black/70" />
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* <DialogTrigger>
              <Button className="pointer-events-auto bg-white/80 filter backdrop-blur-sm backdrop-saturate-180 rounded-full w-13 h-13 flex items-center justify-center shadow-xl">
                <MoreVerticalIcon className="w-6 h-6 text-black/70" />
              </Button>
        
              <Popover className="pointer-events-auto">
                <Dialog className="bg-white/80 filter shadow-2xl backdrop-blur-sm backdrop-saturate-180 rounded-3xl w-50 shadow-3xl">
                  <div className="flex-col p-2">
                    <div className="flex items-center gap-2 px-4 py-3">
                      <SquareArrowOutUpRight className="w-4 h-4" />
                      Box hinzufügen
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3">
                      <svg
                        className="w-4 h-4 rounded-sm"
                        xmlns="http://www.w3.org/2000/svg"
                        id="flag-icons-de"
                        viewBox="0 0 512 512"
                      >
                        <path fill="#fc0" d="M0 341.3h512V512H0z" />
                        <path fill="#000001" d="M0 0h512v170.7H0z" />
                        <path fill="red" d="M0 170.7h512v170.6H0z" />
                      </svg>
                      Sprache: Deutsch
                    </div>
                  </div>
                </Dialog>
              </Popover>
            </DialogTrigger> */}
    </div>
  );
};
