import { MoreVerticalIcon, SearchIcon, SquareArrowOutUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import type { Category } from "./FilterChips";
import { FilterChips } from "./FilterChips";

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
}

const categoryLabels: Record<Category, string> = {
  books: "Bücher",
  clothes: "Klamotten",
  toys: "Spielzeug",
  electronics: "Elektronik",
  kitchen_items: "Küchenartikel",
  household_goods: "Haushaltswaren",
  shoes: "Schuhe",
  bags: "Taschen",
  games: "Spiele",
  decorations: "Dekoration",
  tools: "Werkzeuge",
  office_supplies: "Bürobedarf",
  plants: "Pflanzen",
  food: "Lebensmittel",
  other: "Sonstiges",
};

export const SearchBar = ({ value, onChange, onFocus }: SearchBarProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Prevent body scrolling when popup is open using touchmove prevention
  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    if (popoverOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
    } else {
      document.body.style.overflow = 'unset';
      document.removeEventListener('touchmove', preventTouchMove);
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, [popoverOpen]);

  const handleCategoryClick = (category: Category | null) => {
    setActiveCategory(category);
    onChange({
      target: { value: category ? categoryLabels[category] : "" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className=" flex flex-col gap-2">
      <div className="p-4 pb-0 flex gap-2">
        <motion.div whileTap={{ scale: 0.98 }} className="flex-1 pointer-events-auto shadow-xl h-13 rounded-full bg-white/80 filter backdrop-blur-sm backdrop-saturate-180 w-full">
          <div className="flex items-center h-full gap-3 relative">
            <SearchIcon className="w-6 h-6 text-black/60 absolute left-4" />
            <input
              type="text"
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              placeholder="Was suchst du?"
              className="w-full h-full outline-none placeholder:text-gray-700 pl-13"
            />
          </div>
        </motion.div>
        <motion.div className="w-13 h-13 relative">
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
              <div className="flex-col p-2 w-60 pointer-events-auto">
                <a href="https://www.muenster4you.de/wiki/Sharing/GiveBoxen" target="_blank" className="flex items-center gap-2 px-4 py-3">
                  <SquareArrowOutUpRight className="w-4 h-4" />
                  Box hinzufügen
                </a>
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
                whileTap={{ scale: 0.98 }}
              >
                <MoreVerticalIcon className="w-6 h-6 text-black/70" />
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </div>

      <FilterChips activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />
    </div>
  );
};
