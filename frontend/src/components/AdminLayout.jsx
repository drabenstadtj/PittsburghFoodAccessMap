import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, PlusCircle, Database, LogOut, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/reports', icon: AlertCircle, label: 'Reports' },
    { path: '/admin/suggestions', icon: PlusCircle, label: 'Suggestions' },
    { path: '/admin/resources', icon: Database, label: 'Resources' },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h1>Admin Panel</h1>
          <p>{user?.name}</p>
        </div>
        
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${
                isActive(item.path, item.exact) ? styles.navItemActive : ''
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.bottomActions}>
          <Link to="/" className={styles.homeButton}>
            <Home size={20} />
            <span>Back to Map</span>
          </Link>
          <button onClick={logout} className={styles.logoutButton}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}