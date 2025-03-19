# Halo Project CSS Architecture

This document outlines the CSS architecture for the Halo Project, which uses CSS Modules for component styling.

## CSS Module Structure

The project uses CSS Modules to encapsulate styles and prevent global namespace collisions. Each component has its own corresponding CSS module file.

### Module Files

- `base.css` - Global CSS variables and base styles (imported in globals.css)
- `chat.module.css` - Styles for the Chat component
- `navbar.module.css` - Styles for the navigation bar
- `auth.module.css` - Shared styles for authentication pages (login/signup)
- `hero.module.css` - Styles for the homepage hero section
- `footer.module.css` - Styles for the site footer
- `profile.module.css` - Styles for the user profile page

## Usage Guidelines

### Importing CSS Modules

Always import CSS modules at the top of your component file:

```javascript
import styles from '@/app/styles/component-name.module.css';
```

### Applying CSS Module Classes

Use the imported styles object to apply classes:

```javascript
<div className={styles.container}>
  <h1 className={styles.title}>Hello World</h1>
</div>
```

For class names with hyphens, use bracket notation:

```javascript
<div className={styles['auth-container']}>
  <h2 className={styles['section-title']}>Login</h2>
</div>
```

### Combining Classes

To apply multiple classes, use template literals:

```javascript
<div className={`${styles.message} ${styles.user}`}>
  Message content
</div>
```

To conditionally apply classes:

```javascript
<div className={`${styles.button} ${isActive ? styles.active : ''}`}>
  Click me
</div>
```

## Naming Conventions

1. **BEM-inspired naming**: Use Block-Element-Modifier pattern for class names
   - Block: `container`, `card`, `button`
   - Element: `card-title`, `nav-item`, `form-input`
   - Modifier: `button-primary`, `card-large`, `text-error`

2. **Descriptive, functional names**: Name classes by their purpose, not appearance
   - Good: `alert-message`, `primary-button`
   - Avoid: `red-text`, `large-font`

## Dark Mode Support

All modules include dark mode variants using the `prefers-color-scheme` media query:

```css
.container {
  background-color: rgba(255, 255, 255, 0.9);
}

@media (prefers-color-scheme: dark) {
  .container {
    background-color: rgba(15, 23, 42, 0.8);
  }
}
```

## Responsive Design

The project uses mobile-first responsive design. Media queries are used to enhance the layout for larger screens:

```css
.features {
  display: grid;
  grid-template-columns: 1fr; /* Mobile first: single column */
}

@media (min-width: 640px) {
  .features {
    grid-template-columns: repeat(3, 1fr); /* Tablet+: three columns */
  }
}
```

## CSS Variables

Color variables and other common properties are defined in `base.css` and can be accessed using `var()`:

```css
.button {
  background-color: var(--primary-blue);
  color: var(--text-light);
}
```

## Maintainability Guidelines

1. **Keep selectors simple**: Avoid deep nesting and overly specific selectors
2. **Group related properties**: Organize CSS properties in logical groups
3. **Comment complex sections**: Add comments to explain non-obvious styling decisions
4. **Reuse common patterns**: Extract common patterns into shared modules
5. **Minimize !important**: Avoid using !important, improve selector specificity instead