/**
 * 🔀 REACT ROUTER SETUP GUIDE
 * 
 * Dokumentasi lengkap untuk migrasi dari manual state navigation ke react-router-dom
 */

/*
╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 1: INSTALL DEPENDENCY                                               ║
╚════════════════════════════════════════════════════════════════════════════╝

Jalankan command:
  npm install react-router-dom

atau jika menggunakan yarn:
  yarn add react-router-dom

Versi yang direkomendasikan: ^6.20.0 atau lebih baru


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 2: STRUKTUR ROUTER                                                   ║
╚════════════════════════════════════════════════════════════════════════════╝

Setelah install, buat file baru: src/router.tsx

File ini akan berisi konfigurasi semua routes dalam aplikasi Anda.
Lihat: src/router.tsx atau contoh di bawah.


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 3: UPDATE MAIN.TSX                                                   ║
╚════════════════════════════════════════════════════════════════════════════╝

Ubah dari:
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

Menjadi:
  import { RouterProvider } from 'react-router-dom';
  import { router } from './router';

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 4: PENGGANTIAN MANUAL NAVIGATION                                     ║
╚════════════════════════════════════════════════════════════════════════════╝

BEFORE (Manual state navigation):
  const [currentView, setCurrentView] = useState('catalog');
  
  const handleNavigateToBlog = () => {
    setCurrentView('blog');
  };

AFTER (React Router):
  import { useNavigate } from 'react-router-dom';
  
  const navigate = useNavigate();
  
  const handleNavigateToBlog = () => {
    navigate('/blog');
  };


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 5: URL STRUCTURE UNTUK APLIKASI INI                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

Saat ini aplikasi Anda punya 3 view:
  - 'catalog'   → / (root/home)
  - 'blog'      → /blog
  - 'dashboard' → /admin (dengan login)

Dengan react-router akan menjadi:
  /                   → Halaman katalog (default)
  /blog               → Halaman blog  
  /admin              → Halaman admin dashboard
  /?item=ItemName     → Item detail modal (tetap gunakan query param)


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 6: NAVIGASI DI KOMPONEN                                              ║
╚════════════════════════════════════════════════════════════════════════════╝

HEADER NAVIGATION (dengan react-router):

  import { useNavigate } from 'react-router-dom';
  
  function Header() {
    const navigate = useNavigate();
    
    return (
      <header>
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/blog')}>Blog</button>
        <button onClick={() => navigate('/admin')}>Admin</button>
      </header>
    );
  }


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 7: PROTECTED ROUTES (DASHBOARD)                                     ║
╚════════════════════════════════════════════════════════════════════════════╝

Gunakan ProtectedRoute component untuk melindungi /admin:

  import { Navigate } from 'react-router-dom';
  import { isDashboardAccessGranted } from './lib/auth';
  
  export function AdminRoute({ children }: { children: React.ReactNode }) {
    return isDashboardAccessGranted() ? children : <Navigate to="/" />;
  }

Kemudian di router.tsx:
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <Dashboard />
      </AdminRoute>
    )
  }


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 8: MANFAAT REACT ROUTER                                              ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ Browser Back/Forward Buttons bekerja otomatis
✅ URL lebih clean dan SEO-friendly
✅ Deep linking langsung dari URL
✅ History management otomatis
✅ Lazy code splitting support
✅ Transition animation lebih mudah diatur
✅ Standard React ecosystem practice


╔════════════════════════════════════════════════════════════════════════════╗
║  STEP 9: COMMON PATTERNS                                                   ║
╚════════════════════════════════════════════════════════════════════════════╝

1. NAVIGATE PROGRAMMATICALLY:
   const navigate = useNavigate();
   navigate('/blog');
   navigate('/admin?from=catalog'); // dengan params

2. GET ROUTE PARAMS:
   import { useParams } from 'react-router-dom';
   const { postId } = useParams();

3. GET SEARCH PARAMS:
   import { useSearchParams } from 'react-router-dom';
   const [searchParams] = useSearchParams();
   const item = searchParams.get('item');

4. GET CURRENT LOCATION:
   import { useLocation } from 'react-router-dom';
   const location = useLocation();
   console.log(location.pathname);


╔════════════════════════════════════════════════════════════════════════════╗
║  MIGRATION CHECKLIST                                                       ║
╚════════════════════════════════════════════════════════════════════════════╝

□ npm install react-router-dom
□ Buat src/router.tsx dengan route configuration
□ Update src/main.tsx untuk menggunakan RouterProvider
□ Refactor App.tsx:
  □ Hapus state [currentView, setCurrentView]
  □ Hapus window.history.pushState/replaceState
  □ Ganti dengan useNavigate() hook
  □ Ganti conditional render dengan <Outlet>
□ Update semua navigasi di components
□ Test all routes dan deep linking
□ Pastikan browser back/forward bekerja
□ Deploy ke production

*/


// CONTOH IMPLEMENTASI SEDERHANA
// Lihat file: src/router.tsx untuk contoh lengkap yang sudah siap pakai

export const ROUTER_MIGRATION_GUIDE = `
Lihat dokumentasi di atas untuk setup lengkap.
Untuk pertanyaan, referensi: https://reactrouter.com/start/overview
`;
