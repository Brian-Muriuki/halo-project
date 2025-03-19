// app/auth/login/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // Email validation regex - more comprehensive
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Real-time validation as user types
  useEffect(() => {
    if (formTouched) {
      validateField('email', email);
      validateField('password', password);
    }
  }, [email, password, formTouched]);

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
      
      // Use the imported auth instance and signInWithEmailAndPassword function
      await signInWithEmailAndPassword(auth, email, password);
      
      // Show success feedback
      setFormSuccess(true);
      showSuccess('Login successful! Redirecting...');
      
      // Delay redirect for toast visibility
      setTimeout(() => {
        router.push('/');
      }, 1500);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
        showError('Login failed: Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later');
        showError('Login failed: Too many attempts');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection');
        showError('Login failed: Network error');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid login credentials. Please check your email and password');
        showError('Login failed: Invalid credentials');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support');
        showError('Login failed: Account disabled');
      } else {
        setError(error.message || 'Failed to login. Please try again.');
        showError('Login failed. Please try again.');
      }
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
              disabled={loading}
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
              disabled={loading}
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
            disabled={loading || (formTouched && (!!fieldErrors.email || !!fieldErrors.password))}
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