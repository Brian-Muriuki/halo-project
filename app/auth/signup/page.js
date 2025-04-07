// app/auth/signup/page.js - Updated with better error handling
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Import firebase auth directly to check for initialization
import { getAuth } from 'firebase/auth';
import { app } from '@/app/lib/firebase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [denomination, setDenomination] = useState('non-denominational');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [firebaseInitialized, setFirebaseInitialized] = useState(true);
  const router = useRouter();

  // Check if Firebase is properly initialized on component mount
  useEffect(() => {
    try {
      // This will throw an error if Firebase is not initialized
      const auth = getAuth(app);
      setFirebaseInitialized(true);
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setFirebaseInitialized(false);
      setError('Firebase configuration error. Please contact support.');
    }
  }, []);

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

  const validateForm = () => {
    setError('');
    
    if (!firebaseInitialized) {
      setError('Firebase is not properly configured. Please contact support.');
      return false;
    }
    
    if (!name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordStrengthRegex.test(password)) {
      setError('Password must contain at least one letter and one number');
      return false;
    }
    
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
      
      if (!validateForm()) {
        setLoading(false);
        return;
      }
      
      if (!firebaseInitialized) {
        setError('Firebase is not properly configured. Please contact support.');
        setLoading(false);
        return;
      }

      // --- Call the backend API route --- 
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password,
          name,
          denomination 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from the backend
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      // --- Signup successful, now log the user in automatically --- 
      // Use the custom token approach for login after successful signup
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // Re-use email/password
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
         throw new Error(loginData.error || 'Failed to automatically log in after signup.');
      }
      
      // Dynamically import signInWithCustomToken
      const { signInWithCustomToken } = await import('firebase/auth');
      const auth = getAuth();
      await signInWithCustomToken(auth, loginData.customToken);
      
      // --- End auto-login --- 
      
      console.log('Signup and automatic login successful!', data);
      router.push('/'); // Redirect to home page after successful signup and login

    } catch (error) {
      console.error('Signup error:', error);
      // Display the error message from the backend or a generic one
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-900 to-indigo-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Image 
                  src="/globe.svg" 
                  alt="Halo logo" 
                  width={30} 
                  height={30}
                  style={{ 
                    filter: "invert(46%) sepia(82%) saturate(1539%) hue-rotate(210deg) brightness(96%) contrast(96%)" 
                  }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-blue-800 dark:text-blue-400">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join Halo on your spiritual journey</p>
          </div>
          
          {!firebaseInitialized && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 p-3 rounded-md mb-6" role="alert">
              <p className="font-medium">Firebase Configuration Error</p>
              <p className="text-sm mt-1">
                The application isn't properly connected to Firebase. This is likely a server configuration issue.
                Please contact support or check your environment variables.
              </p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md mb-6" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-required="true"
                disabled={loading || !firebaseInitialized}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                disabled={loading || !firebaseInitialized}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                disabled={loading || !firebaseInitialized}
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be at least 6 characters with letters and numbers
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-required="true"
                disabled={loading || !firebaseInitialized}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="denomination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Faith Tradition (Optional)
              </label>
              <select
                id="denomination"
                value={denomination}
                onChange={(e) => setDenomination(e.target.value)}
                disabled={loading || !firebaseInitialized}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {denominations.map((denom) => (
                  <option key={denom} value={denom}>
                    {denom.charAt(0).toUpperCase() + denom.slice(1)}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This helps us personalize your experience
              </p>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              disabled={loading || !firebaseInitialized}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;