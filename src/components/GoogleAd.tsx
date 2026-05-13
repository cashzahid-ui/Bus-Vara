import { useEffect, useRef } from 'react';

export function GoogleAd() {
  const adInit = useRef(false);

  useEffect(() => {
    if (adInit.current) return;
    
    // Use a small timeout to let the DOM settle before pushing ad
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adInit.current = true;
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already have ads')) return;
        console.error('Google Adsense Error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full my-4 overflow-hidden flex justify-center bg-transparent rounded-xl p-2 min-h-[100px]">
      <ins 
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
