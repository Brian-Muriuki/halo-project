// app/auth/login/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
  const router = useRouter();

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
    
    // Validate all fields
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    
    return isEmailValid && isPasswordValid;
  };

  const handleFieldChange = (field, value) => {
    if (!formTouched) {
      setFormTouched(true);
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
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid login credentials. Please check your email and password');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support');
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
            className="auth-button"
            disabled={loading || (formTouched && (!!fieldErrors.email || !!fieldErrors.password))}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Don't have an account? <Link href="/auth/signup">Sign up</Link></p>
          <Link href="/auth/reset-password" className="forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;