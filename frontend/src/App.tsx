import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import { fetchGiveboxes, searchGiveboxes, type Givebox } from "./api/giveboxes";
import { DetailsSheet } from "./components/DetailsSheet";
import { FilterChips, type Category } from "./components/FilterChips";
import { SearchBar } from "./components/SearchBar";
import { SearchSheet } from "./components/SearchSheet";

import { AnimatePresence, motion } from "motion/react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import { useNavigate, useParams } from "react-router";
import { MapController } from "./components/MapController";

const bookIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.3)] flex items-center justify-center bg-gradient-to-br from-orange-300 to-orange-500 text-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-library-icon lucide-library"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const giveboxIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div class="relative w-8 h-8 rounded-full border-2 border-white shadow-[0_0_8px_rgba(0,0,0,0.3)] flex items-center justify-center bg-gradient-to-br from-emerald-300 to-emerald-500 text-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package-open-icon lucide-package-open"><path d="M12 22v-9"/><path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z"/><path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13"/><path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function App() {
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapCenterLng, setMapCenterLng] = useState<number | null>(null);
  const [mapCenterLat, setMapCenterLat] = useState<number | null>(null);

  const navigate = useNavigate();
  const { category, id } = useParams();

  const [giveboxes, setGiveboxes] = useState<Givebox[]>([]);
  const [isLoadingGiveboxes, setIsLoadingGiveboxes] = useState(false);
  const [selectedGiveboxId, setSelectedGiveboxId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Givebox[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isActive = true;

    setIsLoadingGiveboxes(true);

    fetchGiveboxes()
      .then((data) => {
        if (!isActive) return;
        setGiveboxes(data);

        if (data.length > 0) {
          setSelectedGiveboxId(data[0].id);
        }
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoadingGiveboxes(false);
      });

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const filteredGiveboxes = useMemo(() => {
    if (!id) return giveboxes;
    return giveboxes.filter((entry) =>
      entry.categories.includes(id as Category)
    );
  }, [giveboxes, id]);

  const selectedGivebox = useMemo(() => {
    if (!selectedGiveboxId) return null;
    return giveboxes.find((entry) => entry.id === selectedGiveboxId) ?? null;
  }, [giveboxes, selectedGiveboxId]);

  useEffect(() => {
    const layerGroup = markersLayerRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    filteredGiveboxes.forEach((entry) => {
      const marker = L.marker(entry.coordinates);
      marker.on("click", () => {
        setSelectedGiveboxId(entry.id);
        navigate("/place/" + entry.id);
      });
      marker.addTo(layerGroup);
    });
  }, [filteredGiveboxes, navigate]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isActive = true;
    setIsSearching(true);

    searchGiveboxes(searchQuery, id as Category)
      .then((results) => {
        if (!isActive) return;
        setSearchResults(results);
      })
      .finally(() => {
        if (!isActive) return;
        setIsSearching(false);
      });

    return () => {
      isActive = false;
    };
  }, [id, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      navigate("/search");
    }
  }, [navigate, searchQuery]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchResultSelect = (id: string) => {
    setSelectedGiveboxId(id);
    const selected = giveboxes.find((entry) => entry.id === id);
    if (selected) {
      setSearchQuery(selected.name);
    }
    navigate("/place/" + id);
    setSearchResults([]);
  };

  return (
    <div className="relative h-[100lvh] w-screen overflow-hidden select-none">
      <MapContainer
        center={[51.960655, 7.626135]}
        zoom={12}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <MapController lat={mapCenterLat} lng={mapCenterLng} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {giveboxes.map((givebox) => (
          <Marker
            key={givebox.id}
            icon={givebox.categories.includes("books") ? bookIcon : giveboxIcon}
            position={givebox.coordinates}
            eventHandlers={{
              click: () => {
                setMapCenterLat(givebox.coordinates[0]);
                setMapCenterLng(givebox.coordinates[1]);
                navigate("/place/" + givebox.id);
              },
            }}
          >
            <Tooltip
              permanent
              interactive
              direction="right"
              offset={[10, 0]}
              eventHandlers={{
                click: () => {
                  setSelectedGiveboxId(givebox.id);
                  navigate("/place/" + givebox.id);
                },
              }}
            >
              {givebox.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <AnimatePresence>
        {category === "search" && (
          <motion.div
            className="bg-black/20 absolute inset-0 z-1"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          ></motion.div>
        )}
      </AnimatePresence>
      <motion.div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-3">
        <SearchBar
          placeholder="Etwas suchen..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => navigate("/search")}
        />
        <FilterChips
          activeCategory={id as Category}
          onCategoryClick={(category) => {
            if (category) {
              navigate("/category/" + category);
            } else {
              navigate("/");
            }
          }}
        />
      </motion.div>
      <div className="pointer-events-none z-10 absolute w-full top-0 h-[100dvh]">
        <DetailsSheet
          isOpen={Boolean(category === "place" && id)}
          onClose={() => navigate("/")}
          givebox={selectedGivebox}
          isLoading={isLoadingGiveboxes}
        />
        <SearchSheet
          isOpen={Boolean(category === "search" || category === "category")}
          onClose={() => navigate("/")}
          results={searchResults}
          isLoading={isSearching}
          onSelect={handleSearchResultSelect}
        />
      </div>
    </div>
  );
}

export default App;
