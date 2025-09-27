import { XIcon } from "lucide-react";

import type { ItemDetail } from "../api/get";
import { Sheet } from "./Sheet";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  results: ItemDetail[];
  isLoading: boolean;
  onSelect: (id: string) => void;
};

export function SearchSheet({
  isOpen,
  onClose,
  results,
  isLoading,
  onSelect,
}: Props) {
  return (
    <Sheet show={isOpen}>
      <div className="flex gap-2 sticky top-0 bg-white/90 filter backdrop-blur-sm z-10 py-4 px-6">
        <div className="flex-1 flex flex-col">
          <h1 className=" text-xl font-semibold pt-0.75">Suchergebnisse</h1>
        </div>
        <button
          className="pointer-events-auto bg-gray-100 text-gray-400 w-9 h-9 flex items-center justify-center rounded-full -mr-2"
          onClick={onClose}
        >
          <XIcon />
        </button>
      </div>

      <div className="px-6 flex flex-col gap-3">
        {isLoading ? (
          <div className="text-gray-500 text-center py-8">Suche läuft...</div>
        ) : results.length ? (
          <div className="flex flex-col gap-4 py-2">
            {results.map((result) => {
              return (
                <button
                  onClick={() => onSelect(result.id)}
                  key={result.id}
                  type="button"
                  className="text-left flex flex-col gap-1 py-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center">
                    <h2 className="font-semibold">
                      {result.name}
                    </h2>
                    <p className="text-gray-700 line-clamp-1">{result.address}</p>
                  </div>
                  <div className="text-gray-500 text-sm line-clamp-3">
                    {result.items?.map((item) => item.description).join(", ")}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            Keine Ergebnisse gefunden.
          </div>
        )}
      </div>
    </Sheet>
  );
}
