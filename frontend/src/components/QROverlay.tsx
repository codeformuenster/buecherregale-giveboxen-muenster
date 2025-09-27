import { XIcon } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
};

export function QROverlay({ isOpen, onClose, url }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && !qrGenerated) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation failed:', error);
        } else {
          setQrGenerated(true);
        }
      });
    }
  }, [isOpen, url, qrGenerated]);

  // Reset QR generation state when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setQrGenerated(false);
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
        <canvas 
          ref={canvasRef}
          className="border border-gray-200 rounded-lg shadow-lg"
        />
        <p className="text-gray-600 text-center mt-4 max-w-md px-8 text-balance">
          Dieser QR-Code führt zur Seite der Givebox. Dort kannst du Fotos hochladen und der Inhalt wird als Text und Kategorien ins Wiki übernommen und ist sofort für alle durchsuchbar.
        </p>
      </div>
    </div>
  );
}
