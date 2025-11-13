import React, { useState } from "react";
import { X } from "lucide-react";
import { RESOURCE_ICONS } from "../constants/resourceIcons";
import styles from "./HelpView.module.css";

export default function HelpView({ onClose, isMobile }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleReportSubmit = async (e) => {
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
          resource_id: null,
          message: reportMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setSuccess(true);
      setReportMessage("");

      // Auto-close after 5 seconds
      setTimeout(() => {
        setShowReportModal(false);
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setReportMessage("");
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      <div className={styles.root}>
        {!isMobile && (
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close help"
          >
            <X size={24} />
          </button>
        )}

        <h2 className={styles.h2}>Help & Information</h2>
        <div className={styles.section}>
          <h3 className={styles.h3}>How to Use This Map</h3>
          <ol className={styles.ol}>
            <li>Use the Map view to see all food resources.</li>
            <li>Tap markers for basic information.</li>
            <li>Use filters to narrow results.</li>
            <li>Click "Get Directions" for navigation.</li>
            <li>Report issues to keep data accurate.</li>
          </ol>
        </div>

        <div className={styles.section}>
          <h3 className={styles.h3}>Report an Issue</h3>
          <button
            onClick={() => setShowReportModal(true)}
            className={styles.report}
          >
            Report Missing or Incorrect Information
          </button>
        </div>
        <div className={styles.about}>
          <h3 className={styles.h3}>About</h3>
          <p className={styles.aboutText}>
            The Pittsburgh Food Access Map helps residents find food resources
            in their neighborhoods.
          </p>
        </div>
      </div>

      {showReportModal && (
        <div className={styles.backdrop}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2 className={styles.title}>Report an Issue</h2>
              <button onClick={handleCloseModal} className={styles.close}>
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
                    Please describe any missing or incorrect information you've
                    found.
                  </p>
                  {error && <div className={styles.errorBox}>{error}</div>}
                  <form onSubmit={handleReportSubmit}>
                    <textarea
                      value={reportMessage}
                      onChange={(e) => setReportMessage(e.target.value)}
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
      )}
    </>
  );
}
