// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { 
  rateLimitMiddleware, 
  recordFailedLoginAttempt, 
  resetLoginAttempts 
} from '@/app/lib/rateLimiting';

// Set CORS headers function
const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  return response;
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function POST(request) {
  try {
    // Check rate limiting first
    const rateLimit = rateLimitMiddleware(request);
    if (!rateLimit.allowed) {
      return setCorsHeaders(
        NextResponse.json(
          { error: rateLimit.message },
          { status: 429 }
        )
      );
    }

    // Get request body
    const { email, password } = await request.json();
    
    // Validate inputs
    if (!email || !password) {
      return setCorsHeaders(
        NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      );
    }
    
    try {
      // Attempt to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Reset login attempts on success
      const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
      resetLoginAttempts(ip);
      
      // Return user data (excluding sensitive info)
      return setCorsHeaders(
        NextResponse.json({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          success: true,
        })
      );
    } catch (error) {
      // Record failed login attempt
      const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
      const attemptStatus = recordFailedLoginAttempt(ip);
      
      // Determine error message
      let errorMessage = 'Invalid email or password';
      let statusCode = 401;
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          statusCode = 429;
          break;
        default:
          errorMessage = 'An error occurred during login';
          statusCode = 500;
      }
      
      // Add attempts remaining info to the response
      if (attemptStatus.remainingAttempts > 0) {
        errorMessage += ` (${attemptStatus.remainingAttempts} attempts remaining)`;
      } else if (attemptStatus.isLocked) {
        const minutesLeft = Math.ceil((attemptStatus.lockedUntil - Date.now()) / 1000 / 60);
        errorMessage = `Too many failed login attempts. Please try again in ${minutesLeft} minutes.`;
        statusCode = 429;
      }
      
      return setCorsHeaders(
        NextResponse.json(
          { 
            error: errorMessage,
            remainingAttempts: attemptStatus.remainingAttempts,
            isLocked: attemptStatus.isLocked,
            lockedUntil: attemptStatus.lockedUntil
          },
          { status: statusCode }
        )
      );
    }
  } catch (error) {
    console.error('Server error during login:', error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    );
  }
}