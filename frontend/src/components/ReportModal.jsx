import React, { useState } from "react";
import styles from "./ReportModal.module.css"; 

export default function ReportModal({ resource, onClose }) {
  const [message, setMessage] = useState("");

  if (!resource) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Report submitted for: ${resource.properties.name}\nMessage: ${message}`);
    setMessage("");
    onClose();
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Report an Issue</h2>
          <button onClick={onClose} className={styles.close}>✕</button>
        </div>

        <div className={styles.body}>
          <p>
            Please describe the issue you found with{" "}
            <strong>{resource.properties.name}</strong>.
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                resize: "vertical",
                fontFamily: "inherit",
                fontSize: "15px",
              }}
              required
            />

            <button
              type="submit"
              style={{
                marginTop: "16px",
                padding: "10px 20px",
                background: "#FFB81C",
                border: "none",
                borderRadius: "8px",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
