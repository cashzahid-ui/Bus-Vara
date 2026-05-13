import { useState, useEffect } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';

export function OfflineNotice() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border border-slate-100 flex flex-col items-center">
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <Loader2 className="absolute inset-0 w-full h-full text-blue-500 animate-spin opacity-20" />
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center relative z-10">
            <WifiOff className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">ইন্টারনেট সংযোগ বিচ্ছিন্ন</h2>
        <p className="text-slate-600 text-sm mb-6">
          অনুগ্রহ করে আপনার ইন্টারনেট সংযোগটি চালু করুন। অ্যাপটি ব্যবহার করার জন্য ইন্টারনেট প্রয়োজন।
        </p>
        <div className="text-xs text-slate-400 animate-pulse">
          ইন্টারনেটের জন্য অপেক্ষা করা হচ্ছে...
        </div>
      </div>
    </div>
  );
}
