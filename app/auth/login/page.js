// app/auth/login/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/app/context/ToastContext';
import { validateLogin } from '@/app/utils/validateForms';
import FormFeedback from '@/app/components/FormFeedback';
import styles from '../auth.module.css';

/**
 * Login Component - Handles user authentication via email and password
 * Implements accessibility features, form validation, and error handling
 */
const Login = () => {
  // State for form inputs and UI state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  // Refs for accessibility and focus management
  const emailInputRef = useRef(null);
  const errorRef = useRef(null);
  
  // Hooks
  const router = useRouter();
  const { showToast } = useToast();

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
    
    // Focus the email input when component mounts for better user experience
    if (emailInputRef.current) {
      emailInputRef.current.focus();
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
    
    const validationResult = validateLogin(email, password);
    
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return false;
    }
    
    return true;
  };

  /**
   * Handles the login submission process
   * Validates inputs, makes API request, and handles the response
   * @param {Event} e - The form submission event
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the login API endpoint with CSRF protection
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Show success feedback before redirecting
      setShowSuccess(true);
      showToast('Login successful!', 'success');
      
      // Redirect to home page after a short delay to show success message
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Format user-friendly error message
      let errorMessage = 'Failed to login. Please try again.';
      
      if (error.message === 'Invalid credentials') {
        errorMessage = 'Invalid email or password';
      } else if (error.message === 'Too many attempts') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      } else if (error.message === 'Network error') {
        errorMessage = 'Network error. Please check your connection';
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
        <h1 className={styles.authTitle}>Welcome Back</h1>
        <p className={styles.authSubtitle}>Sign in to continue your spiritual journey</p>
        
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
        
        {/* Success message when login is successful */}
        {showSuccess && (
          <FormFeedback 
            type="success" 
            message="Login successful! Redirecting..." 
          />
        )}
        
        <form onSubmit={handleLogin} noValidate aria-label="Login form">
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              Email
              {errors.email && <span className="sr-only"> (Error: {errors.email})</span>}
            </label>
            <input
              id="email"
              ref={emailInputRef}
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
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={loading || showSuccess}
              className={errors.password ? styles.inputError : ''}
              minLength={6}
            />
            {errors.password && (
              <p id="password-error" className={styles.fieldError}>
                {errors.password}
              </p>
            )}
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
                <span>Signing in...</span>
              </>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className={styles.authLinks}>
          <p>Don't have an account? <Link href="/auth/signup">Sign up</Link></p>
          <Link href="/auth/reset-password" className={styles.forgotPassword}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;