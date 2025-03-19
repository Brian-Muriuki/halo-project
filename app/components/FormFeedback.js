// app/components/FormFeedback.js
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * FormFeedback Component - Provides visual feedback after form submission
 * 
 * This component displays success or error messages with appropriate styling and
 * accessibility attributes. It automatically focuses for screen reader announcement
 * and can optionally auto-dismiss after a specified duration.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.type - Feedback type ('success' or 'error')
 * @param {string} props.message - The message to display
 * @param {number} [props.autoDismiss] - Optional duration in ms before auto-dismissing
 * @param {Function} [props.onDismiss] - Optional callback when dismissed
 * @returns {JSX.Element} The feedback component
 */
const FormFeedback = ({ type, message, autoDismiss, onDismiss }) => {
  const feedbackRef = useRef(null);
  
  // Focus the element when it appears for screen reader announcement
  useEffect(() => {
    if (feedbackRef.current) {
      feedbackRef.current.focus();
    }
    
    // Auto-dismiss if duration is provided
    let timer;
    if (autoDismiss && onDismiss) {
      timer = setTimeout(() => {
        onDismiss();
      }, autoDismiss);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoDismiss, onDismiss]);
  
  // Define styles based on feedback type
  const baseStyles = {
    padding: '1rem',
    marginBottom: '1.5rem',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    outline: 'none',
  };
  
  const typeStyles = {
    success: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderLeft: '4px solid #10b981',
      color: '#065f46',
    },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderLeft: '4px solid #ef4444',
      color: '#b91c1c',
    },
  };
  
  // Combine styles
  const styles = {
    ...baseStyles,
    ...(typeStyles[type] || typeStyles.error)
  };
  
  // Icon based on feedback type
  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM14.7071 8.70711C15.0976 8.31658 15.0976 7.68342 14.7071 7.29289C14.3166 6.90237 13.6834 6.90237 13.2929 7.29289L9 11.5858L6.70711 9.29289C6.31658 8.90237 5.68342 8.90237 5.29289 9.29289C4.90237 9.68342 4.90237 10.3166 5.29289 10.7071L8.29289 13.7071C8.68342 14.0976 9.31658 14.0976 9.70711 13.7071L14.7071 8.70711Z" 
          fill="#10b981"
        />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" 
          fill="#ef4444"
        />
      </svg>
    ),
  };
  
  return (
    <div
      ref={feedbackRef}
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      style={styles}
      tabIndex={-1}
      className="form-feedback"
      data-type={type}
    >
      {icons[type]}
      <span>{message}</span>
      
      {/* Dismiss button if onDismiss is provided */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            marginLeft: 'auto',
            color: 'inherit',
            opacity: 0.7,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};

// PropTypes for documentation and runtime type checking
FormFeedback.propTypes = {
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  message: PropTypes.string.isRequired,
  autoDismiss: PropTypes.number,
  onDismiss: PropTypes.func,
};

export default FormFeedback;