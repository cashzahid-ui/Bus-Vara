import { useEffect, useState, useMemo, useRef } from 'react';
import { collection, getDocs, query, doc, setDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { sortRoutes } from '../lib/sort';
import { GoogleAd } from '../components/GoogleAd';
import { transliterateBnToEn } from '../lib/transliterate';
import { MapPin, BusFront, ArrowRight, Search } from 'lucide-react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RouteData {
  id: string;
  routeName: string;
  routeCode: string;
  stops: string[];
  distances: number[];
  farePerKm: number;
  minFare: number;
}

interface StopOption {
  bn: string;
  en: string;
  display: string;
}

function SearchableSelect({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string, 
  onChange: (s: string) => void, 
  options: StopOption[], 
  placeholder: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // When selected value changes from outside, reset search to show the full display string
  // Wait, if we keep `value` as the Bengali string `bn`, we should set `search` to `display`
  useEffect(() => {
    const selectedOpt = options.find(o => o.bn === value);
    setSearch(selectedOpt ? selectedOpt.display : value);
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(option =>
    option.display.toLowerCase().includes(search.toLowerCase()) || 
    option.en.toLowerCase().includes(search.toLowerCase()) || 
    option.bn.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50); // limit to 50 items for faster mobile rendering

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (e.target.value === "") {
                onChange("");
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch(""); // clear search on focus to easily type new destination
          }}
          className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg text-slate-800"
          placeholder={placeholder}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 max-h-60 overflow-auto bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50">
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-slate-700 font-medium border-b border-slate-50 last:border-0"
              onClick={() => {
                onChange(option.bn);
                setSearch(option.display);
                setIsOpen(false);
              }}
            >
              {option.display}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const lastSearchRef = useRef<string>('');

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const q = query(collection(db, 'routes'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RouteData));
        setRoutes(sortRoutes(data));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'routes');
      } finally {
        setLoading(false);
      }
    }
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (fromStop && toStop && fromStop !== toStop) {
      const searchKey = `${fromStop}-${toStop}`;
      if (lastSearchRef.current !== searchKey) {
        lastSearchRef.current = searchKey;
        const incrementCount = async () => {
          try {
            const countRef = doc(db, 'stats', 'searchCount');
            await setDoc(countRef, { count: increment(1) }, { merge: true });
          } catch (error) {
            console.error('Error incrementing count', error);
          }
        };
        incrementCount();
      }
    }
  }, [fromStop, toStop]);

  const allStops = useMemo(() => {
    const stopsSet = new Set<string>();
    routes.forEach(route => {
      route.stops.forEach(stop => stopsSet.add(stop));
    });
    
    return Array.from(stopsSet).sort().map(stop => {
      const en = transliterateBnToEn(stop);
      return {
        bn: stop,
        en: en,
        display: stop
      };
    });
  }, [routes]);

  const matchingRoutes = useMemo(() => {
    if (!fromStop || !toStop || fromStop === toStop) return [];

    return routes.filter(route => {
      const fromIndex = route.stops.indexOf(fromStop);
      const toIndex = route.stops.indexOf(toStop);
      return fromIndex !== -1 && toIndex !== -1;
    });
  }, [routes, fromStop, toStop]);

  const calculateFare = (route: RouteData, from: string, to: string) => {
    const fromIndex = route.stops.indexOf(from);
    const toIndex = route.stops.indexOf(to);
    if (fromIndex === -1 || toIndex === -1) return null;

    const fromDistance = route.distances[fromIndex];
    const toDistance = route.distances[toIndex];
    
    const distanceKm = Math.abs(toDistance - fromDistance);
    const rawFare = distanceKm * route.farePerKm;
    
    const integerPart = Math.floor(rawFare);
    const decimalPart = rawFare - integerPart;
    const roundedFare = decimalPart > 0.55 ? integerPart + 1 : integerPart;
    
    const finalFare = Math.max(route.minFare, roundedFare);

    return {
      distance: distanceKm.toFixed(1),
      fare: finalFare,
      rawFare: rawFare.toFixed(2)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-bold text-slate-800">ঢাকা মেট্রোপলিটন এলাকার বাস ভাড়া (Dhaka City Bus Fare)</h1>
        <p className="text-slate-600">
          আপনার ভ্রমণের যাত্রা শুরু এবং গন্তব্য নির্বাচন করুন। এখানে আপনি খুব সহজেই BRTA Bus Fare Chart অনুযায়ী ঢাকা সিটির বাসের রুট এবং ভাড়ার তালিকা চেক করতে পারবেন।
        </p>
        <div className="flex flex-wrap gap-3 pt-3 text-sm">
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            সর্বশেষ আপডেট: ২৩ এপ্রিল ২০২৬
          </span>
          <span className="text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            আজকের তারিখ: {new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">
              যাত্রা শুরু (From)
            </label>
            <SearchableSelect
              value={fromStop}
              onChange={(val) => { setFromStop(val); setHasSearched(false); }}
              options={allStops}
              placeholder="Search origin stop..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">
              গন্তব্য (To)
            </label>
            <SearchableSelect
              value={toStop}
              onChange={(val) => { setToStop(val); setHasSearched(false); }}
              options={allStops}
              placeholder="Search destination stop..."
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (fromStop && toStop && fromStop !== toStop) {
              setHasSearched(true);
              setShowPopup(true);
              setTimeout(() => setShowPopup(false), 5000);
            }
          }}
          className={`w-full font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
            fromStop && toStop && fromStop !== toStop
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          disabled={!fromStop || !toStop || fromStop === toStop}
        >
          <Search className="w-5 h-5" />
          রুট ও ভাড়া খুঁজুন
        </button>
      </div>

      <div className="my-6">
        <GoogleAd />
      </div>

      {/* Popup Notification */}
      <AnimatePresence>
        {fromStop && toStop && fromStop !== toStop && hasSearched && showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
          >
            {matchingRoutes.length > 0 ? (
              <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex flex-col items-center text-center gap-2 border border-emerald-500">
                <span className="text-3xl mb-1">🎉</span>
                <p className="font-bold text-lg leading-tight">আপনার কাঙ্ক্ষিত বাস ও ভাড়ার তথ্য পাওয়া গেছে!</p>
                <p className="text-sm opacity-90">বিস্তারিত দেখতে অনুগ্রহ করে নিচের দিকে স্ক্রল করুন।</p>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="mt-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
                  aria-label="Close message"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex flex-col items-center text-center gap-2 border border-red-500">
                <span className="text-3xl mb-1">😕</span>
                <p className="font-bold text-lg leading-tight">দুঃখিত, কোনো বাস বা ভাড়ার তথ্য পাওয়া যায়নি!</p>
                <p className="text-sm opacity-90">আপনার নির্বাচিত স্টপেজগুলোর মধ্যে সরাসরি কোনো বাসের রুট আমাদের ডাটাবেজে নেই।</p>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="mt-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors"
                  aria-label="Close message"
                >
                  ঠিক আছে
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {fromStop && toStop && fromStop !== toStop && hasSearched && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <BusFront className="h-5 w-5" />
            Available Routes ({matchingRoutes.length})
          </h2>

          {matchingRoutes.length === 0 ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm border border-yellow-100">
              No direct routes found between these two stops in the database.
            </div>
          ) : (
            <table className="w-full">
              <thead className="sr-only">
                <tr>
                  <th>Bus Route</th>
                  <th>Total Distance</th>
                  <th>Local Bus Fare</th>
                  <th>Route Details</th>
                </tr>
              </thead>
              <tbody className="grid gap-6">
              {matchingRoutes.map((route, index) => {
                const info = calculateFare(route, fromStop, toStop);
                if (!info) return null;

                return (
                  <React.Fragment key={route.id}>
                    <tr className="block glass-panel p-6 rounded-2xl relative overflow-hidden transition-all hover:-translate-y-0.5">
                    <td className="w-full block flex flex-col items-center text-center space-y-6">
                        <div className="flex flex-col items-center">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-tighter">রুট {route.routeCode}</span>
                                <span className="text-xs text-slate-400 font-medium">{route.routeName}</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-1">মোট বাস ভাড়া</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-7xl font-black text-slate-900 tracking-tighter">{info.fare}</span>
                                <span className="text-2xl font-bold text-slate-400">টাকা</span>
                            </div>
                        </div>
                        
                        <div className="w-full max-w-md mt-4 flex justify-between gap-4 text-center items-center">
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">দূরত্ব</p>
                                <p className="font-semibold text-slate-800">{info.distance} কিমি</p>
                            </div>
                            <div className="w-[1px] h-10 bg-slate-200"></div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">মিনিমাম</p>
                                <p className="font-semibold text-slate-800">৳{route.minFare}</p>
                            </div>
                            <div className="w-[1px] h-10 bg-slate-200"></div>
                            <div className="flex-1">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">রেট/কিমি</p>
                                <p className="font-semibold text-slate-800">৳{route.farePerKm.toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <div className="w-full mt-6 pt-4 border-t border-slate-100 text-left">
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">পুরো রুট ম্যাপ:</p>
                            <div className="flex flex-wrap gap-x-1.5 gap-y-1 items-center text-[13px] text-slate-600 leading-relaxed">
                                {route.stops.map((stop, i) => {
                                    const isSearchStop = stop === fromStop || stop === toStop;
                                    return (
                                        <React.Fragment key={i}>
                                            <span className={isSearchStop ? 'font-bold text-blue-700 bg-blue-50 px-1 rounded' : ''}>
                                                {stop}
                                            </span>
                                            {i < route.stops.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </td>
                  </tr>
                  
                  {index < matchingRoutes.length - 1 && (
                    <tr className="block">
                      <td className="block w-full">
                        <GoogleAd />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SEO Footer Text */}
      <div className="mt-16 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-slate-600 text-sm leading-relaxed space-y-4">
        <h2 className="text-lg font-bold text-slate-800">ঢাকা সিটি বাস ভাড়া ও লোকাল বাসের রুট ম্যাপ সম্পর্কে (Dhaka City Bus Fare & Route)</h2>
        <p>
          ঢাকা মেট্রোপলিটন শহরের নিত্যযাত্রীদের জন্য <strong>Dhaka City Bus Fare</strong> বা <strong>বাসের রুট এবং ভাড়ার তালিকা</strong> জানা অত্যন্ত জরুরি। প্রতিদিন হাজারো মানুষ কাজের উদ্দেশ্যে ঢাকার বিভিন্ন প্রান্তে যাতায়াত করেন। বিআরটিএ (BRTA) নির্ধারিত সর্বশেষ <strong>BRTA Bus Fare Chart</strong> অনুযায়ী সঠিক <strong>local bus vara</strong> বা ভাড়া জানার মাধ্যমে আপনি নিশ্চিন্তে ও সহজে ভ্রমণ করতে পারেন।
        </p>
        <p>
          আমাদের এই প্ল্যাটফর্মে আপনি খুব সহজেই উৎপত্তি এবং গন্তব্যস্থল নির্বাচন করে <strong>dhaka city local bus</strong> এর সঠিক ভাড়া, দূরত্ব এবং রুট ম্যাপ সম্পর্কে বিস্তারিত জানতে পারবেন। এটি আপনাকে অতিরিক্ত <strong>bus vara</strong> দেওয়ার ঝামেলা থেকে মুক্ত রাখবে এবং আপনার যাত্রাকে আরও সাশ্রয়ী করবে। 
        </p>
        <p>
           আমাদের সিস্টেমে ঢাকার প্রায় সব লোকাল বাসের রুট এবং স্টপেজগুলোর তথ্য নিয়মিত আপডেট করা হয়। তাই ঘরে বসেই <strong>ঢাকার বাস ভাড়া</strong> চেক করুন এবং নিরাপদে ভ্রমণ করুন।
        </p>
      </div>

    </div>
  );
}
