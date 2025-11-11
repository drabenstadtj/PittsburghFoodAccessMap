// App.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import {
  Map,
  List,
  Filter,
  Search,
  HelpCircle,
  Crosshair,
  LocateFixed,
} from "lucide-react";

import FilterPanel from "./components/FilterPanel";
import DetailModal from "./components/DetailModal";
import MapView from "./components/MapView";
import ListView from "./components/ListView";
import ResourcesPanel from "./components/ResourcesPanel";
import SearchView from "./components/SearchView";
import HelpView from "./components/HelpView";

import { useWindowSize } from "./hooks/useWindowSize";
import { fetchResources } from "./services/api";
import { calculateDistance } from "./utils/mapUtils";
import { RESOURCE_ICONS } from "./constants/resourceIcons";
import { toPrimary } from "./constants/categoryMap";

import { requestLocation } from "./utils/location";

function PittsburghFoodMap() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("map"); // "map" | "list" | "search" | "help"
  const [filters, setFilters] = useState({
    resourceTypes: [],
    neighborhood: "All Neighborhoods",
    distance: 2,
    openNow: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // measure bottom nav height to avoid overlap on mobile
  const navRef = useRef(null);
  const [navH, setNavH] = useState(72);
  useLayoutEffect(() => {
    const update = () => setNavH(navRef.current?.offsetHeight || 72);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isMobile = useWindowSize();
  const PITTSBURGH_CENTER = useMemo(() => [40.4406, -79.9959], []);

  const normalizeFeature = (f) => {
    const raw =
      f?.properties?.primary_type ||
      f?.properties?.resource_type ||
      f?.properties?.category ||
      "other";
    const primary = toPrimary(raw);
    return {
      ...f,
      properties: {
        ...f.properties,
        resource_type_raw: raw,
        primary_type: primary,
      },
    };
  };

  // initial load
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchResources();
        if (data.type === "FeatureCollection" && data.features) {
          const normalized = data.features.map(normalizeFeature);
          setResources(normalized);
          setFilteredResources(normalized);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error(err);
        // fallback mock data (to remove when backend is deployed)
        const types = Object.keys(RESOURCE_ICONS);
        const mock = Array.from({ length: 50 }, (_, i) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              PITTSBURGH_CENTER[1] + (Math.random() - 0.5) * 0.2,
              PITTSBURGH_CENTER[0] + (Math.random() - 0.5) * 0.2,
            ],
          },
          properties: {
            id: i + 1,
            name: `Resource ${i + 1}`,
            resource_type: types[Math.floor(Math.random() * types.length)],
            address: `${Math.floor(Math.random() * 9999)} Main St`,
            neighborhood: "All Neighborhoods",
            hours: "Mon-Fri: 9:00-17:00, Sat: 10:00-14:00",
            phone: "(412) 555-1212",
            website: "https://example.com",
            description: "Community resource.",
          },
        })).map(normalizeFeature);
        setResources(mock);
        setFilteredResources(mock);
      } finally {
        setLoading(false);
      }
    })();
  }, [PITTSBURGH_CENTER]);

  // filtering pipeline
  useEffect(() => {
    let filtered = [...resources];

    if (filters.resourceTypes.length > 0) {
      filtered = filtered.filter((r) =>
        filters.resourceTypes.includes(r.properties.primary_type)
      );
    }

    if (filters.neighborhood !== "All Neighborhoods") {
      filtered = filtered.filter(
        (r) => r.properties.neighborhood === filters.neighborhood
      );
    }

    if (userLocation) {
      filtered = filtered.filter((r) => {
        const d = calculateDistance(
          userLocation[0],
          userLocation[1],
          r.geometry.coordinates[1],
          r.geometry.coordinates[0]
        );
        return d <= filters.distance;
      });
    }

    // Placeholder for open-now
    if (filters.openNow) {
      filtered = filtered.filter(() => Math.random() > 0.3);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.properties.name.toLowerCase().includes(q) ||
          r.properties.address?.toLowerCase().includes(q) ||
          r.properties.neighborhood?.toLowerCase().includes(q)
      );
    }

    setFilteredResources(filtered);
  }, [filters, resources, userLocation, searchQuery]);

  const handleGetDirections = (resource) => {
    const [lng, lat] = resource.geometry.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const handleMoreInfo = (resource) => setSelectedResource(resource);

  const centerContent = () => {
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontSize: 18,
            color: "#6c757d",
          }}
        >
          Loading food resources...
        </div>
      );
    }

    if (activeView === "map") {
      return (
        <MapView
          filteredResources={filteredResources}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          isMobile={isMobile}
          handleGetDirections={handleGetDirections}
          handleMoreInfo={handleMoreInfo}
          center={PITTSBURGH_CENTER}
        />
      );
    }

    if (activeView === "list") {
      return (
        <ListView
          filteredResources={filteredResources}
          userLocation={userLocation}
          onDirections={handleGetDirections}
          onMoreInfo={handleMoreInfo}
          isMobile={isMobile}
        />
      );
    }

    if (activeView === "search") {
      return (
        <SearchView
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          setActiveView={setActiveView}
        />
      );
    }

    if (activeView === "help") return <HelpView />;
    return null;
  };

  // desktop layout
  if (!isMobile) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Left: Filters */}
        <div
          style={{
            width: 300,
            background: "white",
            borderRight: "1px solid #dee2e6",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: 20,
              borderBottom: "1px solid #dee2e6",
              background: "#FFB81C",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 20, color: "black" }}>
              Pittsburgh Food Access Map
            </h1>
          </div>

          <div style={{ padding: 20, borderBottom: "1px solid #dee2e6" }}>
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 14,
                border: "1px solid #ced4da",
                borderRadius: 6,
              }}
            />
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onClose={() => {}}
              isMobile={false}
            />
          </div>
        </div>

        {/* Center: Content */}
        <div style={{ flex: 1, position: "relative" }}>
          {centerContent()}

          {/* Floating locate button (bottom-right) */}
          {activeView === "map" && (
            <button
              onClick={() =>
                navigator.geolocation?.getCurrentPosition(
                  (pos) =>
                    setUserLocation([
                      pos.coords.latitude,
                      pos.coords.longitude,
                    ]),
                  () =>
                    alert(
                      "Unable to get your location. Enable location services."
                    )
                )
              }
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                zIndex: 1000,
                background: "white",
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: "50%",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
              title="Find my location"
              aria-label="Find my location"
            >
              <Crosshair size={20} strokeWidth={2.2} />
            </button>
          )}

          {/* Count badge */}
          {activeView === "map" && (
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 55,
                zIndex: 1000,
                background: "white",
                padding: "8px 12px",
                borderRadius: 20,
                boxShadow: "0 2px 5px rgba(16, 7, 7, 0.2)",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {filteredResources.length} resources found
            </div>
          )}
        </div>

        {/* Right: Resources Panel */}
        <ResourcesPanel
          filteredResources={filteredResources}
          userLocation={userLocation}
          onDirections={handleGetDirections}
          onMoreInfo={handleMoreInfo}
        />

        {/* Modal */}
        <DetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      </div>
    );
  }

  // mobile layout
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: "#f8f9fa",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#FFB81C",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18, color: "black" }}>
          PGH Food Map
        </h1>
      </div>

      {/* Main */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {centerContent()}

        {activeView === "map" && (
          <button
            onClick={() =>
              requestLocation({
                onSuccess: (coords) => setUserLocation(coords),
                onError: (msg) => alert(msg),
              })
            }
            style={{
              position: "fixed",
              right: 16,
              bottom: `calc(${navH + 16}px + env(safe-area-inset-bottom))`,
              zIndex: 1500,
              background: "white",
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}
            aria-label="Find my location"
            title="Find my location"
          >
            <Crosshair size={22} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* Bottom nav */}
      <nav
        ref={navRef}
        style={{
          display: "flex",
          justifyContent: "space-around",
          background: "white",
          borderTop: "1px solid #dee2e6",
          paddingTop: 8,
          paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
          boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
          position: "sticky",
          bottom: 0,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setActiveView("map")}
          style={{
            background: "none",
            border: "none",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: activeView === "map" ? "#FFB81C" : "#6c757d",
            cursor: "pointer",
          }}
          aria-label="Map"
        >
          <Map size={20} />
          <span style={{ fontSize: 12 }}>Map</span>
        </button>

        <button
          onClick={() => setActiveView("list")}
          style={{
            background: "none",
            border: "none",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: activeView === "list" ? "#FFB81C" : "#6c757d",
            cursor: "pointer",
            position: "relative",
          }}
          aria-label="List"
        >
          <List size={20} />
          <span style={{ fontSize: 12 }}>List</span>
          {filteredResources.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                background: "#dc3545",
                color: "white",
                borderRadius: 10,
                padding: "2px 6px",
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              {filteredResources.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setShowFilters(true)}
          style={{
            background: "none",
            border: "none",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color:
              filters.resourceTypes.length > 0 ||
              filters.neighborhood !== "All Neighborhoods"
                ? "#FFB81C"
                : "#6c757d",
            cursor: "pointer",
          }}
          aria-label="Filter"
        >
          <Filter size={20} />
          <span style={{ fontSize: 12 }}>Filter</span>
        </button>

        <button
          onClick={() => setActiveView("search")}
          style={{
            background: "none",
            border: "none",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: activeView === "search" ? "#FFB81C" : "#6c757d",
            cursor: "pointer",
          }}
          aria-label="Search"
        >
          <Search size={20} />
          <span style={{ fontSize: 12 }}>Search</span>
        </button>

        <button
          onClick={() => setActiveView("help")}
          style={{
            background: "none",
            border: "none",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: activeView === "help" ? "#FFB81C" : "#6c757d",
            cursor: "pointer",
          }}
          aria-label="Help"
        >
          <HelpCircle size={20} />
          <span style={{ fontSize: 12 }}>Help</span>
        </button>
      </nav>

      {/* Mobile filters modal */}
      {showFilters && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            background: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "80vh",
            zIndex: 1500,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
            display: "flex", 
            flexDirection: "column", 
          }}
        >
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onClose={() => setShowFilters(false)}
            isMobile
          />
        </div>
      )}

      <DetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </div>
  );
}

export default PittsburghFoodMap;
