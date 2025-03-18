# Halo Project Coding Standards

This document outlines coding standards for the Halo project to ensure consistency and maintainability.

## Import Path Standards

### Use Absolute Imports

Always use absolute imports with the `@/` prefix for internal project imports. This makes imports consistent and avoids the confusion of relative paths.

```javascript
// ✅ Good
import { auth } from '@/app/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';

// ❌ Bad
import { auth } from '../../lib/firebase';
import { useAuth } from '../context/AuthContext';
```

### Firebase Imports

When working with Firebase, import the initialized instances from our centralized firebase.js file rather than initializing services in each component:

```javascript
// ✅ Good
import { auth, db, storage } from '@/app/lib/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// ❌ Bad
const { getAuth } = await import('firebase/auth');
const auth = getAuth();
```

### Service Imports

For service functions like API wrappers, use consistent imports:

```javascript
// ✅ Good
import { generateChatResponse } from '@/app/lib/openaiApi';

// ❌ Bad
import { generateChatResponse } from '../../lib/openaiApi';
```

## ESLint Configuration

An ESLint rule has been added to enforce the `@/` import pattern and prevent relative parent imports. Make sure to run linting before committing:

```bash
npm run lint
```

## Benefits

- **Maintainability**: Files can be moved without breaking import paths
- **Readability**: All developers can quickly understand where imports come from
- **Consistency**: Standard patterns across the codebase
- **IDE support**: Better autocomplete for imports

## Getting Help

If you're unsure about import patterns or encounter linting errors, please refer to this document or ask for help from the team.
