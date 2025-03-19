This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Halo Project

Halo is a spiritual companion app designed to support Christians in their faith journey through an AI-powered chatbot, journaling features, and personalized notifications.

## Features

- AI-powered spiritual companion chatbot
- Scripture integration and reference capabilities
- User authentication with personalized experiences
- Responsive design that works across devices
- Dark mode support

## CSS Architecture

This project uses CSS Modules for component styling to ensure:

- Better encapsulation and avoidance of CSS conflicts
- Component-scoped styling
- Improved maintainability and organization
- Type safety with named imports

See the [CSS Architecture Documentation](./app/styles/README.md) for detailed information about our styling approach and guidelines.

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
NEXT_PUBLIC_SCRIPTURE_API_KEY=your_scripture_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Project Structure

- `/app` - Next.js app router structure
- `/app/components` - Reusable components
- `/app/styles` - CSS modules and base styles
- `/app/lib` - Utility functions and API integration
- `/app/context` - React context providers
- `/app/auth` - Authentication pages
- `/public` - Static assets

## Tech Stack

- **Frontend**: Next.js, React
- **Styling**: CSS Modules, TailwindCSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **API Integration**: OpenAI, Scripture API
- **Deployment**: Vercel

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!