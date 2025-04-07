import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/app/lib/firebase-admin';

// Basic email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Input validation function
const validateInput = (email, password, name) => {
  if (!email || !password || !name) {
    return 'Email, password, and name are required.';
  }
  if (!emailRegex.test(email)) {
    return 'Invalid email format.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null; // Validation passed
};

// Set CORS headers function (adjust origin as needed for production)
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
    const { email, password, name, denomination } = body;

    // Validate inputs
    const validationError = validateInput(email, password, name);
    if (validationError) {
      return setCorsHeaders(NextResponse.json({ error: validationError }, { status: 400 }));
    }

    // 1. Create Firebase Auth user
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: name,
      // Email verification can be handled client-side after login if desired
    });

    // 2. Create Firestore user profile document
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: name,
      denomination: denomination || 'non-denominational', // Default value
      createdAt: new Date().toISOString(),
    };
    await adminDb.collection('users').doc(userRecord.uid).set(userProfile);

    console.log('Successfully created new user:', userRecord.uid);

    // Respond with success (don't send back sensitive info)
    return setCorsHeaders(NextResponse.json({ uid: userRecord.uid, email: userRecord.email }, { status: 201 }));

  } catch (error) {
    console.error('Signup Error:', error);
    let errorMessage = 'An unexpected error occurred during signup.';
    let statusCode = 500;

    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'This email address is already in use.';
      statusCode = 409; // Conflict
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = 'Password must be at least 6 characters long.';
      statusCode = 400;
    }
    // Add more specific Firebase Admin SDK error handling as needed

    return setCorsHeaders(NextResponse.json({ error: errorMessage }, { status: statusCode }));
  }
} 