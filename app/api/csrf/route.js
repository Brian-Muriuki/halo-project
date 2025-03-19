// app/api/csrf/route.js
import { NextResponse } from 'next/server';
import { auth } from '@/app/lib/firebase';
import { generateToken } from '@/app/lib/csrf';

// Set CORS headers function
const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

/**
 * API endpoint to generate CSRF token
 * 
 * This route should be called before rendering forms that need CSRF protection
 */
export async function GET(request) {
  try {
    // Get current user
    const currentUser = auth.currentUser;
    
    // If no user is logged in, use session cookie or generate a temporary session ID
    const sessionId = currentUser?.uid || request.cookies.get('session-id')?.value || Math.random().toString(36).substring(2);
    
    // Generate CSRF token
    const token = generateToken(sessionId);
    
    // Create the response
    const response = NextResponse.json({
      csrfToken: token
    });
    
    // Set CSRF token cookie
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 30, // 30 minutes
    });
    
    // If no session ID exists, set a temporary one
    if (!request.cookies.get('session-id') && !currentUser) {
      response.cookies.set('session-id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 30, // 30 minutes
      });
    }
    
    return setCorsHeaders(response);
    
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Failed to generate CSRF token' },
        { status: 500 }
      )
    );
  }
}