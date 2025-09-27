import { CameraIcon, LinkIcon, Loader, QrCode, XIcon } from "lucide-react";

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getItem, uploadImage, type ItemDetail } from "../api/get";
import type { Givebox } from "../api/giveboxes";
import { Sheet } from "./Sheet";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  givebox: Givebox | null;
  isLoading: boolean;
};

export function DetailsSheet({ isOpen, onClose }: Props) {
  const { category, "*": id } = useParams();

  const itemId = category === "place" ? id : null;

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [dataState, setDataState] = useState<"loading" | "error" | "success">(
    "loading"
  );

  const [contentExpanded, setContentExpanded] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file, itemId ?? "").then((data) => {
        console.log(data);
      });
    }
  };

  useEffect(() => {
    if (itemId) {
      setDataState("loading");
      setItem(null);
      setContentExpanded(false);
      getItem(itemId)
        .then((data) => {
          console.log(data);
          setItem(data);
          setContentExpanded(Boolean(!data.items || data.items.length < 3));
          setDataState("success");
        })
        .catch(() => {
          setDataState("error");
          setItem(null);
          setContentExpanded(false);
        });
    }
  }, [itemId]);

  let child = null;

  switch (dataState) {
    case "loading":
      child = (
        <div className="text-gray-500 text-center py-8">
          <Loader className="animate-spin" />
        </div>
      );
      break;
    case "error":
      child = <div className="text-gray-500 text-center py-8">Fehler</div>;
      break;
    case "success":
      child = (
        <>
          <div>
            <h2 className="text-gray-700 mt-4 font-semibold">Inhalt</h2>
            <ul
              className={`text-gray-700 ${
                contentExpanded
                  ? "max-h-auto"
                  : "max-h-[65px] overflow-hidden mask-b-from-20%"
              }`}
            >
              {item?.items?.map((item, index) => (
                <li key={index} className="">
                  - {item.description}
                </li>
              ))}
            </ul>
            {!contentExpanded && (
              <button
                className="text-gray-500 text-sm"
                onClick={() => setContentExpanded(!contentExpanded)}
              >
                Mehr anzeigen
              </button>
            )}
          </div>
          {item?.images?.length ? (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {item.previewImage && (
                <img
                  key={`${item.name}-image-0`}
                  className="w-full h-full object-cover rounded-xl"
                  src={item.previewImage}
                  alt={`${item.name} Vorschaubild`}
                />
              )}
              {item.images.map((imageUrl, index) => (
                <img
                  key={`${item.name}-image-${index}`}
                  className="w-full h-full object-cover rounded-xl"
                  src={imageUrl}
                  alt={`${item.name} Bild ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </>
      );
      break;
  }

  return (
    <Sheet show={isOpen}>
      <div className="flex gap-2 sticky top-0 bg-white/90 filter backdrop-blur-lg z-10 py-4 px-6">
        <div className="flex-1 flex flex-col">
          <h1 className="text-xl font-semibold pt-0.75">
            {item?.name ?? "Givebox auswählen"}
          </h1>
          <div className="text-gray-500">
            {item?.address ?? "Bitte eine Givebox auswählen."}
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
            onChange={handleImageUpload}
          />
          <CameraIcon className="text-gray-100" />
          Aktuelles Foto hochladen
        </label>

        <div className="flex gap-2">
          <a
            href={item?.address}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-black/10 text-gray-800 rounded-full py-3 px-4 flex items-center gap-2 justify-center font-medium"
          >
            <LinkIcon className="text-gray-700" />
            Wiki-Eintrag
          </a>
          <button className="w-full bg-black/10 text-gray-800 rounded-full py-3 px-4 flex items-center gap-2 justify-center font-medium">
            <QrCode className="text-gray-700" />
            Code zeigen
          </button>
        </div>

        {child}
      </div>
    </Sheet>
  );
}
