// app/lib/csrf.js
import crypto from 'crypto';

/**
 * CSRF Protection Utility
 * 
 * This module provides functions for generating and validating CSRF tokens
 * to protect against Cross-Site Request Forgery attacks.
 */

// Secret key for signing tokens - in production, use environment variable
const SECRET_KEY = process.env.CSRF_SECRET || 'halo-secret-key-change-in-production';

// Token expiration time (30 minutes in milliseconds)
const TOKEN_EXPIRY = 30 * 60 * 1000;

/**
 * Generate a CSRF token
 * Token format: timestamp:random-data:signature
 * 
 * @param {string} sessionId - The user's session ID
 * @returns {string} - CSRF token
 */
export const generateToken = (sessionId) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const data = `${timestamp}:${randomString}:${sessionId}`;
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(data)
    .digest('hex');
  
  return `${timestamp}:${randomString}:${signature}`;
};

/**
 * Validate a CSRF token
 * 
 * @param {string} token - CSRF token to validate
 * @param {string} sessionId - The user's session ID
 * @returns {boolean} - True if token is valid, false otherwise
 */
export const validateToken = (token, sessionId) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split(':');
  if (parts.length !== 3) {
    return false;
  }
  
  const [timestamp, randomString, signature] = parts;
  
  // Check if token has expired
  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime) || Date.now() - tokenTime > TOKEN_EXPIRY) {
    return false;
  }
  
  // Recreate the signature to verify
  const data = `${timestamp}:${randomString}:${sessionId}`;
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(data)
    .digest('hex');
  
  // Timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

/**
 * Set CSRF token as a cookie 
 * 
 * @param {Response} response - Next.js response object
 * @param {string} token - The CSRF token
 */
export const setCsrfCookie = (response, token) => {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = 'strict';
  
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: TOKEN_EXPIRY / 1000  // In seconds
  });
};

/**
 * Middleware to check CSRF token on POST/PUT/DELETE requests
 * 
 * @param {Request} req - The request object
 * @param {Response} res - The response object 
 * @param {string} sessionId - The user's session ID
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const csrfMiddleware = (req, sessionId) => {
  // Skip CSRF validation for GET/HEAD/OPTIONS requests
  const safeMethod = /^(GET|HEAD|OPTIONS)$/i.test(req.method);
  if (safeMethod) {
    return { valid: true };
  }
  
  // Get the token from header or request body
  const headerToken = req.headers.get('x-csrf-token');
  const bodyToken = req.headers.get('content-type')?.includes('application/json') 
    ? JSON.parse(req.body || '{}')._csrf 
    : undefined;
  
  const token = headerToken || bodyToken;
  
  if (!token) {
    return {
      valid: false,
      error: 'CSRF token missing'
    };
  }
  
  const isValid = validateToken(token, sessionId);
  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid CSRF token'
    };
  }
  
  return { valid: true };
};

/**
 * Generate a csrf token and attach it to page props
 * Used in getServerSideProps in Next.js pages
 */
export const attachCsrfToken = (sessionId) => {
  return {
    csrfToken: generateToken(sessionId),
  };
};