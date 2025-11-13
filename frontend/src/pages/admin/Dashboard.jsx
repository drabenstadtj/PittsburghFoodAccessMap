import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  PlusCircle,
  Database,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    reports: { total: 0, pending: 0, reviewed: 0, resolved: 0 },
    suggestions: { total: 0, pending: 0, approved: 0, rejected: 0 },
    resources: { total: 0 },
  });
  const [recentReports, setRecentReports] = useState([]);
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        reportsStats,
        suggestionsStats,
        resourcesData,
        reportsData,
        suggestionsData,
      ] = await Promise.all([
        fetch("http://localhost:5000/api/reports/stats", {
          credentials: "include",
        }).then((r) => r.json()),
        fetch("http://localhost:5000/api/suggestions/stats", {
          credentials: "include",
        }).then((r) => r.json()),
        fetch("http://localhost:5000/api/food-resources", {
          credentials: "include",
        }).then((r) => r.json()),
        fetch("http://localhost:5000/api/reports?status=pending", {
          credentials: "include",
        }).then((r) => r.json()),
        fetch("http://localhost:5000/api/suggestions?status=pending", {
          credentials: "include",
        }).then((r) => r.json()),
      ]);

      setStats({
        reports: reportsStats,
        suggestions: suggestionsStats,
        resources: { total: resourcesData.features?.length || 0 },
      });

      setRecentReports(reportsData.reports?.slice(0, 5) || []);
      setRecentSuggestions(suggestionsData.suggestions?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p className={styles.subtitle}>
          Monitor and manage your food access map
        </p>
      </div>

      <div className={styles.statsGrid}>
        <Link to="/admin/reports" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#FFF3CD" }}>
            <AlertCircle size={24} color="#FF6B35" />
          </div>
          <div className={styles.statContent}>
            <h3>Pending Reports</h3>
            <div className={styles.statNumber}>{stats.reports.pending}</div>
            <p className={styles.statDetail}>
              {stats.reports.total} total reports
            </p>
          </div>
        </Link>

        <Link to="/admin/suggestions" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#D1E7FF" }}>
            <PlusCircle size={24} color="#0066CC" />
          </div>
          <div className={styles.statContent}>
            <h3>Pending Suggestions</h3>
            <div className={styles.statNumber}>{stats.suggestions.pending}</div>
            <p className={styles.statDetail}>
              {stats.suggestions.total} total suggestions
            </p>
          </div>
        </Link>

        <Link to="/admin/resources" className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#D4EDDA" }}>
            <Database size={24} color="#28A745" />
          </div>
          <div className={styles.statContent}>
            <h3>Total Resources</h3>
            <div className={styles.statNumber}>{stats.resources.total}</div>
            <p className={styles.statDetail}>Active food resources</p>
          </div>
        </Link>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#E7D4F5" }}>
            <TrendingUp size={24} color="#6F42C1" />
          </div>
          <div className={styles.statContent}>
            <h3>Resolution Rate</h3>
            <div className={styles.statNumber}>
              {stats.reports.total > 0
                ? Math.round(
                    (stats.reports.resolved / stats.reports.total) * 100
                  )
                : 0}
              %
            </div>
            <p className={styles.statDetail}>Reports resolved</p>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.recentCard}>
          <div className={styles.recentHeader}>
            <h2>Recent Reports</h2>
            <Link to="/admin/reports" className={styles.viewAll}>
              View All →
            </Link>
          </div>
          {recentReports.length > 0 ? (
            <div className={styles.recentList}>
              {recentReports.map((report) => (
                <div key={report.id} className={styles.recentItem}>
                  <Clock size={16} color="#718096" />
                  <div className={styles.recentItemContent}>
                    <p className={styles.recentItemText}>
                      {report.resource_name || "General Report"}
                    </p>
                    <p className={styles.recentItemMeta}>
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={styles.badge}>{report.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No pending reports</p>
          )}
        </div>

        <div className={styles.recentCard}>
          <div className={styles.recentHeader}>
            <h2>Recent Suggestions</h2>
            <Link to="/admin/suggestions" className={styles.viewAll}>
              View All →
            </Link>
          </div>
          {recentSuggestions.length > 0 ? (
            <div className={styles.recentList}>
              {recentSuggestions.map((suggestion) => (
                <div key={suggestion.id} className={styles.recentItem}>
                  <Clock size={16} color="#718096" />
                  <div className={styles.recentItemContent}>
                    <p className={styles.recentItemText}>{suggestion.name}</p>
                    <p className={styles.recentItemMeta}>
                      {new Date(suggestion.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={styles.badge}>{suggestion.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No pending suggestions</p>
          )}
        </div>
      </div>
    </div>
  );
}
