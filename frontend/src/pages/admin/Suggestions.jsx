import React, { useEffect, useState } from "react";
import { Search, Filter, Eye, Check, X, Trash2, MapPin } from "lucide-react";
import styles from "./Suggestions.module.css";

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    filterSuggestions();
  }, [suggestions, searchQuery, statusFilter]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/suggestions", {
        credentials: "include",
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSuggestions = () => {
    let filtered = [...suggestions];

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q) ||
          s.neighborhood?.toLowerCase().includes(q)
      );
    }

    setFilteredSuggestions(filtered);
  };

  const handleUpdateStatus = async (id, status, notes = "") => {
    setActionLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/suggestions/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status, admin_notes: notes || adminNotes }),
        }
      );

      if (response.ok) {
        fetchSuggestions();
        setShowModal(false);
        setSelectedSuggestion(null);
        setAdminNotes("");
      }
    } catch (error) {
      console.error("Error updating suggestion:", error);
      alert("Failed to update suggestion");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this suggestion?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/suggestions/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        fetchSuggestions();
      }
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      alert("Failed to delete suggestion");
    }
  };

  const openModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setAdminNotes(suggestion.admin_notes || "");
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFC107";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#f44336";
      default:
        return "#9E9E9E";
    }
  };

  const openInMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return <div className={styles.loading}>Loading suggestions...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Location Suggestions</h1>
          <p className={styles.subtitle}>
            Review and approve new location suggestions
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <Filter size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total:</span>
          <span className={styles.statValue}>{suggestions.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Pending:</span>
          <span className={styles.statValue}>
            {suggestions.filter((s) => s.status === "pending").length}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Approved:</span>
          <span className={styles.statValue}>
            {suggestions.filter((s) => s.status === "approved").length}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Showing:</span>
          <span className={styles.statValue}>{filteredSuggestions.length}</span>
        </div>
      </div>

      {filteredSuggestions.length === 0 ? (
        <div className={styles.empty}>
          <p>No suggestions found</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Address</th>
                <th>Neighborhood</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuggestions.map((suggestion) => (
                <tr key={suggestion.id}>
                  <td>#{suggestion.id}</td>
                  <td className={styles.nameCell}>{suggestion.name}</td>
                  <td>
                    <span className={styles.typeBadge}>
                      {suggestion.resource_type}
                    </span>
                  </td>
                  <td className={styles.addressCell}>
                    <div className={styles.addressContent}>
                      {suggestion.address}
                      <button
                        onClick={() => openInMaps(suggestion.address)}
                        className={styles.mapBtn}
                        title="Open in Google Maps"
                      >
                        <MapPin size={14} />
                      </button>
                    </div>
                  </td>
                  <td>{suggestion.neighborhood || "-"}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ background: getStatusColor(suggestion.status) }}
                    >
                      {suggestion.status}
                    </span>
                  </td>
                  <td>
                    {new Date(suggestion.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => openModal(suggestion)}
                        className={styles.actionBtn}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      {suggestion.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(suggestion.id, "approved")
                            }
                            className={styles.actionBtn}
                            title="Approve"
                            style={{ color: "#4CAF50" }}
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(suggestion.id, "rejected")
                            }
                            className={styles.actionBtn}
                            title="Reject"
                            style={{ color: "#f44336" }}
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(suggestion.id)}
                        className={styles.actionBtn}
                        title="Delete"
                        style={{ color: "#f44336" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedSuggestion && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Suggestion Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <strong>Suggestion ID:</strong>
                  <span>#{selectedSuggestion.id}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Status:</strong>
                  <span
                    className={styles.statusBadge}
                    style={{
                      background: getStatusColor(selectedSuggestion.status),
                    }}
                  >
                    {selectedSuggestion.status}
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <strong>Name:</strong>
                <p>{selectedSuggestion.name}</p>
              </div>

              <div className={styles.detailSection}>
                <strong>Address:</strong>
                <p>
                  {selectedSuggestion.address}
                  <button
                    onClick={() => openInMaps(selectedSuggestion.address)}
                    className={styles.linkBtn}
                  >
                    <MapPin size={14} /> Open in Maps
                  </button>
                </p>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <strong>Resource Type:</strong>
                  <span className={styles.typeBadge}>
                    {selectedSuggestion.resource_type}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Neighborhood:</strong>
                  <span>{selectedSuggestion.neighborhood || "-"}</span>
                </div>
              </div>

              {selectedSuggestion.phone && (
                <div className={styles.detailSection}>
                  <strong>Phone:</strong>
                  <p>{selectedSuggestion.phone}</p>
                </div>
              )}

              {selectedSuggestion.website && (
                <div className={styles.detailSection}>
                  <strong>Website:</strong>
                  <p>
                    <a
                      href={selectedSuggestion.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {selectedSuggestion.website}
                    </a>
                  </p>
                </div>
              )}

              {selectedSuggestion.hours && (
                <div className={styles.detailSection}>
                  <strong>Hours:</strong>
                  <p className={styles.preWrap}>{selectedSuggestion.hours}</p>
                </div>
              )}

              {selectedSuggestion.description && (
                <div className={styles.detailSection}>
                  <strong>Description:</strong>
                  <p>{selectedSuggestion.description}</p>
                </div>
              )}

              {(selectedSuggestion.submitter_name ||
                selectedSuggestion.submitter_email) && (
                <div className={styles.submitterSection}>
                  <strong>Submitted by:</strong>
                  <p>
                    {selectedSuggestion.submitter_name && (
                      <span>{selectedSuggestion.submitter_name}</span>
                    )}
                    {selectedSuggestion.submitter_email && (
                      <span className={styles.email}>
                        {selectedSuggestion.submitter_email}
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className={styles.detailItem}>
                <strong>Submitted:</strong>
                <span>
                  {new Date(selectedSuggestion.created_at).toLocaleString()}
                </span>
              </div>

              {selectedSuggestion.status === "pending" && (
                <div className={styles.notesSection}>
                  <label>
                    <strong>Admin Notes (optional):</strong>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this decision..."
                      className={styles.textarea}
                      rows={3}
                    />
                  </label>
                </div>
              )}

              {selectedSuggestion.admin_notes && (
                <div className={styles.detailSection}>
                  <strong>Admin Notes:</strong>
                  <p>{selectedSuggestion.admin_notes}</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {selectedSuggestion.status === "pending" ? (
                <>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedSuggestion.id, "rejected")
                    }
                    className={styles.btnDanger}
                    disabled={actionLoading}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedSuggestion.id, "approved")
                    }
                    className={styles.btnSuccess}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Updating..." : "Approve"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(false)}
                  className={styles.btnSecondary}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
