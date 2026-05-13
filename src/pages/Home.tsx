import { useEffect, useState, useMemo, useRef } from 'react';
import { collection, getDocs, query, doc, setDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { sortRoutes } from '../lib/sort';
import { MapPin, BusFront, ArrowRight, Search } from 'lucide-react';
import React from 'react';

interface RouteData {
  id: string;
  routeName: string;
  routeCode: string;
  stops: string[];
  distances: number[];
  farePerKm: number;
  minFare: number;
}

function SearchableSelect({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string, 
  onChange: (s: string) => void, 
  options: string[], 
  placeholder: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

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
    option.toLowerCase().includes(search.toLowerCase())
  );

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
          onFocus={() => setIsOpen(true)}
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
                onChange(option);
                setSearch(option);
                setIsOpen(false);
              }}
            >
              {option}
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
    return Array.from(stopsSet).sort();
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
      <div className="space-y-1 mb-8">
        <h2 className="text-2xl font-bold text-slate-800">ঢাকা মেট্রোপলিটন এলাকার বাস ভাড়া</h2>
        <p className="text-slate-500">আপনার ভ্রমণের যাত্রা শুরু এবং গন্তব্য নির্বাচন করুন</p>
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
              onChange={setFromStop}
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
              onChange={setToStop}
              options={allStops}
              placeholder="Search destination stop..."
            />
          </div>
        </div>
      </div>

      {fromStop && toStop && fromStop !== toStop && (
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
            <div className="grid gap-6">
              {matchingRoutes.map(route => {
                const info = calculateFare(route, fromStop, toStop);
                if (!info) return null;

                return (
                  <div key={route.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden transition-all hover:-translate-y-0.5">
                    
                    <div className="flex flex-col items-center text-center space-y-6">
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

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
