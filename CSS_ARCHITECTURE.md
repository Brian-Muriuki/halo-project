# CSS Architecture

## Overview

This document describes the CSS architecture used in the Halo project. We've reorganized the CSS structure to use CSS Modules for better maintainability, performance, and organization.

## CSS Modules Approach

We've moved from a single global CSS file to a modular approach where each component has its own CSS module. This provides several benefits:

- **Scoped Styles**: CSS classes are locally scoped to components, preventing style conflicts
- **Better Organization**: Styles are co-located with their components
- **Improved Maintainability**: Smaller, focused CSS files make maintenance easier
- **Reduced Bundle Size**: Only load the CSS needed for each component
- **Better Performance**: More efficient CSS loading and application

## CSS Files Structure

### Base Styles
- `app/styles/base.css`: Core variables, typography, and shared styles used throughout the application

### Component-Specific Modules
- `app/styles/auth.module.css`: Styles for authentication components (login, signup)
- `app/styles/chat.module.css`: Styles for the chat component and messages
- `app/styles/navbar.module.css`: Styles for the navigation bar
- `app/styles/hero.module.css`: Styles for the home page hero section
- `app/styles/footer.module.css`: Styles for the footer component
- `app/styles/profile.module.css`: Styles for the user profile page

## Using CSS Modules in Components

To use CSS modules in a component:

```jsx
// 1. Import the CSS module
import styles from '@/app/styles/component-name.module.css';

// 2. Use the imported styles with className
function MyComponent() {
  return (
    <div className={styles['component-name']}>
      <h1 className={styles.title}>Title</h1>
      <p className={styles.description}>Description</p>
    </div>
  );
}
```

For multiple class names:

```jsx
<div className={`${styles.card} ${styles.highlighted}`}>
  Content
</div>
```

## CSS Variables

We use CSS variables for consistent theming across the application. They are defined in `base.css`:

```css
:root {
  --primary-blue: #1e3a8a;
  --secondary-blue: #3b82f6;
  --light-blue: #bfdbfe;
  /* More color variables... */
}
```

These variables are also configured for dark mode using media queries.

## Responsive Design

All component styles include media queries for responsive layouts:

```css
@media (min-width: 768px) {
  .component {
    /* Desktop styles */
  }
}
```

## Form Validation Styles

We've added consistent styles for form validation states:

- `.input-error`: For styling input fields with validation errors
- `.field-error-message`: For displaying error messages
- `.input-success`: For styling validated input fields

## Accessibility Improvements

Various accessibility improvements have been made:

- Better focus styles with `:focus-visible`
- Reduced motion preferences
- Appropriate color contrast
- Screen reader support classes

## Next Steps

- Complete the integration of CSS modules into components
- Fine-tune responsive designs
- Add additional component-specific modules as needed
