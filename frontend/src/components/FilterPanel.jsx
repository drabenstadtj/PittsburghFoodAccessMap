import React from 'react';
import { X } from 'lucide-react';
import { RESOURCE_ICONS } from '../constants/resourceIcons';
import styles from './FilterPanel.module.css';

function FilterPanel({ filters, setFilters, onClose, isMobile, onHelp, userLocation }) {
  const toggleResourceType = (type) => {
    setFilters((prev) => ({
      ...prev,
      resourceTypes: prev.resourceTypes.includes(type)
        ? prev.resourceTypes.filter((t) => t !== type)
        : [...prev.resourceTypes, type],
    }));
  };

  const selectOnly = (type) => {
    setFilters((prev) => ({
      ...prev,
      resourceTypes: [type],
    }));
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      {isMobile && (
        <div className={styles.bar}>
          <h2 className={styles.title}>Filters</h2>
          <button onClick={onClose} className={styles.close} aria-label="Close filters">
            <X size={24} />
          </button>
        </div>
      )}

      {/* Resource Types Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Resource Type</h3>
        
        <div className={styles.controls}>
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                resourceTypes: Object.keys(RESOURCE_ICONS),
              }))
            }
            className={styles.btn}
          >
            All
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, resourceTypes: [] }))}
            className={styles.btn}
          >
            None
          </button>
        </div>

        {/* Resource Type Checkboxes with Icons */}
        {Object.entries(RESOURCE_ICONS).map(([type, { icon: Icon, color, label }]) => (
          <label key={type} className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={filters.resourceTypes.includes(type)}
              onChange={() => toggleResourceType(type)}
              className={styles.checkbox}
            />
            
            {/* Icon with colored background */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: color,
                color: 'white',
                marginRight: 8,
                flexShrink: 0
              }}
            >
              <Icon size={16} strokeWidth={2.5} />
            </div>
            
            <span style={{ flex: 1 }}>{label}</span>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                selectOnly(type);
              }}
              className={styles.only}
            >
              Only
            </button>
          </label>
        ))}
      </div>

      {/* Distance Filter */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Distance</h3>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={filters.distance}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              distance: parseFloat(e.target.value),
            }))
          }
          className={styles.rangeInput}
        />
        <div className={styles.rangeMeta}>
          <span>1 mile</span>
          <strong>{filters.distance} miles</strong>
          <span>10 miles</span>
        </div>
        {!userLocation && (
          <p className={styles.distanceNote}>
            Enable location to use distance filter
          </p>
        )}
      </div>

      {/* Open Now Filter */}
      <div className={styles.section}>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                openNow: e.target.checked,
              }))
            }
            className={styles.checkbox}
          />
          <span>Open Now</span>
        </label>
      </div>

      {/* Action Buttons */}
      {isMobile && (
        <>
          <div className={styles.footer}>
            <button
              onClick={() => {
                setFilters({ resourceTypes: [], distance: 2, openNow: false });
              }}
              className={styles.reset}
            >
              Reset Filters
            </button>
            <button onClick={onClose} className={styles.apply}>
              Apply Filters
            </button>
          </div>

          <div className={styles.helpFooter}>
            <button onClick={onHelp} className={styles.help}>
              Need Help?
            </button>
          </div>
        </>
      )}

      {/* Desktop Help Button */}
      {!isMobile && (
        <div className={styles.helpFooter}>
          <button onClick={onHelp} className={styles.help}>
            Need Help?
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;