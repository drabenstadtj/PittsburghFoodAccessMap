import React from "react";
import { RESOURCE_ICONS } from "../constants/resourceIcons";
import styles from "./HelpView.module.css";

export default function HelpView() {
  return (
    <div className={styles.root}>
      <h2 className={styles.h2}>Help & Information</h2>

      <div className={styles.section}>
        <h3 className={styles.h3}>How to Use This Map</h3>
        <ol className={styles.ol}>
          <li>Use the Map view to see all food resources.</li>
          <li>Tap markers for basic information.</li>
          <li>Use filters to narrow results.</li>
          <li>Click “Get Directions” for navigation.</li>
          <li>Report issues to keep data accurate.</li>
        </ol>
      </div>

      <div className={styles.section}>
        <h3 className={styles.h3}>Resource Types</h3>
        {Object.entries(RESOURCE_ICONS).map(([key, cfg]) => (
          <div key={key} className={styles.row}>
            <span className={styles.symbol}>{cfg.symbol}</span>
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3 className={styles.h3}>Report an Issue</h3>
        <button
          onClick={() => alert("Report form would open here")}
          className={styles.report}
        >
          Report Missing or Incorrect Information
        </button>
      </div>

      <div className={styles.about}>
        <h3 className={styles.h3}>About</h3>
        <p className={styles.aboutText}>
          The Pittsburgh Food Access Map helps residents find food resources in
          their neighborhoods. Maintained by the Pittsburgh Policy Initiative
          with community partners.
        </p>
        <p className={styles.small}>
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
