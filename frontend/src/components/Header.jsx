import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          <img src={logoImg} alt="ELVOORIQ Logo" style={{ height: '64px' }} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <Link to="/company/about">About</Link>
          <Link to="/services/creator-management">Services</Link>
          <Link to="/company/creator-stories">Creators</Link>
          <Link to="/company/blog">Blog</Link>
          <Link to="/company/contact">Contact</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="header-actions">
          {isLandingPage && (
            <Link to="/company/contact?subject=Brand%20Partnership%20Inquiry" className="btn-text">
              Partner With Us
            </Link>
          )}
          <Link to="/login" className="btn-primary">Become a Creator</Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {mobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </button>
        
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
