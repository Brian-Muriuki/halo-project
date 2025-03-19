// app/lib/rateLimiting.js

// In-memory store for login attempts
// In a production environment, consider using Redis or another distributed cache
const loginAttempts = new Map();

// Configuration
const MAX_FAILED_ATTEMPTS = 5; // Max number of failed attempts before lockout
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_RESET_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Record a failed login attempt for an IP
 * @param {string} ip - The IP address
 * @returns {Object} - Status of the rate limiting
 */
export const recordFailedLoginAttempt = (ip) => {
  const now = Date.now();
  
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, {
      attempts: 1,
      lastAttempt: now,
      lockedUntil: null
    });
    
    return {
      isLocked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - 1,
      lockedUntil: null
    };
  }
  
  const record = loginAttempts.get(ip);
  
  // Check if the lockout period has expired
  if (record.lockedUntil && now > record.lockedUntil) {
    // Reset if lockout period has expired
    loginAttempts.set(ip, {
      attempts: 1,
      lastAttempt: now,
      lockedUntil: null
    });
    
    return {
      isLocked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - 1,
      lockedUntil: null
    };
  }
  
  // Check if account is currently locked
  if (record.lockedUntil) {
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockedUntil: record.lockedUntil
    };
  }
  
  // Check if we should reset attempts due to time elapsed
  if (now - record.lastAttempt > ATTEMPT_RESET_TIME) {
    loginAttempts.set(ip, {
      attempts: 1,
      lastAttempt: now,
      lockedUntil: null
    });
    
    return {
      isLocked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS - 1,
      lockedUntil: null
    };
  }
  
  // Increment failed attempts
  const attempts = record.attempts + 1;
  
  // Determine if account should be locked
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_DURATION;
    
    loginAttempts.set(ip, {
      attempts,
      lastAttempt: now,
      lockedUntil
    });
    
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockedUntil
    };
  }
  
  // Update record
  loginAttempts.set(ip, {
    attempts,
    lastAttempt: now,
    lockedUntil: null
  });
  
  return {
    isLocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - attempts,
    lockedUntil: null
  };
};

/**
 * Check if an IP is currently locked out
 * @param {string} ip - The IP address
 * @returns {Object} - Status of the rate limiting
 */
export const checkLoginStatus = (ip) => {
  if (!loginAttempts.has(ip)) {
    return {
      isLocked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      lockedUntil: null
    };
  }
  
  const record = loginAttempts.get(ip);
  const now = Date.now();
  
  // Check if lockout has expired
  if (record.lockedUntil && now > record.lockedUntil) {
    loginAttempts.delete(ip);
    return {
      isLocked: false,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      lockedUntil: null
    };
  }
  
  return {
    isLocked: record.lockedUntil !== null,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.attempts,
    lockedUntil: record.lockedUntil
  };
};

/**
 * Reset login attempts for an IP (typically after successful login)
 * @param {string} ip - The IP address
 */
export const resetLoginAttempts = (ip) => {
  loginAttempts.delete(ip);
};

/**
 * Middleware function to check rate limiting for API routes
 * @param {Request} req - Next.js API request object
 * @param {Response} res - Next.js API response object
 * @returns {boolean} - true if request should proceed, false if rate limited
 */
export const rateLimitMiddleware = (req) => {
  const ip = req.headers['x-forwarded-for'] || 'unknown-ip';
  
  const status = checkLoginStatus(ip);
  
  if (status.isLocked) {
    const timeRemaining = Math.ceil((status.lockedUntil - Date.now()) / 1000 / 60);
    return {
      allowed: false,
      message: `Too many failed login attempts. Please try again in ${timeRemaining} minutes.`,
      timeRemaining
    };
  }
  
  return {
    allowed: true
  };
};
