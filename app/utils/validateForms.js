/**
 * Form validation utility functions for the Halo application
 * 
 * This module provides a set of functions for validating user inputs in login and signup forms.
 * Each function performs a specific validation and returns a boolean result.
 * The main validateFormInputs function handles the complete validation of a form.
 */

/**
 * Validates an email address using a regular expression pattern
 * 
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid, false otherwise
 */
export const validateEmail = (email) => {
  // Regular expression to check for a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password against security requirements
 * Password must be at least 6 characters and contain both letters and numbers
 * 
 * @param {string} password - The password to validate
 * @returns {boolean} True if the password meets requirements, false otherwise
 */
export const validatePassword = (password) => {
  // Check for minimum length of 6 characters
  if (password.length < 6) {
    return false;
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLetter && hasNumber;
};

/**
 * Validates a user's name
 * 
 * @param {string} name - The name to validate
 * @returns {boolean} True if the name is valid, false otherwise
 */
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return false;
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes in names
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name);
};

/**
 * Validates a complete form submission based on form type
 * 
 * @param {Object} inputs - Object containing the form inputs
 * @param {string} formType - Type of form ('login' or 'signup')
 * @returns {Object} Object with validation result and any errors
 */
export const validateFormInputs = (inputs, formType) => {
  const errors = {};
  
  // Validate email for both login and signup forms
  if (!validateEmail(inputs.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Validate password for both login and signup forms
  if (!validatePassword(inputs.password)) {
    errors.password = 'Password must be at least 6 characters and contain both letters and numbers';
  }
  
  // Additional validations for signup form
  if (formType === 'signup') {
    // Validate name
    if (!validateName(inputs.name)) {
      errors.name = 'Please enter a valid name';
    }
    
    // Validate password confirmation
    if (inputs.password !== inputs.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // If denomination is required, add validation here
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Specialized validation for login form
 * 
 * @param {string} email - The email input
 * @param {string} password - The password input
 * @returns {Object} Object with validation result and any errors
 */
export const validateLogin = (email, password) => {
  return validateFormInputs({ email, password }, 'login');
};

/**
 * Specialized validation for signup form
 * 
 * @param {string} name - The name input
 * @param {string} email - The email input
 * @param {string} password - The password input
 * @param {string} confirmPassword - The password confirmation input
 * @returns {Object} Object with validation result and any errors
 */
export const validateSignup = (name, email, password, confirmPassword) => {
  return validateFormInputs({ name, email, password, confirmPassword }, 'signup');
};
