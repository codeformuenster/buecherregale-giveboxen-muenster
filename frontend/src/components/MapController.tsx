import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapController({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.fitBounds(L.latLngBounds([[lat, lng]]), {
        paddingTopLeft: [0, 100], // left=0px, top=100px
        paddingBottomRight: [0, 500], // right=0px, bottom=500px
        animate: true,
        duration: 1,
      });
    }
  }, [map, lat, lng]);

  return null;
}
