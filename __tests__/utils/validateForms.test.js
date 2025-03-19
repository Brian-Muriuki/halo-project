/**
 * @jest-environment jsdom
 */

import { validateEmail, validatePassword, validateName, validateFormInputs } from '@/app/utils/validateForms';

describe('Form Validation Utilities', () => {
  describe('validateEmail', () => {
    test('should return true for valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('name.lastname@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    test('should return false for invalid email addresses', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('plaintext')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
      expect(validateEmail('spaces in@email.com')).toBe(false);
      expect(validateEmail('email@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should return true for valid passwords', () => {
      expect(validatePassword('Password1')).toBe(true);
      expect(validatePassword('securePass123')).toBe(true);
      expect(validatePassword('p@ssw0rd')).toBe(true);
    });

    test('should return false for passwords that are too short', () => {
      expect(validatePassword('Short1')).toBe(false);
      expect(validatePassword('abc12')).toBe(false);
    });

    test('should return false for passwords without letters', () => {
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('876543210')).toBe(false);
    });

    test('should return false for passwords without numbers', () => {
      expect(validatePassword('PasswordOnly')).toBe(false);
      expect(validatePassword('noNumbers')).toBe(false);
    });

    test('should return false for empty passwords', () => {
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validateName', () => {
    test('should return true for valid names', () => {
      expect(validateName('John Doe')).toBe(true);
      expect(validateName('Mary-Jane Smith')).toBe(true);
      expect(validateName('O\'Connor')).toBe(true);
    });

    test('should return false for empty names', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('   ')).toBe(false);
    });

    test('should return false for names with invalid characters', () => {
      expect(validateName('User123')).toBe(false);
      expect(validateName('John@Doe')).toBe(false);
    });
  });

  describe('validateFormInputs', () => {
    test('should validate login form inputs correctly', () => {
      const inputs = {
        email: 'user@example.com',
        password: 'Password123',
      };
      
      const result = validateFormInputs(inputs, 'login');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('should validate signup form inputs correctly', () => {
      const inputs = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };
      
      const result = validateFormInputs(inputs, 'signup');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    test('should return appropriate errors for invalid login inputs', () => {
      const inputs = {
        email: 'invalid-email',
        password: 'short',
      };
      
      const result = validateFormInputs(inputs, 'login');
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeTruthy();
      expect(result.errors.password).toBeTruthy();
    });

    test('should detect password mismatch in signup form', () => {
      const inputs = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      };
      
      const result = validateFormInputs(inputs, 'signup');
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBeTruthy();
    });

    test('should validate all fields in signup form', () => {
      const inputs = {
        name: '',
        email: 'invalid',
        password: 'weak',
        confirmPassword: 'different',
      };
      
      const result = validateFormInputs(inputs, 'signup');
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(4);
    });
  });
});
