/**
 * 🔀 APP.TSX REFACTORING GUIDE
 * 
 * Ini adalah panduan bagaimana merefactor App.tsx untuk menggunakan React Router
 * Perubahan tidak harus sekaligus, bisa incremental
 */

/*
╔════════════════════════════════════════════════════════════════════════════╗
║  1. HAPUS STATE YANG TIDAK PERLU LAGI                                     ║
╚════════════════════════════════════════════════════════════════════════════╝

BEFORE:
  const [currentView, setCurrentView] = useState<'catalog' | 'blog' | 'dashboard'>('catalog');

AFTER:
  // Tidak perlu! React Router handle ini via URL


╔════════════════════════════════════════════════════════════════════════════╗
║  2. GANTI window.history DENGAN useNavigate HOOK                           ║
╚════════════════════════════════════════════════════════════════════════════╝

IMPORT:
  import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

GUNAKAN:
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

OLD APPROACH:
  window.history.pushState({}, '', new URL(...));
  window.history.replaceState({}, '', window.location.pathname);

NEW APPROACH:
  navigate('/blog');              // Go to /blog
  navigate('/?item=Keju');        // Go to home with query param
  navigate('/admin', { replace: true });  // Replace history entry


╔════════════════════════════════════════════════════════════════════════════╗
║  3. GANTI CONDITIONAL RENDER                                               ║
╚════════════════════════════════════════════════════════════════════════════╝

BEFORE (Manual state):
  return (
    <div>
      {currentView === 'catalog' && <CatalogView />}
      {currentView === 'blog' && <BlogView />}
      {currentView === 'dashboard' && <Dashboard />}
    </div>
  );

AFTER (React Router dengan Outlet):
  import { Outlet } from 'react-router-dom';
  
  export function RootLayout() {
    return (
      <div>
        <Header />
        <Outlet />  {/* Content dari route child akan render di sini */}
        <Footer />
      </div>
    );
  }

Kemudian di router.tsx:
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <CatalogView /> },
      { path: 'blog', element: <BlogView /> },
      { path: 'admin', element: <AdminRoute><Dashboard /></AdminRoute> },
    ]
  }


╔════════════════════════════════════════════════════════════════════════════╗
║  4. HANDLE DEEP LINKING                                                    ║
╚════════════════════════════════════════════════════════════════════════════╝

BEFORE:
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === ADMIN_ACCESS_KEY) {
      setCurrentView('dashboard');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

AFTER:
  // React Router otomatis handle URL parsing!
  
  // Di component manapun:
  const [searchParams] = useSearchParams();
  const itemName = searchParams.get('item');
  
  // URL parsing otomatis oleh Router
  // Deep linking dari external link langsung bekerja


╔════════════════════════════════════════════════════════════════════════════╗
║  5. NAVIGASI DI HEADER/BUTTONS                                             ║
╚════════════════════════════════════════════════════════════════════════════╝

BEFORE:
  <button onClick={() => setCurrentView('catalog')}>Home</button>
  <button onClick={() => setCurrentView('blog')}>Blog</button>
  <button onClick={() => setCurrentView('dashboard')}>Admin</button>

AFTER:
  const navigate = useNavigate();
  
  <button onClick={() => navigate('/')}>Home</button>
  <button onClick={() => navigate('/blog')}>Blog</button>
  <button onClick={() => navigate('/admin')}>Admin</button>


╔════════════════════════════════════════════════════════════════════════════╗
║  6. NAVIGASI DENGAN PARAMS                                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

BEFORE:
  const url = new URL(window.location.href);
  url.searchParams.set('item', itemName);
  window.history.pushState({}, '', url.toString());

AFTER:
  navigate(`/?item=${encodeURIComponent(itemName)}`);
  
  // atau di component:
  const [searchParams, setSearchParams] = useSearchParams();
  setSearchParams({ item: itemName });


╔════════════════════════════════════════════════════════════════════════════╗
║  7. BROWSER BACK/FORWARD OTOMATIS BEKERJA                                  ║
╚════════════════════════════════════════════════════════════════════════════╝

React Router otomatis handle browser back/forward buttons!
Tidak perlu setup apapun - langsung bekerja.

User klik back → browser history berkurang → render komponen sebelumnya.


╔════════════════════════════════════════════════════════════════════════════╗
║  REFACTORING STEPS                                                         ║
╚════════════════════════════════════════════════════════════════════════════╝

1. npm install react-router-dom

2. Update src/main.tsx:
   ```
   import { RouterProvider } from 'react-router-dom';
   import { router } from './router';
   
   ReactDOM.createRoot(...).render(
     <React.StrictMode>
       <RouterProvider router={router} />
     </React.StrictMode>
   );
   ```

3. Buat src/router.tsx dengan route configuration

4. Di App.tsx, ganti:
   - useState(currentView) → useNavigate()
   - Conditional render → useLocation() atau automatic via router
   - window.history calls → navigate() calls
   - Manual URL manipulation → navigate() atau setSearchParams()

5. Export App sebagai page component, bukan root component

6. Test:
   - Semua link berfungsi
   - URL berubah saat navigasi
   - Deep linking dari external URL bekerja
   - Browser back/forward berfungsi
   - Item detail modal tetap bekerja via query param


╔════════════════════════════════════════════════════════════════════════════╗
║  EXPECTED Results SETELAH REFACTORING                                     ║
╚════════════════════════════════════════════════════════════════════════════╝

URL Structure:
  / (Home/Catalog)
  /blog (Blog Page)
  /admin (Admin Dashboard - dengan login)
  /?item=ItemName (Item detail modal)

Browser behavior:
  ✅ Back button works
  ✅ Forward button works
  ✅ Direct URL access works
  ✅ Bookmarking works
  ✅ Share links work
  ✅ SEO-friendly URLs


╔════════════════════════════════════════════════════════════════════════════╗
║  REFERENCES                                                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

React Router Docs: https://reactrouter.com
useNavigate: https://reactrouter.com/docs/hooks/use-navigate
useSearchParams: https://reactrouter.com/docs/hooks/use-search-params
useLocation: https://reactrouter.com/docs/hooks/use-location
Outlet: https://reactrouter.com/docs/components/outlet

*/

export const APP_REFACTOR_GUIDE = `
Panduan refactoring App.tsx untuk React Router
Lihat dokumentasi di atas untuk detail lengkap
`;
