/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/app/context/ToastContext';
import Login from '@/app/auth/login/page';
import Signup from '@/app/auth/signup/page';

// Mock Firebase and other dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/app/context/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('firebase/auth', () => {
  return {
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    getAuth: jest.fn().mockReturnValue({}),
    updateProfile: jest.fn().mockResolvedValue({}),
  };
});

jest.mock('firebase/firestore', () => {
  return {
    doc: jest.fn(),
    setDoc: jest.fn().mockResolvedValue({}),
    getFirestore: jest.fn().mockReturnValue({}),
  };
});

describe('Authentication Forms Integration Tests', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockAuthContext = {
    currentUser: null,
  };
  
  const mockToast = {
    showToast: jest.fn(),
  };
  
  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue(mockAuthContext);
    useToast.mockReturnValue(mockToast);
    jest.clearAllMocks();
  });
  
  describe('Login Form Integration', () => {
    beforeEach(() => {
      render(<Login />);
    });
    
    test('should show validation errors on submit with empty fields', async () => {
      // Get the submit button and click it
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      // Wait for validation messages to appear
      await waitFor(() => {
        expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
      });
    });
    
    test('should show validation error for invalid email format', async () => {
      // Fill in invalid email
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      // Check for validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });
    
    test('should attempt to sign in with valid inputs', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockResolvedValueOnce({ user: {} });
      
      // Fill in valid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      // Wait for sign in to be called
      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'user@example.com',
          'Password123'
        );
      });
      
      // Check that router.push was called to redirect after login
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
    
    test('should handle auth error properly', async () => {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/wrong-password' });
      
      // Fill in credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'WrongPassword123' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      // Check for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Signup Form Integration', () => {
    beforeEach(() => {
      render(<Signup />);
    });
    
    test('should show validation errors for empty fields', async () => {
      // Submit the form without filling anything
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      // Check for name validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter your name/i)).toBeInTheDocument();
      });
    });
    
    test('should show error when passwords do not match', async () => {
      // Fill in the form with mismatched passwords
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      // Check for password mismatch error
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
    
    test('should attempt to create account with valid inputs', async () => {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      const { setDoc } = require('firebase/firestore');
      
      const mockUser = { uid: 'test-uid' };
      createUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });
      
      // Fill in valid inputs
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      // Check that account creation was attempted
      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'john@example.com',
          'Password123'
        );
        expect(setDoc).toHaveBeenCalled();
      });
      
      // Check for redirection
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
    
    test('should handle existing email error', async () => {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
      
      // Fill in form with an existing email
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      // Check for existing email error
      await waitFor(() => {
        expect(screen.getByText(/this email address is already in use/i)).toBeInTheDocument();
      });
    });
  });
});
