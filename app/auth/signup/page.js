// app/auth/signup/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/app/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [denomination, setDenomination] = useState('non-denominational');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const denominations = [
    'non-denominational',
    'catholic',
    'protestant',
    'orthodox',
    'baptist',
    'methodist',
    'presbyterian',
    'lutheran',
    'anglican',
    'pentecostal',
    'evangelical',
    'adventist',
    'charismatic',
    'other'
  ];

  // Improved validation function
  const validateForm = () => {
    // Reset error
    setError('');
    
    // Name validation
    if (!name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Password strength check
    const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordStrengthRegex.test(password)) {
      setError('Password must contain at least one letter and one number');
      return false;
    }
    
    // Confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with name
      await updateProfile(user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        denomination,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        preferences: {
          notifications: true,
          dailyVerse: true,
          prayerReminders: true
        }
      });
      
      console.log('Signup successful!');
      router.push('/');
    } catch (error) {
      console.error('Signup error:', error.message);
      
      // Friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        setError('This email address is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Please choose a stronger password');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
            />
          </div>
          
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
            />
            <small>Must be at least 6 characters with letters and numbers</small>
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-required="true"
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="denomination">Faith Tradition (Optional)</label>
            <select
              id="denomination"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              disabled={loading}
            >
              {denominations.map((denom) => (
                <option key={denom} value={denom}>
                  {denom.charAt(0).toUpperCase() + denom.slice(1)}
                </option>
              ))}
            </select>
            <small>This helps us personalize your experience</small>
          </div>
          
          <button 
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <Link href="/auth/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;