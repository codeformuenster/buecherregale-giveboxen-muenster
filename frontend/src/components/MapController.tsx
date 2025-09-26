import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapController({
  position,
}: {
  position: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.fitBounds(L.latLngBounds([position]), {
        paddingTopLeft: [0, 100], // left=0px, top=100px
        paddingBottomRight: [0, 500], // right=0px, bottom=500px
        animate: true,
      });
    }
  }, [map, position]);

  return null;
}
