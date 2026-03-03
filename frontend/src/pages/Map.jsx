import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Map, List, Filter, HelpCircle, Crosshair } from "lucide-react";

import FilterPanel from "../components/FilterPanel";
import DetailModal from "../components/DetailModal";
import MapView from "../components/MapView";
import ListView from "../components/ListView";
import ResourcesPanel from "../components/ResourcesPanel";
import HelpView from "../components/HelpView";

import { useIsMobile } from "../hooks/useIsMobile";
import { fetchResources } from "../services/api";
import { calculateDistance, isOpenNow } from "../utils/mapUtils";
import { toPrimary } from "../constants/resourceTypes";
import { requestLocation } from "../utils/location";

import styles from "../App.module.css";

const PITTSBURGH_CENTER = [40.4406, -79.9959];

const normalizeFeature = (f) => {
    const raw =
        f?.properties?.primary_type ||
        f?.properties?.resource_type ||
        f?.properties?.category ||
        "other";
    return {
        ...f,
        properties: {
            ...f.properties,
            resource_type_raw: raw,
            primary_type: toPrimary(raw),
        },
    };
};

function MapPage() {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState("map");
    const [filters, setFilters] = useState({
        resourceTypes: [],
        distance: 2,
        openNow: false,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const navRef = useRef(null);
    const [navH, setNavH] = useState(72);

    useLayoutEffect(() => {
        const update = () => setNavH(navRef.current?.offsetHeight || 72);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const isMobile = useIsMobile();

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
                setError("Failed to load resources. Please try again later.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        let filtered = [...resources];

        // Apply resource type filter first
        if (filters.resourceTypes.length > 0) {
            filtered = filtered.filter((r) =>
                filters.resourceTypes.includes(r.properties.primary_type),
            );
        }

        // Apply search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.properties.name.toLowerCase().includes(q) ||
                    r.properties.address?.toLowerCase().includes(q) ||
                    r.properties.neighborhood?.toLowerCase().includes(q),
            );
        }

        // Apply distance filter only if userLocation exists
        if (userLocation && filters.distance) {
            filtered = filtered.filter((r) => {
                const d = calculateDistance(
                    userLocation[0],
                    userLocation[1],
                    r.geometry.coordinates[1],
                    r.geometry.coordinates[0],
                );
                return d <= filters.distance;
            });
        }

        // Apply open now filter
        if (filters.openNow) {
            filtered = filtered.filter((r) => isOpenNow(r.properties.hours));
        }

        setFilteredResources(filtered);
    }, [filters, resources, userLocation, searchQuery]);

    const handleGetDirections = (resource) => {
        const [lng, lat] = resource.geometry.coordinates;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, "_blank");
    };

    const handleMoreInfo = (resource) => setSelectedResource(resource);

    const handleShowHelp = () => {
        // Toggle help on desktop, or just show it on mobile
        if (!isMobile && activeView === "help") {
            setActiveView("map"); // Close help and go back to map
        } else {
            setActiveView("help");
        }
        if (isMobile) {
            setShowFilters(false);
        }
    };

    const centerContent = () => {
        if (loading) {
            return (
                <div className={styles.loadingContainer}>
                    Loading food resources...
                </div>
            );
        }

        if (error) {
            return <div className={styles.loadingContainer}>{error}</div>;
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
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            );
        }

        if (activeView === "help")
            return (
                <HelpView
                    onClose={() => setActiveView("map")}
                    isMobile={isMobile}
                />
            );
        return null;
    };

    // Desktop layout
    if (!isMobile) {
        return (
            <div className={styles.app}>
                <div className={styles.leftSidebar}>
                    <div className={styles.header}>
                        <img
                            src="/PPI_Logo_white.svg"
                            alt="Pittsburgh Food Access Map"
                            className={styles.headerLogo}
                        />
                    </div>

                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.filterContainer}>
                        <FilterPanel
                            filters={filters}
                            setFilters={setFilters}
                            onClose={() => {}}
                            isMobile={false}
                            onHelp={handleShowHelp}
                            userLocation={userLocation}
                        />
                    </div>
                </div>

                <div className={styles.centerContent}>
                    {centerContent()}

                    {activeView === "map" && (
                        <>
                            <button
                                onClick={() =>
                                    requestLocation({
                                        onSuccess: (coords) =>
                                            setUserLocation(coords),
                                        onError: (msg) => alert(msg),
                                    })
                                }
                                className={styles.locateButton}
                                title="Find my location"
                                aria-label="Find my location"
                            >
                                <Crosshair size={20} strokeWidth={2.2} />
                            </button>

                            <div className={styles.countBadge}>
                                {filteredResources.length} resources found
                            </div>
                        </>
                    )}
                </div>

                <ResourcesPanel
                    filteredResources={filteredResources}
                    userLocation={userLocation}
                    onDirections={handleGetDirections}
                    onMoreInfo={handleMoreInfo}
                    isMobile={false}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                <DetailModal
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                />
            </div>
        );
    }

    // Mobile layout
    return (
        <div className={styles.mobileApp}>
            <div className={styles.mobileHeader}>
                <img
                    src="/PPI_Logo_white.svg"
                    alt="PGH Food Map"
                    className={styles.mobileHeaderLogo}
                />
            </div>

            <div className={styles.mobileMain}>
                {centerContent()}

                {activeView === "map" && (
                    <button
                        onClick={() =>
                            requestLocation({
                                onSuccess: (coords) => setUserLocation(coords),
                                onError: (msg) => alert(msg),
                            })
                        }
                        className={styles.mobileLocateButton}
                        style={{
                            bottom: `calc(${navH + 16}px + env(safe-area-inset-bottom))`,
                        }}
                        aria-label="Find my location"
                        title="Find my location"
                    >
                        <Crosshair size={22} strokeWidth={2.2} />
                    </button>
                )}
            </div>

            <nav
                ref={navRef}
                className={styles.bottomNav}
                style={{
                    paddingBottom: `calc(12px + env(safe-area-inset-bottom))`,
                }}
            >
                <button
                    onClick={() => setActiveView("map")}
                    className={`${styles.navButton} ${
                        activeView === "map"
                            ? styles.navButtonActive
                            : styles.navButtonInactive
                    }`}
                    aria-label="Map"
                >
                    <Map size={20} />
                    <span className={styles.navButtonText}>Map</span>
                </button>

                <button
                    onClick={() => setActiveView("list")}
                    className={`${styles.navButton} ${
                        activeView === "list"
                            ? styles.navButtonActive
                            : styles.navButtonInactive
                    }`}
                    aria-label="List"
                >
                    <List size={20} />
                    <span className={styles.navButtonText}>List</span>
                    {filteredResources.length > 0 && (
                        <span className={styles.navBadge}>
                            {filteredResources.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setShowFilters(true)}
                    className={`${styles.navButton} ${
                        filters.resourceTypes.length > 0
                            ? styles.navButtonActive
                            : styles.navButtonInactive
                    }`}
                    aria-label="Filter"
                >
                    <Filter size={20} />
                    <span className={styles.navButtonText}>Filter</span>
                </button>

                <button
                    onClick={() => setActiveView("help")}
                    className={`${styles.navButton} ${
                        activeView === "help"
                            ? styles.navButtonActive
                            : styles.navButtonInactive
                    }`}
                    aria-label="Help"
                >
                    <HelpCircle size={20} />
                    <span className={styles.navButtonText}>Help</span>
                </button>
            </nav>

            {showFilters && (
                <div className={styles.filtersModal}>
                    <FilterPanel
                        filters={filters}
                        setFilters={setFilters}
                        onClose={() => setShowFilters(false)}
                        isMobile
                        onHelp={handleShowHelp}
                        userLocation={userLocation}
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

export default MapPage;
