// app/auth/signup/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';
import { validateSignup } from '@/app/utils/validateForms';
import FormFeedback from '@/app/components/FormFeedback';
import styles from '../auth.module.css';

/**
 * Signup Component - Handles new user registration
 * Implements accessibility features, form validation, and error handling
 */
const Signup = () => {
  // State for form inputs and UI state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [denomination, setDenomination] = useState('non-denominational');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  // Refs for accessibility and focus management
  const nameInputRef = useRef(null);
  const errorRef = useRef(null);
  
  // Hooks
  const router = useRouter();
  const { showToast } = useToast();

  // List of denominations for the dropdown
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

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/auth/csrf');
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
    
    // Focus the name input when component mounts for better user experience
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);
  
  // Focus on error message when errors are present for screen readers
  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorRef.current) {
      errorRef.current.focus();
    }
  }, [errors]);

  /**
   * Validates form input before submission
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = () => {
    // Clear previous errors
    setErrors({});
    
    const validationResult = validateSignup(name, email, password, confirmPassword);
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return false;
    }
    
    return true;
  };

  /**
   * Handles the signup submission process
   * Validates inputs, creates user in Firebase, and handles response
   * @param {Event} e - The form submission event
   */
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Dynamically import firebase
      const { createUserWithEmailAndPassword, getAuth, updateProfile } = await import('firebase/auth');
      const { doc, setDoc, getFirestore } = await import('firebase/firestore');
      
      const auth = getAuth();
      const db = getFirestore();
      
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
      
      // Show success message and notification
      setShowSuccess(true);
      showToast('Account created successfully!', 'success');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (error) {
      console.error('Signup error:', error.message);
      
      // Format user-friendly error messages
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setErrors({ general: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Create Account</h1>
        <p className={styles.authSubtitle}>Join Halo on your spiritual journey</p>
        
        {/* Accessible error summary for screen readers */}
        {Object.keys(errors).length > 0 && (
          <div 
            className={styles.errorMessage} 
            role="alert" 
            ref={errorRef}
            tabIndex={-1}
            aria-live="assertive"
          >
            {errors.general || 'Please correct the errors below:'}
            {!errors.general && (
              <ul className={styles.errorList}>
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {/* Success message when signup is successful */}
        {showSuccess && (
          <FormFeedback 
            type="success" 
            message="Account created successfully! Redirecting..." 
          />
        )}
        
        <form onSubmit={handleSignup} noValidate aria-label="Signup form">
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.inputLabel}>
              Full Name
              {errors.name && <span className="sr-only"> (Error: {errors.name})</span>}
            </label>
            <input
              id="name"
              ref={nameInputRef}
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-required="true"
              aria-invalid={errors.name ? "true" : "false"}
              aria-describedby={errors.name ? "name-error" : undefined}
              disabled={loading || showSuccess}
              className={errors.name ? styles.inputError : ''}
            />
            {errors.name && (
              <p id="name-error" className={styles.fieldError}>
                {errors.name}
              </p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email
              {errors.email && <span className="sr-only"> (Error: {errors.email})</span>}
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-required="true"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={loading || showSuccess}
              className={errors.email ? styles.inputError : ''}
            />
            {errors.email && (
              <p id="email-error" className={styles.fieldError}>
                {errors.email}
              </p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              Password
              {errors.password && <span className="sr-only"> (Error: {errors.password})</span>}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby="password-requirements password-error"
              disabled={loading || showSuccess}
              className={errors.password ? styles.inputError : ''}
              minLength={6}
            />
            <p id="password-requirements" className={styles.fieldHelp}>
              Must be at least 6 characters with letters and numbers
            </p>
            {errors.password && (
              <p id="password-error" className={styles.fieldError}>
                {errors.password}
              </p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.inputLabel}>
              Confirm Password
              {errors.confirmPassword && <span className="sr-only"> (Error: {errors.confirmPassword})</span>}
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-required="true"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              disabled={loading || showSuccess}
              className={errors.confirmPassword ? styles.inputError : ''}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className={styles.fieldError}>
                {errors.confirmPassword}
              </p>
            )}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="denomination" className={styles.inputLabel}>
              Faith Tradition (Optional)
            </label>
            <select
              id="denomination"
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              disabled={loading || showSuccess}
              aria-describedby="denomination-help"
            >
              {denominations.map((denom) => (
                <option key={denom} value={denom}>
                  {denom.charAt(0).toUpperCase() + denom.slice(1)}
                </option>
              ))}
            </select>
            <p id="denomination-help" className={styles.fieldHelp}>
              This helps us personalize your experience
            </p>
          </div>
          
          <button 
            type="submit"
            className={styles.authButton}
            disabled={loading || showSuccess}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className={styles.loadingSpinner} aria-hidden="true"></span>
                <span>Creating Account...</span>
              </>
            ) : 'Create Account'}
          </button>
        </form>
        
        <div className={styles.authLinks}>
          <p>Already have an account? <Link href="/auth/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;