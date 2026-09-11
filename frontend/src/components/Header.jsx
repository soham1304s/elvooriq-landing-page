import React, { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isLandingPage = location.pathname === '/';

  return (
    <header className="header">
      <div className="header-container container">

        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logoImg} alt="ELVOORIQ Logo" className="logo-img" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <Link to="/company/about">About</Link>
          <Link to="/services/creator-management">Services</Link>
          <Link to="/company/creator-stories">Creators</Link>
          <Link to="/workspace-portal">Agent Portal</Link>
          <Link to="/admin-panel">HR Admin</Link>
          <Link to="/company/contact">Contact</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="header-actions">
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Ivory & Gold Light Theme' : 'Switch to Luxury Dark Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={19} className="theme-toggle-icon sun-icon" />
            ) : (
              <Moon size={19} className="theme-toggle-icon moon-icon" />
            )}
          </button>

          <Link to="/login" className="btn-text" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Enterprise Portals
          </Link>
          <Link to="/register" className="btn-primary">Become a Creator</Link>
        </div>

        {/* Mobile Header Controls */}
        <div className="mobile-header-controls">
          <button 
            className="theme-toggle-btn mobile-theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="theme-toggle-icon sun-icon" />
            ) : (
              <Moon size={18} className="theme-toggle-icon moon-icon" />
            )}
          </button>

          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle navigation menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`mobile-dropdown ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-nav-links">
            <Link to="/company/about" onClick={toggleMenu}>About</Link>
            <Link to="/services/creator-management" onClick={toggleMenu}>Services</Link>
            <Link to="/company/creator-stories" onClick={toggleMenu}>Creators</Link>
            <Link to="/company/blog" onClick={toggleMenu}>Blog</Link>
            <Link to="/company/contact" onClick={toggleMenu}>Contact</Link>
            <div className="mobile-nav-actions">
              {isLandingPage && (
                <Link to="/company/contact?subject=Brand%20Partnership%20Inquiry" className="btn-text" onClick={toggleMenu} style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  Partner With Us
                </Link>
              )}
              <Link to="/login" className="btn-primary" onClick={toggleMenu}>Become a Creator</Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
