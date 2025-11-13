import React, { useState } from "react";
import styles from "./ReportModal.module.css";

export default function ReportModal({ resource, onClose }) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!resource) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resource_id: resource.properties.id,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setSuccess(true);
      setMessage("");
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Report an Issue</h2>
          <button onClick={onClose} className={styles.close}>
            ✕
          </button>
        </div>
        <div className={styles.body}>
          {success ? (
            <div className={styles.successContainer}>
              {/* <div className={styles.successIcon}>✓</div> */}
              <h3 className={styles.successTitle}>Report Submitted!</h3>
              <p className={styles.successMessage}>
                Thank you for helping improve our data.
              </p>
            </div>
          ) : (
            <>
              <p>
                Please describe the issue you found with{" "}
                <strong>{resource.properties.name}</strong>.
              </p>
              {error && (
                <div className={styles.errorBox}>{error}</div>
              )}
              <form onSubmit={handleSubmit}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue..."
                  className={styles.textarea}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}