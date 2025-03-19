// app/auth/login/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/styles/auth.module.css';
import { useToast } from '@/app/context/ToastContext';
import FormFeedback from '@/app/components/FormFeedback';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [lockoutTime, setLockoutTime] = useState(null);
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useToast();

  // Email validation regex - more comprehensive
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Real-time validation as user types
  useEffect(() => {
    if (formTouched) {
      validateField('email', email);
      validateField('password', password);
    }
  }, [email, password, formTouched]);

  // Show remaining attempts warning if applicable
  useEffect(() => {
    if (remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts <= 3) {
      showWarning(`${remainingAttempts} login ${remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining`, 5000);
    }
  }, [remainingAttempts, showWarning]);

  const validateField = (field, value) => {
    let newFieldErrors = { ...fieldErrors };
    
    switch (field) {
      case 'email':
        if (!value.trim()) {
          newFieldErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newFieldErrors.email = 'Please enter a valid email address';
        } else {
          newFieldErrors.email = '';
        }
        break;
      case 'password':
        if (!value.trim()) {
          newFieldErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newFieldErrors.password = 'Password must be at least 6 characters';
        } else {
          newFieldErrors.password = '';
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(newFieldErrors);
    return !newFieldErrors[field]; // Return true if valid
  };

  const validateForm = () => {
    // Check if account is locked
    if (lockoutTime && new Date(lockoutTime) > new Date()) {
      const minutesLeft = Math.round((new Date(lockoutTime) - new Date()) / 1000 / 60);
      setError(`Too many failed login attempts. Please try again in ${minutesLeft} minutes.`);
      return false;
    }
    
    // Reset previous errors
    setError('');
    setFormSuccess(false);
    
    // Validate all fields
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    
    return isEmailValid && isPasswordValid;
  };

  const handleFieldChange = (field, value) => {
    if (!formTouched) {
      setFormTouched(true);
    }
    
    // Clear success state when form is edited
    if (formSuccess) {
      setFormSuccess(false);
    }
    
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Use our API route with rate limiting
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle API errors
        if (response.status === 429) {
          // Rate limit exceeded
          setLockoutTime(data.lockedUntil);
          showError(data.error);
        } else if (response.status === 401) {
          // Invalid credentials
          setRemainingAttempts(data.remainingAttempts);
          showError(data.error);
        } else {
          // Other errors
          showError(data.error || 'An error occurred during login');
        }
        
        setError(data.error || 'Failed to login. Please try again.');
        return;
      }
      
      // Show success feedback
      setFormSuccess(true);
      showSuccess('Login successful! Redirecting...');
      
      // Delay redirect for toast visibility
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
      showError('Login failed: Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['auth-container']}>
      <div className={styles['auth-card']}>
        <h1 className={styles['auth-title']}>Welcome Back</h1>
        <p className={styles['auth-subtitle']}>Sign in to continue your spiritual journey</p>
        
        <FormFeedback 
          isSuccess={formSuccess} 
          isError={!!error} 
          successMessage="Login successful! Redirecting..." 
          errorMessage={error}
        />
        
        {lockoutTime && new Date(lockoutTime) > new Date() && (
          <div className={styles['lockout-message']}>
            <p>Your account is temporarily locked due to too many failed login attempts.</p>
            <p>Please try again in {Math.round((new Date(lockoutTime) - new Date()) / 1000 / 60)} minutes.</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} noValidate>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => validateField('email', email)}
              required
              aria-required="true"
              disabled={loading || (lockoutTime && new Date(lockoutTime) > new Date())}
              className={fieldErrors.email ? 'input-error' : ''}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email && (
              <div className="field-error-message" id="email-error" role="alert">
                {fieldErrors.email}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              onBlur={() => validateField('password', password)}
              required
              aria-required="true"
              disabled={loading || (lockoutTime && new Date(lockoutTime) > new Date())}
              minLength={6}
              className={fieldErrors.password ? 'input-error' : ''}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            {fieldErrors.password && (
              <div className="field-error-message" id="password-error" role="alert">
                {fieldErrors.password}
              </div>
            )}
          </div>
          
          <button 
            type="submit"
            className={`${styles['auth-button']} ${formSuccess ? styles['auth-button-success'] : ''}`}
            disabled={
              loading || 
              (formTouched && (!!fieldErrors.email || !!fieldErrors.password)) ||
              (lockoutTime && new Date(lockoutTime) > new Date())
            }
          >
            {loading ? 'Signing in...' : formSuccess ? 'Success!' : 'Sign In'}
          </button>
        </form>
        
        <div className={styles['auth-links']}>
          <p>Don't have an account? <Link href="/auth/signup">Sign up</Link></p>
          <Link href="/auth/reset-password" className={styles['forgot-password']}>Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;