import { useEffect, useRef } from 'react';

export function GoogleAd() {
  const adInit = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adInit.current || !containerRef.current) return;
    
    let observer: ResizeObserver;
    let timer: NodeJS.Timeout;

    const tryPushAd = () => {
      try {
        if (typeof window !== 'undefined') {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adInit.current = true;
          if (observer) observer.disconnect();
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already have ads')) return;
        console.error('Google Adsense Error:', err);
      }
    };

    observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && !adInit.current) {
          clearTimeout(timer);
          timer = setTimeout(tryPushAd, 200);
        }
      }
    });

    observer.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full my-4 overflow-hidden flex justify-center items-center bg-transparent rounded-xl" style={{ minWidth: '200px', minHeight: '100px' }}>
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
