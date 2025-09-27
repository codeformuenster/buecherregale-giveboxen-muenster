import React, { useState, type InputHTMLAttributes } from "react";
import { MoreVerticalIcon, SearchIcon, SquareArrowOutUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Popover, Dialog } from "react-aria-components";
import { FilterChips } from "./FilterChips";
import type { Category } from "./FilterChips";

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

export const SearchBar = ({ value, onChange, onFocus, className, ...rest }: SearchBarProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const handleCategoryClick = (category: Category | null) => {
    setActiveCategory(category);
    onChange({
      target: { value: category ? categoryLabels[category] : "" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="flex flex-col gap-2 p-4 pb-0">
    {/* Search Input */}
    <div className="flex gap-2">
      <div className="flex-1 pointer-events-auto shadow-xl h-13 rounded-full bg-white/80 filter backdrop-blur-sm backdrop-saturate-180 w-full">
        <div className="flex items-center h-full gap-3 relative">
          <SearchIcon className="w-6 h-6 text-black/60 absolute left-4" />
          <input
            type="text"
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            //placeholder={placeholder}
            className="w-full h-full outline-none placeholder:text-gray-700 pl-13"
          />
        </div>
      </div>

      <Popover className="pointer-events-auto">
        <Dialog className="bg-white/80 filter shadow-2xl backdrop-blur-sm backdrop-saturate-180 rounded-3xl w-50">
          <div className="flex-col p-2">
            <div className="flex items-center gap-2 px-4 py-3">
              <SquareArrowOutUpRight className="w-4 h-4" />
              Box hinzufügen
            </div>
            <div className="flex items-center gap-2 px-4 py-3">
              <svg className="w-4 h-4 rounded-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="#fc0" d="M0 341.3h512V512H0z" />
                <path fill="#000001" d="M0 0h512v170.7H0z" />
                <path fill="red" d="M0 170.7h512v170.6H0z" />
              </svg>
              Sprache: Deutsch
            </div>
          </div>
        </Dialog>
      </Popover>
    </div>

      <FilterChips activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />
    </div>
  );
};
