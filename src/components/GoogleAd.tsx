import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function GoogleAd() {
  const insRef = useRef<HTMLModElement>(null);
  const location = useLocation();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && insRef.current) {
        // Check if ad is already initialized to prevent double loading in React
        if (!insRef.current.hasAttribute('data-adsbygoogle-status')) {
          // @ts-ignore
          const adsbygoogle = window.adsbygoogle || [];
          adsbygoogle.push({});
        }
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already have ads')) return;
      console.error('Google Adsense Error:', err);
    }
  }, [location.pathname]);

  return (
    <div className="w-full my-4 overflow-hidden flex justify-center bg-slate-50/50 rounded-xl p-2 min-h-[100px] relative">
      <ins 
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-7608093638667157"
        data-ad-slot="7038623620"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
