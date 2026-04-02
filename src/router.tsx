import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import App from './App';
import { Dashboard } from './components/Dashboard';
import { QrGenerator } from './components/QrGenerator';
import { Gallery } from './components/Gallery';
import { isDashboardAccessGranted } from './lib/auth';

/**
 * 🔐 Protected Route Component untuk Admin Dashboard
 * Hanya mengizinkan akses jika user sudah login/authenticated
 */
function AdminRoute() {
  const [isAuth, setIsAuth] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    async function check() {
      const granted = await isDashboardAccessGranted();
      setIsAuth(granted);
    }
    check();
  }, []);

  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  
  return <Dashboard onBack={() => window.location.href = '/'} />;
}

function RootLayout() {
  return <Outlet />;
}

/**
 * 🔀 Router Configuration
 * 
 * Routes:
 *   /              → Home/Catalog Page
 *   /blog          → Blog Page
 *   /qr            → QR Generator Page (Public)
 *   /admin         → Admin Dashboard (Protected)
 *   /?item=NAME    → Item Detail Modal (query param di home page)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <App />,
        errorElement: <ErrorPage />
      },
      {
        path: 'blog',
        element: <App />,
      },
      {
        path: 'qr',
        element: <QrGenerator />,
      },
      {
        path: 'gallery',
        element: <Gallery />,
      },
      {
        path: 'admin',
        element: <AdminRoute />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

/**
 * 📄 Error Page untuk 404 atau errors lainnya
 */
function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Halaman tidak ditemukan
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
        >
          Kembali ke Home
        </a>
      </div>
    </div>
  );
}

export default router;
