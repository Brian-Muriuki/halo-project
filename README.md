# Halo - Christian Spiritual Companion

Halo is a Next.js application designed to be a spiritual companion for Christians, providing scripture-based guidance, conversations, and support for spiritual growth.

![Halo Project](https://via.placeholder.com/800x400?text=Halo+Project)

## Project Overview

Halo serves as a digital companion that points users toward scripture and encourages spiritual growth. It includes features such as:

- AI-powered spiritual conversations with scripture references
- User authentication and personalized experiences
- Journaling features (coming soon)
- Prayer reminders (coming soon)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Core Technologies

- [Next.js](https://nextjs.org/) - React framework for server-rendered applications
- [Firebase](https://firebase.google.com/) - Authentication and database
- [OpenAI API](https://openai.com/api/) - AI conversation capabilities
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework

## Features

### Authentication System

Halo includes a secure authentication system with:

- Email/password registration and login
- Form validation with helpful error messages
- CSRF protection for enhanced security
- Rate limiting to prevent brute force attacks
- Accessibility-focused UI with screen reader support

### Spiritual Conversations

The conversation feature allows users to:

- Discuss faith questions with AI guidance
- Receive scripture references relevant to topics
- Save and continue conversations

## Form Validation Features

We've implemented robust client-side form validation to enhance user experience:

### Input Validation

- **Email validation**: Ensures proper email format using regex patterns
- **Password strength**: Requires minimum length and combination of letters and numbers
- **Name validation**: Checks for valid name formats
- **Matching passwords**: Verifies password confirmation matches during signup

### Validation Feedback

- **Immediate feedback**: Form errors are displayed as users type or on submission
- **Field-specific errors**: Error messages are associated with specific form fields
- **Accessible error states**: Error messages are announced to screen readers
- **Focus management**: Focus moves to error messages for immediate awareness

### Security Measures

- **Rate limiting**: Prevents brute force attacks by limiting login attempts
- **CSRF protection**: Cross-Site Request Forgery tokens secure form submissions
- **Secure authentication**: Firebase Authentication for secure credential management

## Testing

The project includes comprehensive testing to ensure reliability:

### Unit Tests

Run unit tests with:

```bash
npm test
# or
npm run test:watch
```

Unit tests cover:
- Form validation functions
- Utility functions
- Component rendering

### Integration Tests

Integration tests cover form submissions and authentication flows:

```bash
npm test -- --testPathPattern=integration
```

### Coverage Report

Generate test coverage report with:

```bash
npm run test:coverage
```

## Accessibility Features

Halo is built with accessibility in mind:

### Keyboard Navigation

- **Focus management**: Proper focus order and management
- **Focus indicators**: Visible focus outlines for keyboard users
- **Skip links**: Hidden links that become visible on focus for keyboard users

### Screen Reader Support

- **ARIA attributes**: Proper labeling of form controls and error messages
- **Live regions**: Dynamic content changes announced to screen readers
- **Meaningful alt text**: Images have descriptive alternative text

### Visual Accessibility

- **Color contrast**: All text meets WCAG AA contrast requirements
- **Text sizing**: Responsive text sizing with proper hierarchy
- **Dark mode support**: Automatic switching based on user preference

### Reduced Motion

- **Motion reduction**: Animations are disabled for users who prefer reduced motion

## CSS Architecture

The project uses a combination of global styles and CSS Modules:

- **base.css**: Contains global variables, resets, and utility classes
- **CSS Modules**: Component-specific styles with local scoping
- **Media queries**: Responsive design for various screen sizes
- **Dark mode**: Support for system preference dark mode

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/introduction)