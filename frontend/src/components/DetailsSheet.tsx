import { CameraIcon, Check, LinkIcon, Loader, QrCode, XIcon } from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { getItem, uploadImage, type ItemDetail } from "../api/get";
import { Sheet } from "./Sheet";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function DetailsSheet({ isOpen, onClose }: Props) {
  const { category, "*": id } = useParams();

  const itemId = category === "place" ? id : null;

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [dataState, setDataState] = useState<"loading" | "error" | "success">(
    "loading"
  );

  const [contentExpanded, setContentExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !isUploading && !uploadSuccess) {
      setIsUploading(true);
      uploadImage(file, itemId ?? "")
        .then((data) => {
          console.log(data);
          // Reset the input value to allow uploading the same file again
          event.target.value = '';
          // Show success animation
          setUploadSuccess(true);
          // Reset success state after 2 seconds
          setTimeout(() => {
            setUploadSuccess(false);
          }, 2000);
        })
        .catch((error) => {
          console.error('Upload failed:', error);
          // Reset the input value on error as well
          event.target.value = '';
        })
        .finally(() => {
          setIsUploading(false);
        });
    }
  };

  const fetchItemData = useCallback(() => {
    if (itemId) {
      setDataState("loading");
      setItem(null);
      setContentExpanded(false);
      getItem(itemId)
        .then((data) => {
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

  useEffect(() => {
    fetchItemData();
  }, [fetchItemData, itemId]);

  useEffect(() => {
    if (isOpen && itemId) {
      // Set up interval to reload data every 5 seconds
      const interval = setInterval(() => {
        getItem(itemId)
          .then((data) => {
            setItem(data);
            setContentExpanded(Boolean(!data.items || data.items.length < 3));
            setDataState("success");
          })
          .catch(() => {
            setDataState("error");
            setItem(null);
            setContentExpanded(false);
          });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isOpen, itemId]);

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
          {item?.items?.length && <div>
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
          </div>}
          {item?.openingHours && <div>
            <h2 className="text-gray-700 mt-4 font-semibold">Öffnungszeiten</h2>
            <div className="text-gray-700">{item?.openingHours}</div>
          </div>}
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
          className="bg-gray-100 text-gray-400 w-9 h-9 flex items-center justify-center rounded-full -mr-2 active:opacity-50 transition-opacity"
          onClick={onClose}
        >
          <XIcon />
        </button>
      </div>
      <div className="px-4 flex flex-col gap-2 pt-4">
        <label className={`w-full rounded-full py-3 px-4 flex items-center gap-2 justify-center font-medium transition-all duration-300 ${
          uploadSuccess 
            ? 'bg-green-500 text-white cursor-default' 
            : isUploading 
            ? 'bg-black text-white opacity-50 cursor-not-allowed' 
            : 'bg-black text-white cursor-pointer active:opacity-50'
        }`}>
          <input
            type="file"
            capture="environment"
            multiple={false}
            accept="image/jpeg,image/png"
            className="sr-only"
            onChange={handleImageUpload}
            disabled={isUploading || uploadSuccess}
          />
          {uploadSuccess ? (
            <Check className="text-white" />
          ) : isUploading ? (
            <Loader className="text-gray-100 animate-spin" />
          ) : (
            <CameraIcon className="text-gray-100" />
          )}
          {uploadSuccess ? 'Danke fürs Mithelfen!' : isUploading ? 'Wird hochgeladen...' : 'Aktuelles Foto hochladen'}
        </label>

        <div className="flex gap-2">
          <a
            href={`https://www.muenster4you.de/wiki/${itemId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-black/10 text-gray-800 rounded-full py-3 px-4 flex items-center gap-2 justify-center font-medium active:opacity-50 transition-opacity"
          >
            <LinkIcon className="text-gray-700" />
            Wiki-Eintrag
          </a>
          <button className="w-full bg-black/10 text-gray-800 rounded-full py-3 px-4 flex items-center gap-2 justify-center font-medium active:opacity-50 transition-opacity">
            <QrCode className="text-gray-700" />
            Code zeigen
          </button>
        </div>

        {child}
      </div>
    </Sheet>
  );
}
