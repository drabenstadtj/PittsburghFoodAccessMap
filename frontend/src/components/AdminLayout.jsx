import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, PlusCircle, Database, LogOut, Home, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={styles.layout}>
      {isMobileMenuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <button
        className={styles.mobileMenuToggle}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <img 
            src="/PPI_Logo_white.svg" 
            alt="Admin Panel" 
            className={styles.logoImage}
          />
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
              onClick={handleNavClick}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.bottomActions}>
          <Link to="/" className={styles.homeButton} onClick={handleNavClick}>
            <Home size={20} />
            <span>Back to Map</span>
          </Link>
          <button onClick={() => { logout(); handleNavClick(); }} className={styles.logoutButton}>
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