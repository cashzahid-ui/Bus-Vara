import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { FAQButton } from './components/FAQ';
import { InstallPWA } from './components/InstallPWA';
import { OfflineNotice } from './components/OfflineNotice';
import { Bus, LogOut } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./pages/Admin'));


function Navbar() {
  const { logOut, isAdmin } = useAuth();

  return (
    <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-8 shrink-0 hidden sm:flex">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
            <Bus className="h-6 w-6 text-white" />
          </div>
        </Link>
        <div className="flex flex-col">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <h1 className="text-lg font-bold leading-none text-white">ঢাকা সিটি বাস ভাড়া (Dhaka City Bus Fare)</h1>
          </Link>
          <p className="text-[10px] text-slate-400 tracking-wider mt-1.5 leading-none">
            powered by <a href="https://www.youtube.com/@talukdaracademy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors pointer-events-auto font-medium">Talukdar Academy</a>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-slate-400">সর্বশেষ আপডেট</p>
          <p className="text-sm font-medium text-white">২৩ এপ্রিল ২০২৬</p>
        </div>
        
        <InstallPWA />
        <FAQButton />
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden md:block">Admin Session</span>
            <button onClick={logOut} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// Mobile topnav without logout/login to avoid clutter
function MobileNav() {
    const { logOut, isAdmin } = useAuth();
    return (
        <div className="sm:hidden flex justify-between items-center py-2 px-4 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-white hover:opacity-90 transition-opacity">
                <Bus className="h-5 w-5" />
              </Link>
              <div className="flex flex-col">
                <Link to="/" className="text-white hover:opacity-90 transition-opacity">
                  <span className="font-bold text-lg leading-none">ঢাকা সিটি বাস ভাড়া</span>
                </Link>
                <span className="text-[9px] text-slate-400 tracking-wider mt-1 leading-none">
                  powered by <a href="https://www.youtube.com/@talukdaracademy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors pointer-events-auto font-medium">Talukdar Academy</a>
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
                 <InstallPWA />
                 <FAQButton />
                 {isAdmin && (
                    <button onClick={logOut} className="p-1.5 text-slate-300 hover:text-red-400"><LogOut className="w-5 h-5"/></button>
                 )}
            </div>
        </div>
    )
}

function AppContent() {
  const [searchCount, setSearchCount] = useState<number>(0);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'stats', 'searchCount'), (docSnap) => {
      if (docSnap.exists() && typeof docSnap.data().count === 'number') {
        setSearchCount(docSnap.data().count);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      <OfflineNotice />
      <Navbar />
      <MobileNav />
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>
      
      {/* Footer / Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <p>Developed by: <a href="https://www.youtube.com/@zahidulislam.talukder" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 hover:underline transition-colors font-medium">Zahidul Islam Talukder</a></p>
          <div className="flex gap-4 items-center">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {searchCount} জন ভাড়া দেখেছেন
              </span>
              <a href="mailto:zahid@talukdaracademy.com.bd" className="hidden sm:inline hover:text-blue-500 transition-colors">
                Contact for advertisement
              </a>
          </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
