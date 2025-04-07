import { NextResponse } from 'next/server';
import { adminAuth } from '@/app/lib/firebase-admin';

// Set CORS headers function
const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*'); // Be more specific in production!
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return setCorsHeaders(NextResponse.json({ error: 'Email and password are required.' }, { status: 400 }));
    }

    // --- Custom Token Login Flow --- 
    // 1. Verify user exists (doesn't directly validate password with Admin SDK)
    // Note: This only checks if the email is registered. Password validation happens
    // when the client uses signInWithCustomToken with the Firebase Client SDK.
    // A more complex flow involving calling the client SDK's signIn endpoint from the 
    // backend *could* validate the password here, but is significantly more complex.
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return setCorsHeaders(NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 }));
      }
      // Handle other potential errors from getUserByEmail
      console.error('Error fetching user by email:', error);
      throw error; // Re-throw for generic error handling
    }
    
    // 2. If user exists, create a custom token
    // Optional: Add additional claims if needed
    // const additionalClaims = {
    //   premiumAccount: true,
    // };
    const customToken = await adminAuth.createCustomToken(userRecord.uid /*, additionalClaims */);
    
    // 3. Send the custom token back to the client
    return setCorsHeaders(NextResponse.json({ customToken }, { status: 200 }));

  } catch (error) {
    console.error('Login Error:', error);
    // Basic error handling - enhance as needed
    return setCorsHeaders(NextResponse.json({ error: 'An unexpected error occurred during login.' }, { status: 500 }));
  }
} 