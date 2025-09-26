import { SearchIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement>;

export const SearchBar = ({
  className,
  placeholder = "Etwas suchen...",
  ...rest
}: SearchBarProps) => (
  <div className="p-4 pb-0">
    <div className="pointer-events-auto shadow-lg h-12 rounded-full bg-white w-full">
      <div className="flex items-center h-full gap-3 relative">
        <SearchIcon className="w-4 h-4 text-gray-700 absolute left-4" />
        <input
          {...rest}
          placeholder={placeholder}
          className={`w-full h-full outline-none placeholder:text-gray-400 pl-11 ${
            className ?? ""
          }`.trim()}
        />
      </div>
    </div>
  </div>
);
