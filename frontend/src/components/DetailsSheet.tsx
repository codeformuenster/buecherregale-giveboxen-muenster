import { CameraIcon, LinkIcon, XIcon } from "lucide-react";

import type { Givebox } from "../api/giveboxes";
import { Sheet } from "./Sheet";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  givebox: Givebox | null;
  isLoading: boolean;
};

export function DetailsSheet({ isOpen, onClose, givebox, isLoading }: Props) {
  const hasGivebox = Boolean(givebox);

  return (
    <Sheet show={isOpen}>
      <div className="flex gap-2 sticky top-0 bg-white/90 filter backdrop-blur-lg z-10 py-4 px-6">
        <div className="flex-1 flex flex-col">
          <h1 className="text-xl font-semibold pt-0.75">
            {givebox?.name ?? "Givebox auswählen"}
          </h1>
          <div className="text-gray-500">
            {givebox?.address ?? "Bitte eine Givebox auswählen."}
          </div>
        </div>
        <button
          className="bg-gray-100 text-gray-400 w-9 h-9 flex items-center justify-center rounded-full -mr-2"
          onClick={onClose}
        >
          <XIcon />
        </button>
      </div>
      <div className="px-4 flex flex-col gap-2 pt-4">
        <label className="w-full bg-black text-white rounded-full py-3 px-4 flex items-center gap-2 justify-center font-medium cursor-pointer">
          <input
            type="file"
            capture="environment"
            multiple={false}
            accept="image/jpeg,image/png"
            className="sr-only"
          />
          <CameraIcon className="text-gray-100" />
          Aktuelles Foto hochladen
        </label>

        <a
          href={givebox?.address}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-black/10 text-gray-800 rounded-full py-3 px-4 flex items-center gap-2 justify-center font-medium"
        >
          <LinkIcon className="text-gray-700" />
          Wiki-Eintrag anzeigen
        </a>

        {isLoading ? (
          <div className="text-gray-500 text-center py-8">
            Giveboxes werden geladen...
          </div>
        ) : hasGivebox ? (
          <>
            <div>
              <h2 className="text-gray-700 mt-4 font-semibold">Inhalt</h2>
              <div className="text-gray-700">{givebox?.description}</div>
            </div>
            {givebox?.images?.length ? (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {givebox.images.map((imageUrl, index) => (
                  <img
                    key={`${givebox.id}-image-${index}`}
                    className="w-full h-full object-cover rounded-xl"
                    src={imageUrl}
                    alt={`${givebox.name} Bild ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="text-gray-500 text-center py-8">
            Keine Givebox ausgewählt.
          </div>
        )}
      </div>
    </Sheet>
  );
}
