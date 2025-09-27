import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
};

export function QROverlay({ isOpen, onClose, url }: Props) {
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && url) {
      setIsLoading(true);
      setError("");
      
      // Generate QR code URL using QuickChart API
      const encodedUrl = encodeURIComponent(url);
      const qrUrl = `https://quickchart.io/qr?text=${encodedUrl}&size=300&margin=2&dark=000000&light=ffffff`;
      
      // Preload the image to check if it loads successfully
      const img = new Image();
      img.onload = () => {
        setQrImageUrl(qrUrl);
        setIsLoading(false);
      };
      img.onerror = () => {
        setError("QR Code generation failed");
        setIsLoading(false);
      };
      img.src = qrUrl;
    }
  }, [isOpen, url]);

  // Reset state when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setQrImageUrl("");
      setError("");
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-1 rounded-4xl z-50 bg-white/80 filter backdrop-blur-lg backdrop-saturate-180 flex items-center justify-center">
      {/* Close button */}
      <button
        className="pointer-events-auto absolute top-6 right-6 bg-gray-100 text-gray-700 w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-200 active:opacity-50 transition-all"
        onClick={onClose}
      >
        <XIcon size={24} />
      </button>

      {/* QR Code */}
      <div className="flex flex-col items-center">
        {isLoading && (
          <div className="w-[300px] h-[300px] border border-gray-200 rounded-lg shadow-lg flex items-center justify-center bg-gray-50">
            <div className="text-gray-500">Generating QR Code...</div>
          </div>
        )}
        
        {error && (
          <div className="w-[300px] h-[300px] border border-red-200 rounded-lg shadow-lg flex items-center justify-center bg-red-50">
            <div className="text-red-500 text-center">{error}</div>
          </div>
        )}
        
        {qrImageUrl && !isLoading && !error && (
          <img 
            src={qrImageUrl}
            alt="QR Code"
            className="border border-gray-200 rounded-lg shadow-lg"
            width={300}
            height={300}
          />
        )}
        
        <p className="text-gray-600 text-center mt-4 max-w-md px-8 text-balance">
          Dieser QR-Code führt zur Seite der Givebox. Dort kannst du Fotos hochladen und der Inhalt wird als Text und Kategorien ins Wiki übernommen und ist sofort für alle durchsuchbar.
        </p>
      </div>
    </div>
  );
}
