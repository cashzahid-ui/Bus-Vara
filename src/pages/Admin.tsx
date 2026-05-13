import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { extractRoutesFromDocument } from '../lib/gemini';
import { Upload, Trash2, FileImage, ShieldAlert, CheckCircle2, Edit2, X, Plus, KeyRound, Download } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { sortRoutes } from '../lib/sort';
import * as XLSX from 'xlsx';

interface RouteData {
  id: string;
  routeName: string;
  routeCode: string;
  stops: string[];
  distances: number[];
  farePerKm: number;
  minFare: number;
  userId: string;
  createdAt: any;
  updatedAt: any;
  adminCode: string;
}

function EditRouteModal({ route, onClose, onSaved }: { route: RouteData, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({
    routeName: route.routeName,
    routeCode: route.routeCode || '',
    farePerKm: route.farePerKm.toString(),
    minFare: route.minFare.toString(),
  });
  
  const [stops, setStops] = useState<{name: string, distance: string}[]>(
    route.stops.map((stop, i) => ({
      name: stop,
      distance: route.distances[i].toString()
    }))
  );
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleStopChange = (index: number, field: 'name'|'distance', value: string) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  const handleAddStop = () => {
    setStops([...stops, { name: '', distance: '0' }]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length <= 1) return;
    const newStops = [...stops];
    newStops.splice(index, 1);
    setStops(newStops);
  };

  const handleSave = async () => {
    setError('');
    const farePerKm = Number(formData.farePerKm);
    const minFare = Number(formData.minFare);
    
    if (isNaN(farePerKm) || farePerKm <= 0) {
      setError('Fare per Km must be a positive number');
      return;
    }
    if (isNaN(minFare) || minFare < 0) {
      setError('Minimum fare must be zero or positive');
      return;
    }
    if (stops.length === 0) {
      setError('Must have at least one stop');
      return;
    }
    if (stops.some(s => !s.name.trim())) {
      setError('Stop names cannot be empty');
      return;
    }

    const finalStops = stops.map(s => s.name.trim());
    const finalDistances = stops.map(s => Number(s.distance) || 0);

    setSaving(true);
    try {
      await updateDoc(doc(db, 'routes', route.id), {
        routeName: formData.routeName,
        routeCode: formData.routeCode,
        farePerKm,
        minFare,
        stops: finalStops,
        distances: finalDistances,
        updatedAt: serverTimestamp()
      });
      onSaved();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update route');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col items-center justify-center p-4 sm:p-8 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-800">Edit Route</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-1">
          {error && (
             <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
               <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
               {error}
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Route Name</label>
              <input 
                type="text" 
                value={formData.routeName}
                onChange={e => setFormData({...formData, routeName: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Route Code</label>
              <input 
                type="text" 
                value={formData.routeCode}
                onChange={e => setFormData({...formData, routeCode: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Fare per KM</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.farePerKm}
                onChange={e => setFormData({...formData, farePerKm: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Min Fare</label>
              <input 
                type="number" 
                step="1"
                value={formData.minFare}
                onChange={e => setFormData({...formData, minFare: e.target.value})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Stops & Distances (from origin)</label>
              <button 
                onClick={handleAddStop}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md"
              >
                <Plus className="w-3 h-3" /> Add Stop
              </button>
            </div>
            <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
              {stops.map((stop, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="h-10 w-8 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                    {i + 1}.
                  </div>
                  <div className="flex-1 flex flex-col">
                    <input
                      type="text"
                      value={stop.name}
                      placeholder="Stop Name"
                      onChange={e => handleStopChange(i, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={stop.distance}
                        placeholder="Dist"
                        onChange={e => handleStopChange(i, 'distance', e.target.value)}
                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm pr-6"
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400">km</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        value={(() => {
                          if (i === 0) return 0;
                          const rawFare = Number(stop.distance) * Number(formData.farePerKm);
                          const intPart = Math.floor(rawFare);
                          const decPart = rawFare - intPart;
                          const roundedFare = decPart > 0.55 ? intPart + 1 : intPart;
                          return Math.max(Number(formData.minFare) || 0, roundedFare);
                        })()}
                        placeholder="Fare"
                        onChange={e => {
                          const fare = Number(e.target.value);
                          if (formData.farePerKm && Number(formData.farePerKm) > 0) {
                            const dist = fare / Number(formData.farePerKm);
                            handleStopChange(i, 'distance', dist.toFixed(2));
                          }
                        }}
                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm pr-6"
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400">৳</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveStop(i)}
                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg mt-0.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 shrink-0 bg-white rounded-b-2xl">
           <button
             onClick={onClose}
             className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm"
           >
             Cancel
           </button>
           <button
             onClick={handleSave}
             disabled={saving}
             className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-bold text-sm shadow-lg shadow-blue-200 disabled:opacity-50"
           >
             {saving ? 'Saving...' : 'Save Changes'}
           </button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAdmin, signIn } = useAuth();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);
  
  const [showExportAuth, setShowExportAuth] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportError, setExportError] = useState('');

  const handleExportSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (exportPassword === '0011') {
      setShowExportAuth(false);
      setExportPassword('');
      setExportError('');
      exportToExcel();
    } else {
      setExportError('Incorrect password');
    }
  };
  
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    setLoginError('');
    const successResult = await signIn();
    if (!successResult) {
      setLoginError('Could not sign in with Google');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRoutes();
    }
  }, [isAdmin]);

  const fetchRoutes = async () => {
    try {
      const q = query(collection(db, 'routes'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RouteData));
      setRoutes(sortRoutes(data));
    } catch (error) {
      console.error(error);
    }
  };

  const exportToExcel = () => {
    try {
      // Format data for Excel
      const excelData = routes.map(route => ({
        'Route Name': route.routeName,
        'Route Code': route.routeCode || '',
        'Fare per KM (৳)': route.farePerKm,
        'Minimum Fare (৳)': route.minFare,
        'Stops (in order)': route.stops.join(' -> '),
        'Distances (KM)': route.distances.join(', ')
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Auto-size columns slightly
      ws['!cols'] = [
        { wch: 25 }, // Route Name
        { wch: 15 }, // Route Code
        { wch: 15 }, // Fare per KM
        { wch: 15 }, // Min Fare
        { wch: 80 }, // Stops
        { wch: 30 }  // Distances
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bus Routes");
      
      // Save file
      const dateString = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `DhakaMetro_Bus_Routes_${dateString}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setError("Failed to export Excel file.");
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setExtracting(true);
    setProgressMsg('Uploading document...');
    setError(null);
    setSuccess(null);

    try {
      let addedCount = 0;
      
      const saveRoutesToDb = async (extractedDataList: any[]) => {
        const q = query(collection(db, 'routes'));
        const snapshot = await getDocs(q);
        const existingNames = snapshot.docs.map(doc => String(doc.data().routeName || '').toLowerCase().trim());

        for (const extractedData of extractedDataList) {
            if (!extractedData.routeName || !extractedData.stops || extractedData.stops.length === 0) {
                continue; // Skip invalid routes
            }
            
            let cleanRouteName = extractedData.routeName.replace(/রুট\s*নং/g, 'রুট').replace(/বাস\s*নং/g, 'বাস').replace(/নং\s*/g, '').replace(/\s+/g, ' ').trim();
            if(!cleanRouteName) {
                cleanRouteName = extractedData.routeName; // fallback if it was completely stripped
            }
            
            const checkName = cleanRouteName.toLowerCase().trim();
            if (existingNames.includes(checkName)) {
                console.log(`Skipping duplicate route: ${extractedData.routeName}`);
                continue;
            }

            const routePayload = {
              userId: user.uid,
              routeName: cleanRouteName,
              routeCode: extractedData.routeCode || '',
              stops: extractedData.stops,
              distances: extractedData.distances,
              farePerKm: Number(extractedData.farePerKm) || 2.53,
              minFare: Number(extractedData.minFare) || 10.0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              adminCode: '0011'
            };

            await addDoc(collection(db, 'routes'), routePayload);
            existingNames.push(checkName); // Add to local cache to prevent duplicates within batch
            addedCount++;
        }
        await fetchRoutes(); // Update the UI progressively
      };

      // 1. Extract data from Gemini and save progressively
      const extractedRoutes = await extractRoutesFromDocument(
        file, 
        (msg) => { setProgressMsg(msg); },
        saveRoutesToDb
      );
      
      // 2. Additional validation
      if (!extractedRoutes || !Array.isArray(extractedRoutes) || extractedRoutes.length === 0) {
        throw new Error('Invalid data extracted from document. Make sure the document is clear.');
      }

      setSuccess(`${addedCount} routes added successfully!`);
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred during extraction');
    } finally {
      setExtracting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'routes', id));
      fetchRoutes();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `routes/${id}`);
    }
  };

  const filteredRoutes = routes.filter(r => 
    r.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.routeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.stops?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass-panel p-8 rounded-2xl w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-800 text-center mb-6">Admin Sign In</h2>
          
          <div className="space-y-4">
            <p className="text-sm text-center text-slate-500 mb-4">
              Sign in with your authorized Google account to access the admin panel.
            </p>
            
            {loginError && (
              <p className="text-red-500 text-sm font-medium text-center">{loginError}</p>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-bold transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {editingRoute && (
        <EditRouteModal 
          route={editingRoute} 
          onClose={() => setEditingRoute(null)} 
          onSaved={() => {
            setEditingRoute(null);
            fetchRoutes();
          }} 
        />
      )}
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500">Upload Bus Fare PDFs/Images to add routes database.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 text-slate-800">Upload New Route Table</h2>
        
        <form onSubmit={handleFileUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50/100 transition-colors">
            <input
              type="file"
              accept="image/*,application/pdf"
              id="file-upload"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <FileImage className="h-10 w-10 text-slate-400" />
              <span className="text-sm font-bold text-slate-700">
                {file ? file.name : "Click to select fare table image (JPEG, PNG)"}
              </span>
              <span className="text-xs text-slate-500">
                Gemini will automatically extract stops, distances, and fares.
              </span>
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-700 text-sm rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || extracting}
            className="w-full flex justify-center items-center gap-2 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {extracting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {progressMsg || 'Analyzing with Gemini...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload & Process
              </>
            )}
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                Managed Routes
                <span className="bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full text-xs font-bold">{routes.length}</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExportAuth(true)}
                disabled={routes.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
                title="Download as Excel"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search routes or stops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">Route Code</th>
                <th className="px-6 py-4">Route Name</th>
                <th className="px-6 py-4">Stops Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoutes.map((route, index) => (
                <tr key={route.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-500 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{route.routeCode || '-'}</td>
                  <td className="px-6 py-4 text-slate-700">{route.routeName}</td>
                  <td className="px-6 py-4 text-slate-600">{route.stops?.length || 0}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingRoute(route)}
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="Edit Route"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRoutes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                    {searchTerm ? "No routes matching your search." : "No routes added yet. Upload a fare table to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showExportAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Export Authentication
            </h3>
            <form onSubmit={handleExportSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Enter Password</label>
                <input
                  type="password"
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Password"
                />
              </div>
              {exportError && (
                <p className="text-red-500 text-sm font-medium">{exportError}</p>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowExportAuth(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition-colors"
                >
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
