// app/auth/login/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Validation
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      
      // Dynamically import firebase/auth
      const { signInWithEmailAndPassword, getAuth } = await import('firebase/auth');
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful!');
      router.push('/');
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your spiritual journey</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          />
        </div>
        
        <button 
          className="auth-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <div className="auth-links">
          <p>Don't have an account? <a href="/auth/signup">Sign up</a></p>
          <a href="#" className="forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;