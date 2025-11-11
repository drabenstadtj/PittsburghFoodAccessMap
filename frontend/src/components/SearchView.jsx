import React from "react";
import styles from "./SearchView.module.css";

export default function SearchView({
  searchQuery,
  setSearchQuery,
  setFilters,
  setActiveView,
  filters,
}) {
  return (
    <div className={styles.root}>
      <h2 className={styles.h2}>Search Resources</h2>

      <div className={styles.inputWrap}>
        <input
          type="text"
          placeholder="Search by name, address, or neighborhood..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.quick}>
        <h3 className={styles.h3}>Quick Filters</h3>
        <div className={styles.chips}>
          <button
            onClick={() => setFilters((f) => ({ ...f, openNow: true }))}
            className={filters.openNow ? styles.chipBtnActive : styles.chipBtn}
          >
            Open Now
          </button>
          <button
            onClick={() => {
              setFilters((f) => ({ ...f, resourceTypes: ["food_pantry"] }));
              setActiveView("map");
            }}
            className={styles.chipBtn}
          >
            Free Food
          </button>
          <button
            onClick={() => {
              setFilters((f) => ({ ...f, resourceTypes: ["grocery_store"] }));
              setActiveView("map");
            }}
            className={styles.chipBtn}
          >
            Grocery Stores
          </button>
        </div>
      </div>

      <div>
        <h3 className={styles.h3}>Popular Neighborhoods</h3>
        {[
          "Oakland",
          "Squirrel Hill",
          "Lawrenceville",
          "Strip District",
          "Shadyside",
        ].map((n) => (
          <button
            key={n}
            onClick={() => {
              setFilters((f) => ({ ...f, neighborhood: n }));
              setActiveView("map");
            }}
            className={styles.listBtn}
          >
            📍 {n}
          </button>
        ))}
      </div>
    </div>
  );
}
