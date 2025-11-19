import React, { useState } from "react";
import { createReport } from "../services/api";
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
      await createReport({
        resource_id: resource.properties.id,
        message: message.trim(),
      });

      setSuccess(true);
      setMessage("");
      
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