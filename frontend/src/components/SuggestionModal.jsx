import React, { useState } from "react";
import { RESOURCE_ICONS } from "../constants/resourceIcons";
import styles from "./SuggestionModal.module.css";

export default function SuggestionModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    resource_type: "",
    neighborhood: "",
    phone: "",
    website: "",
    hours: "",
    description: "",
    submitter_name: "",
    submitter_email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit suggestion");
      }

      setSuccess(true);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Suggest a New Location</h2>
          <button onClick={onClose} className={styles.close}>
            ✕
          </button>
        </div>
        <div className={styles.body}>
          {success ? (
            <div className={styles.successContainer}>
              <h3 className={styles.successTitle}>Suggestion Submitted!</h3>
              <p className={styles.successMessage}>
                Thank you for helping expand our database.
              </p>
            </div>
          ) : (
            <>
              <p className={styles.description}>
                Know a food resource that's not on our map? Let us know!
              </p>
              {error && (
                <div className={styles.errorBox}>{error}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Resource name"
                    className={styles.input}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    className={styles.input}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Resource Type <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="resource_type"
                    value={formData.resource_type}
                    onChange={handleChange}
                    className={styles.select}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select type...</option>
                    {Object.entries(RESOURCE_ICONS).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.symbol} {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Neighborhood</label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="e.g., Shadyside"
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(412) 555-1234"
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Hours</label>
                  <textarea
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    placeholder="e.g., Mon-Fri: 9:00-17:00"
                    className={`${styles.textarea} ${styles.textareaSmall}`}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Any additional information..."
                    className={styles.textarea}
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.optionalSection}>
                  <h3 className={styles.sectionTitle}>Your Information (Optional)</h3>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Your Name</label>
                    <input
                      type="text"
                      name="submitter_name"
                      value={formData.submitter_name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={styles.input}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Your Email</label>
                    <input
                      type="email"
                      name="submitter_email"
                      value={formData.submitter_email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={styles.input}
                      disabled={isSubmitting}
                    />
                    <p className={styles.hint}>
                      We may contact you if we need more information
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}