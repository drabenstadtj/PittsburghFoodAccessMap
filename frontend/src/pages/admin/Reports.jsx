import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, Check, X, Trash2 } from 'lucide-react';
import styles from './Reports.module.css';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, statusFilter]);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports', {
        credentials: 'include',
      });
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.message.toLowerCase().includes(q) ||
        r.resource_name?.toLowerCase().includes(q)
      );
    }

    setFilteredReports(filtered);
  };

  const handleUpdateStatus = async (id, status, adminNotes = '') => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, admin_notes: adminNotes }),
      });

      if (response.ok) {
        fetchReports();
        setShowModal(false);
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const openModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'reviewed': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading reports...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Reports Management</h1>
          <p className={styles.subtitle}>Review and manage user-submitted reports</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search reports..."
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
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total:</span>
          <span className={styles.statValue}>{reports.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Pending:</span>
          <span className={styles.statValue}>
            {reports.filter(r => r.status === 'pending').length}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Showing:</span>
          <span className={styles.statValue}>{filteredReports.length}</span>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className={styles.empty}>
          <p>No reports found</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>#{report.id}</td>
                  <td>{report.resource_name || 'General'}</td>
                  <td className={styles.messageCell}>
                    {report.message.length > 100
                      ? `${report.message.substring(0, 100)}...`
                      : report.message}
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ background: getStatusColor(report.status) }}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td>{new Date(report.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => openModal(report)}
                        className={styles.actionBtn}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                            className={styles.actionBtn}
                            title="Mark as reviewed"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(report.id, 'resolved')}
                            className={styles.actionBtn}
                            title="Mark as resolved"
                            style={{ color: '#4CAF50' }}
                          >
                            <Check size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        className={styles.actionBtn}
                        title="Delete"
                        style={{ color: '#f44336' }}
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

      {showModal && selectedReport && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Report Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <strong>Report ID:</strong>
                <span>#{selectedReport.id}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Resource:</strong>
                <span>{selectedReport.resource_name || 'General Report'}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Status:</strong>
                <span
                  className={styles.statusBadge}
                  style={{ background: getStatusColor(selectedReport.status) }}
                >
                  {selectedReport.status}
                </span>
              </div>
              <div className={styles.detailRow}>
                <strong>Submitted:</strong>
                <span>{new Date(selectedReport.created_at).toLocaleString()}</span>
              </div>
              <div className={styles.detailSection}>
                <strong>Message:</strong>
                <p>{selectedReport.message}</p>
              </div>
              {selectedReport.admin_notes && (
                <div className={styles.detailSection}>
                  <strong>Admin Notes:</strong>
                  <p>{selectedReport.admin_notes}</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                className={styles.btnSecondary}
                disabled={actionLoading || selectedReport.status === 'resolved'}
              >
                Mark as Reviewed
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                className={styles.btnPrimary}
                disabled={actionLoading || selectedReport.status === 'resolved'}
              >
                {actionLoading ? 'Updating...' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}