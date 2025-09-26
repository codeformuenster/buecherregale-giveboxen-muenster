import { XIcon } from "lucide-react";

import type { Givebox } from "../api/giveboxes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  results: Givebox[];
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
    <div className="inset-0 absolute flex flex-col">
      <div className="flex-1"></div>
      <div
        className="pointer-events-auto h-[65vh] w-full bg-white shadow-2xl rounded-4xl pb-4 overflow-y-auto transition-transform duration-300 ease-in-out"
        style={{
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
        }}
      >
        <div className="flex gap-2 sticky top-0 bg-white/90 filter backdrop-blur-sm z-10 py-4 px-6">
          <div className="flex-1 flex flex-col">
            <h1 className=" text-xl font-semibold pt-0.5">Suchergebnisse</h1>
          </div>
          <button
            className="bg-gray-100 text-gray-400 w-9 h-9 flex items-center justify-center rounded-full -mr-2"
            onClick={onClose}
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 flex flex-col gap-3">
          {isLoading ? (
            <div className="text-gray-500 text-center py-8">
              Suche läuft...
            </div>
          ) : results.length ? (
            <div className="flex flex-col gap-4">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onSelect(result.id)}
                  className="text-left flex flex-col gap-1 rounded-2xl border border-gray-100 px-4 py-3 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-1">
                    <h2 className="text-gray-700 font-semibold">
                      {result.name}
                    </h2>
                    <p className="text-gray-400">
                      &middot; {result.address}
                    </p>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {result.description}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Keine Ergebnisse gefunden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
