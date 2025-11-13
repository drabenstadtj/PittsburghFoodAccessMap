import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import styles from "./Resources.module.css";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    resource_type: "",
    neighborhood: "",
    phone: "",
    website: "",
    hours: "",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, typeFilter]);

  const fetchResources = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/food-resources", {
        credentials: "include",
      });
      const data = await response.json();
      // Backend returns GeoJSON FeatureCollection
      setResources(data.features || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (r) =>
          r.properties.resource_type === typeFilter ||
          r.properties.primary_type === typeFilter
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.properties.name.toLowerCase().includes(q) ||
          r.properties.address?.toLowerCase().includes(q) ||
          r.properties.neighborhood?.toLowerCase().includes(q)
      );
    }

    setFilteredResources(filtered);
  };

  const resourceTypes = [
    ...new Set(
      resources.map(
        (r) => r.properties.resource_type || r.properties.primary_type
      )
    ),
  ].filter(Boolean);

  const openCreateModal = () => {
    setEditingResource(null);
    setFormData({
      name: "",
      address: "",
      resource_type: "",
      neighborhood: "",
      phone: "",
      website: "",
      hours: "",
      description: "",
      latitude: "", // ADD THIS
      longitude: "", // ADD THIS
    });
    setShowModal(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.properties.name,
      address: resource.properties.address || "",
      resource_type: resource.properties.resource_type || "",
      neighborhood: resource.properties.neighborhood || "",
      phone: resource.properties.phone || "",
      website: resource.properties.website || "",
      hours: resource.properties.hours || "",
      description: resource.properties.description || "",
      latitude: resource.geometry.coordinates[1], // GeoJSON is [lng, lat]
      longitude: resource.geometry.coordinates[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = editingResource
        ? `http://localhost:5000/api/food-resources/${editingResource.properties.id}`
        : "http://localhost:5000/api/food-resources";

      const method = editingResource ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });

      if (response.ok) {
        fetchResources();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save resource");
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      alert("Failed to save resource");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/food-resources/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        fetchResources();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert("Failed to delete resource");
    }
  };

  const openInMaps = (coordinates) => {
    const [lng, lat] = coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className={styles.loading}>Loading resources...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Resources Management</h1>
          <p className={styles.subtitle}>Manage all food access resources</p>
        </div>
        <button onClick={openCreateModal} className={styles.createBtn}>
          <Plus size={20} />
          Add New Resource
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Types</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Resources:</span>
          <span className={styles.statValue}>{resources.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Showing:</span>
          <span className={styles.statValue}>{filteredResources.length}</span>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className={styles.empty}>
          <p>No resources found</p>
          <button onClick={openCreateModal} className={styles.emptyBtn}>
            <Plus size={20} />
            Add First Resource
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredResources.map((resource) => (
            <div key={resource.properties.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{resource.properties.name}</h3>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => openEditModal(resource)}
                    className={styles.iconBtn}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.properties.id)}
                    className={styles.iconBtn}
                    title="Delete"
                    style={{ color: "#f44336" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.cardContent}>
                <span className={styles.typeBadge}>
                  {resource.properties.resource_type ||
                    resource.properties.primary_type}
                </span>

                {resource.properties.address && (
                  <div className={styles.cardRow}>
                    <MapPin size={16} />
                    <span>{resource.properties.address}</span>
                  </div>
                )}

                {resource.properties.neighborhood && (
                  <div className={styles.cardRow}>
                    <span className={styles.label}>Neighborhood:</span>
                    <span>{resource.properties.neighborhood}</span>
                  </div>
                )}

                {resource.properties.phone && (
                  <div className={styles.cardRow}>
                    <span className={styles.label}>Phone:</span>
                    <span>{resource.properties.phone}</span>
                  </div>
                )}

                {resource.properties.hours && (
                  <div className={styles.cardRow}>
                    <span className={styles.label}>Hours:</span>
                    <span className={styles.hours}>
                      {typeof resource.properties.hours === "object"
                        ? JSON.stringify(resource.properties.hours)
                        : resource.properties.hours}
                    </span>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <button
                    onClick={() => openInMaps(resource.geometry.coordinates)}
                    className={styles.mapLinkBtn}
                  >
                    <MapPin size={14} />
                    View on Map
                  </button>
                  {resource.properties.website && (
                    <a
                      href={resource.properties.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.websiteLink}
                    >
                      <ExternalLink size={14} />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingResource ? "Edit Resource" : "Add New Resource"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Resource Type <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="resource_type"
                      value={formData.resource_type}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="e.g., Food Bank, Pantry"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Neighborhood</label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="e.g., Shadyside"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                  />
                </div>

                {/* ADD LATITUDE/LONGITUDE HERE - BEFORE PHONE/WEBSITE */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Latitude <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="40.4406"
                      step="0.000001"
                      min="-90"
                      max="90"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Longitude <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="-79.9959"
                      step="0.000001"
                      min="-180"
                      max="180"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="(412) 555-1234"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Hours</label>
                  <textarea
                    name="hours"
                    value={formData.hours}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="e.g., Mon-Fri: 9:00-17:00"
                    rows={2}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="Additional information..."
                    rows={3}
                  />
                </div>
              </div>

              {/* MODAL FOOTER STAYS AT THE END */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.btnSecondary}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Saving..."
                    : editingResource
                    ? "Update Resource"
                    : "Create Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
