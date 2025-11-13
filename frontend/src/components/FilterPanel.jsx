import React, { useState, useMemo, useEffect } from "react";
import { PRIMARY_META, PRIMARY_ORDER } from "../constants/categoryMap";
import styles from "./FilterPanel.module.css";

export default function FilterPanel({
  filters,
  setFilters,
  onClose,
  isMobile,
  onHelp,
  userLocation,
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const ORDERED_KEYS = useMemo(() => {
    const uniq = Array.from(new Set(PRIMARY_ORDER));
    return uniq.filter((k) => PRIMARY_META[k]);
  }, []);

  const handleApply = () => {
    setFilters(localFilters);
    if (isMobile) onClose?.();
  };

  const handleReset = () => {
    const reset = {
      resourceTypes: [],
      distance: 2,
      openNow: false,
    };
    setLocalFilters(reset);
    setFilters(reset);
  };

  const togglePrimary = (key, checked) => {
    const current = new Set(localFilters.resourceTypes);
    if (checked) current.add(key);
    else current.delete(key);
    setLocalFilters({ ...localFilters, resourceTypes: Array.from(current) });
  };

  const selectAll = () =>
    setLocalFilters({ ...localFilters, resourceTypes: ORDERED_KEYS.slice() });
  const clearAll = () =>
    setLocalFilters({ ...localFilters, resourceTypes: [] });

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <h2 className={styles.title}>Filters</h2>
        {isMobile && (
          <button onClick={onClose} className={styles.close}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.bar} style={{ alignItems: "baseline" }}>
          <h3 className={styles.sectionTitle}>Resource Type</h3>
          <div className={styles.controls}>
            <button onClick={selectAll} type="button" className={styles.btn}>
              All
            </button>
            <button onClick={clearAll} type="button" className={styles.btn}>
              None
            </button>
          </div>
        </div>

        {ORDERED_KEYS.map((key) => {
          const cfg = PRIMARY_META[key];
          const checked = localFilters.resourceTypes.includes(key);
          return (
            <label key={key} className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => togglePrimary(key, e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.icon}>{cfg.symbol}</span>
              <span>{cfg.label}</span>
              {checked && (
                <button
                  type="button"
                  onClick={() =>
                    setLocalFilters({ ...localFilters, resourceTypes: [key] })
                  }
                  className={styles.only}
                >
                  only
                </button>
              )}
            </label>
          );
        })}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Distance: {localFilters.distance} miles
        </h3>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={localFilters.distance}
          onChange={(e) =>
            setLocalFilters({
              ...localFilters,
              distance: parseFloat(e.target.value),
            })
          }
          className={styles.rangeInput}
        />
        <div className={styles.rangeMeta}>
          <span>0.5 mi</span>
          <span>10 mi</span>
        </div>
        {!userLocation && (
          <p className={styles.distanceNote}>
            📍 Enable location to use distance filter
          </p>
        )}
      </div>

      <div className={styles.section}>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={localFilters.openNow}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, openNow: e.target.checked })
            }
            className={styles.checkbox}
          />
          <span>Open Now</span>
        </label>
      </div>

      <div className={styles.footer}>
        <button onClick={handleApply} className={styles.apply}>
          Apply Filters
        </button>
        <button onClick={handleReset} className={styles.reset}>
          Reset
        </button>
      </div>

      {/* Only show Help button on desktop */}
      {!isMobile && (
        <div className={styles.helpFooter}>
          <button onClick={onHelp} className={styles.help}>
            Help
          </button>
        </div>
      )}
    </div>
  );
}
