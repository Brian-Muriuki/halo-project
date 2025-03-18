// app/auth/signup/page.js
'use client';

import React, { useState, useEffect } from 'react';
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
  const [formTouched, setFormTouched] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
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

  // Email validation regex - more comprehensive
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Name validation regex - allows letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;

  // Real-time validation as user types
  useEffect(() => {
    if (formTouched) {
      validateField('name', name);
      validateField('email', email);
      validateField('password', password);
      validateField('confirmPassword', confirmPassword);
    }
  }, [name, email, password, confirmPassword, formTouched]);

  // Check password strength
  useEffect(() => {
    if (password) {
      const hasLowercase = /[a-z]/.test(password);
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
      const isLongEnough = password.length >= 8;
      
      const strengthScore = [hasLowercase, hasUppercase, hasNumber, hasSpecialChar, isLongEnough]
        .filter(Boolean).length;
      
      if (strengthScore <= 2) {
        setPasswordStrength('weak');
      } else if (strengthScore === 3) {
        setPasswordStrength('fair');
      } else if (strengthScore === 4) {
        setPasswordStrength('good');
      } else {
        setPasswordStrength('strong');
      }
    } else {
      setPasswordStrength('');
    }
  }, [password]);

  const validateField = (field, value) => {
    let newFieldErrors = { ...fieldErrors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          newFieldErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newFieldErrors.name = 'Name must be at least 2 characters';
        } else if (!nameRegex.test(value)) {
          newFieldErrors.name = 'Name contains invalid characters';
        } else if (value.trim().length > 50) {
          newFieldErrors.name = 'Name must be less than 50 characters';
        } else {
          newFieldErrors.name = '';
        }
        break;
        
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
        if (!value) {
          newFieldErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newFieldErrors.password = 'Password must be at least 6 characters';
        } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
          newFieldErrors.password = 'Password must contain at least one letter and one number';
        } else {
          newFieldErrors.password = '';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newFieldErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== password) {
          newFieldErrors.confirmPassword = 'Passwords do not match';
        } else {
          newFieldErrors.confirmPassword = '';
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(newFieldErrors);
    return !newFieldErrors[field]; // Return true if valid
  };

  // Improved validation function
  const validateForm = () => {
    // Reset error
    setError('');
    
    // Validate all fields at once
    const isNameValid = validateField('name', name);
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);
    
    return isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
  };

  const handleFieldChange = (field, value) => {
    if (!formTouched) {
      setFormTouched(true);
    }
    
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'denomination':
        setDenomination(value);
        break;
      default:
        break;
    }
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
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Account creation is temporarily disabled. Please try again later.');
      } else {
        setError(error.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Weak - Add uppercase, numbers, or symbols';
      case 'fair':
        return 'Fair - Add more variety or length';
      case 'good':
        return 'Good - Almost there!';
      case 'strong':
        return 'Strong - Excellent password!';
      default:
        return '';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Halo on your spiritual journey</p>
        
        {error && <div className="error-message" role="alert">{error}</div>}
        
        <form onSubmit={handleSignup} noValidate>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => validateField('name', name)}
              required
              aria-required="true"
              disabled={loading}
              className={fieldErrors.name ? 'input-error' : ''}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              maxLength={50}
            />
            {fieldErrors.name && (
              <div className="field-error-message" id="name-error" role="alert">
                {fieldErrors.name}
              </div>
            )}
          </div>
          
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
              className={fieldErrors.password ? 'input-error' : (passwordStrength === 'good' || passwordStrength === 'strong' ? 'input-success' : '')}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            {fieldErrors.password && (
              <div className="field-error-message" id="password-error" role="alert">
                {fieldErrors.password}
              </div>
            )}
            {password && !fieldErrors.password && (
              <>
                <div className="password-strength-meter">
                  <div className={`strength-${passwordStrength}`}></div>
                </div>
                <small>{getPasswordStrengthLabel()}</small>
              </>
            )}
            {!password && (
              <small>Must be at least 6 characters with letters and numbers</small>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
              required
              aria-required="true"
              disabled={loading}
              className={fieldErrors.confirmPassword ? 'input-error' : (confirmPassword && !fieldErrors.confirmPassword ? 'input-success' : '')}
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
            />
            {fieldErrors.confirmPassword && (
              <div className="field-error-message" id="confirm-password-error" role="alert">
                {fieldErrors.confirmPassword}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="denomination">Faith Tradition (Optional)</label>
            <select
              id="denomination"
              value={denomination}
              onChange={(e) => handleFieldChange('denomination', e.target.value)}
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
            disabled={loading || (formTouched && (!!fieldErrors.name || !!fieldErrors.email || !!fieldErrors.password || !!fieldErrors.confirmPassword))}
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