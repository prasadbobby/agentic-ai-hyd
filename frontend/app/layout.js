import './globals.css';
import Header from '../components/layout/Header';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'AI Personalized Tutor',
  description: 'Personalized learning paths powered by AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}