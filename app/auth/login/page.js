// app/auth/login/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';  // Import the CSS module

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    // Reset previous errors
    setError('');
    
    // Check if fields are empty
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return false;
    }
    
    // Validate email format
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Basic password validation - just checking length for now
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Dynamically import firebase/auth
      const { signInWithEmailAndPassword, getAuth } = await import('firebase/auth');
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection');
      } else {
        setError(error.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your spiritual journey</p>
        
        {error && <div className="error-message" role="alert">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              disabled={loading}
              className={styles.focusVisible}  // Add this class
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              disabled={loading}
              minLength={6}
              className={styles.focusVisible}  // Add this class
            />
          </div>
          
          <button 
            type="submit"
            className={`auth-button ${styles.focusVisible}`}  // Add this class
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Don't have an account? <Link href="/auth/signup" className={styles.focusVisible}>Sign up</Link></p>
          <Link href="/auth/reset-password" className={`forgot-password ${styles.focusVisible}`}>Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
