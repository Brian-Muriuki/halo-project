// app/components/Navbar.js
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import { auth } from '@/app/lib/firebase';
import { signOut } from 'firebase/auth';
import styles from '@/app/styles/navbar.module.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentUser } = useAuth();
  
  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles['nav-container']}`}>
        <div className={styles['logo-container']}>
          <Link href="/" className={styles.logo}>
            <div className={styles['logo-icon']}>
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
            <span className={styles['logo-text']}>Halo</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className={`${styles['nav-menu']} ${styles['desktop-menu']}`}>
          <li className={styles['nav-item']}>
            <Link href="/" className={styles['nav-link']}>Home</Link>
          </li>
          {currentUser ? (
            <>
              <li className={styles['nav-item']}>
                <Link href="/profile" className={styles['nav-link']}>Profile</Link>
              </li>
              <li className={styles['nav-item']}>
                <button onClick={handleSignOut} className={`${styles['nav-link']} ${styles['logout-button']}`}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className={styles['nav-item']}>
                <Link href="/auth/signup" className={styles['nav-link']}>Sign Up</Link>
              </li>
              <li className={styles['nav-item']}>
                <Link href="/auth/login" className={`${styles['nav-link']} ${styles['login-link']}`}>Login</Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Toggle - Only shown when mounted */}
        {mounted && (
          <button 
            className={styles['mobile-menu-toggle']} 
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`${styles['hamburger-line']} ${isMobileMenuOpen ? styles.open : ''}`}></span>
            <span className={`${styles['hamburger-line']} ${isMobileMenuOpen ? styles.open : ''}`}></span>
            <span className={`${styles['hamburger-line']} ${isMobileMenuOpen ? styles.open : ''}`}></span>
          </button>
        )}

        {/* Mobile Navigation - Always render when mounted, but control visibility with CSS */}
        {mounted && (
          <ul className={`${styles['nav-menu']} ${styles['mobile-menu']} ${isMobileMenuOpen ? styles['mobile-menu-visible'] : styles['mobile-menu-hidden']}`}>
            <li className={styles['nav-item']}>
              <Link 
                href="/" 
                className={styles['nav-link']}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            {currentUser ? (
              <>
                <li className={styles['nav-item']}>
                  <Link 
                    href="/profile" 
                    className={styles['nav-link']}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </li>
                <li className={styles['nav-item']}>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }} 
                    className={`${styles['nav-link']} ${styles['logout-button']}`}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className={styles['nav-item']}>
                  <Link 
                    href="/auth/signup" 
                    className={styles['nav-link']}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </li>
                <li className={styles['nav-item']}>
                  <Link 
                    href="/auth/login" 
                    className={styles['nav-link']}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;