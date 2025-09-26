import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { fetchGiveboxes, searchGiveboxes, type Givebox } from "./api/giveboxes";
import { DetailsSheet } from "./components/DetailsSheet";
import { FilterChips, type Category } from "./components/FilterChips";
import { SearchBar } from "./components/SearchBar";
import { SearchSheet } from "./components/SearchSheet";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useNavigate, useParams } from "react-router";
import { MapController } from "./components/MapController";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = defaultIcon;

function App() {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

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
    const map = mapRef.current;
    if (!map) return;

    if (selectedGivebox) {
      map.setView(selectedGivebox.coordinates, 14, { animate: true });
      return;
    }

    if (!filteredGiveboxes.length) return;

    const bounds = L.latLngBounds(
      filteredGiveboxes.map((entry) => entry.coordinates)
    );
    map.fitBounds(bounds.pad(0.2));
  }, [filteredGiveboxes, selectedGivebox]);

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
    <div className="relative h-[100lvh] w-screen">
      <MapContainer
        center={[51.9607, 7.6261]}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <MapController position={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {giveboxes.map((givebox) => (
          <Marker
            key={givebox.id}
            position={givebox.coordinates}
            eventHandlers={{
              click: () => {
                setMapCenter(givebox.coordinates);
                navigate("/place/" + givebox.id);
              },
            }}
          ></Marker>
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col gap-3">
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
