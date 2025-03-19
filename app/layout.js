// app/layout.js
import Navbar from '@/app/components/Navbar';
import '@/app/styles/base.css';
import { Inter, Lora, Open_Sans } from 'next/font/google';
import { AuthProvider } from '@/app/context/AuthContext';
import { ToastProvider } from '@/app/context/ToastContext';

// Define fonts
const lora = Lora({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
});

const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Halo - Christian Spiritual Companion',
  description: 'A calming, supportive space for spiritual reflection and growth',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lora.variable} ${openSans.variable}`}>
      <body>
        <AuthProvider>
          <ToastProvider>
            <div className="page-container">
              <Navbar />
              <main className="main-content">
                {children}
              </main>
              <footer className="site-footer">
                <div className="container">
                  <p>Halo - Your companion for spiritual growth</p>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}