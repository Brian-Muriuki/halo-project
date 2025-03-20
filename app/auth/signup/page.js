// app/auth/signup/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';  // Import the CSS module

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [denomination, setDenomination] = useState('non-denominational');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Rest of the existing code remains the same...

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Halo on your spiritual journey</p>
        
        {error && <div className="error-message" role="alert">{error}</div>}
        
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              aria-required="true"
              disabled={loading}
              className={styles.focusVisible}  // Add this class
            />
          </div>
          
          {/* Rest of your existing input fields, each can have the styles.focusVisible class */}
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

          {/* Similar for other inputs */}
          
          <button 
            type="submit"
            className={`auth-button ${styles.focusVisible}`}  // Add to button as well
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <Link href="/auth/login" className={styles.focusVisible}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
