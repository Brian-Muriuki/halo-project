'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CsrfContext = createContext();

export const useCsrf = () => useContext(CsrfContext);

export function CsrfProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  const fetchCsrfToken = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      setCsrfToken(data.csrfToken);
      
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch CSRF token on mount and when user changes
  useEffect(() => {
    fetchCsrfToken();
  }, [currentUser?.uid]);
  
  // Function to include CSRF token in requests
  const withCsrf = (data = {}) => {
    return {
      ...data,
      _csrf: csrfToken
    };
  };
  
  // Function to include CSRF token in headers
  const csrfHeader = () => {
    return {
      'X-CSRF-Token': csrfToken
    };
  };

  const value = {
    csrfToken,
    loading,
    refreshCsrfToken: fetchCsrfToken,
    withCsrf,
    csrfHeader
  };

  return (
    <CsrfContext.Provider value={value}>
      {children}
    </CsrfContext.Provider>
  );
}