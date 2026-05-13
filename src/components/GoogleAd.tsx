import { useEffect, useRef } from 'react';

export function GoogleAd() {
  const adRef = useRef<boolean>(false);

  useEffect(() => {
    if (adRef.current) return;
    adRef.current = true;

    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already have ads')) {
        // Ignore specific double-push error in React development
        return;
      }
      console.error('Google Adsense Error:', err);
    }
  }, []);

  return (
    <div className="w-full my-4 overflow-hidden flex justify-center bg-slate-50/50 rounded-xl p-2 min-h-[100px]">
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-7608093638667157"
           data-ad-slot="7038623620"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
