// app/components/Navbar.js
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="logo-container">
          <Link href="/" className="logo">
            <div className="logo-icon">
              {/* Only render Image on client side to prevent hydration mismatch */}
              {mounted && (
                <Image 
                  src="/globe.svg" 
                  alt="Halo logo" 
                  width={32} 
                  height={32}
                  style={{ 
                    filter: "invert(46%) sepia(82%) saturate(1539%) hue-rotate(210deg) brightness(96%) contrast(96%)" 
                  }}
                />
              )}
              {!mounted && <div style={{ width: 32, height: 32 }}></div>}
            </div>
            <span className="logo-text">Halo</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="nav-menu desktop-menu">
          <li className="nav-item">
            <Link href="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link href="/auth/signup" className="nav-link">Sign Up</Link>
          </li>
          <li className="nav-item">
            <Link href="/auth/login" className="nav-link login-link">Login</Link>
          </li>
        </ul>

        {/* Mobile Menu Toggle - Only shown when mounted */}
        {mounted && (
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        )}

        {/* Mobile Navigation - Only shown when mounted and menu is open */}
        {mounted && isMobileMenuOpen && (
          <ul className="nav-menu mobile-menu">
            <li className="nav-item">
              <Link 
                href="/" 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/auth/signup" 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/auth/login" 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;