import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Stethoscope, 
  Plus, 
  Trash2, 
  Printer, 
  LayoutDashboard, 
  Clock, 
  History, 
  Settings, 
  Pill, 
  Save, 
  X, 
  Building, 
  Phone, 
  MapPin, 
  FileBadge, 
  Search, 
  AlertCircle, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  ChevronRight, 
  Activity, 
  QrCode, 
  CheckCircle2, 
  Mail, 
  Eye, 
  EyeOff, 
  Key, 
  ArrowRight, 
  Award, 
  HelpCircle,
  Sun, 
  Moon, 
  Pencil, 
  Download,
  Megaphone,
  AlertTriangle,
  LifeBuoy,
  Globe,
  Database
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  getDocs, 
  query, 
  where, 
  limit,
  onSnapshot,
  addDoc,
  deleteDoc
} from "firebase/firestore";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously 
} from "firebase/auth";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBT93hmr81TT_-KltaYxcYwms_xKxg3c1I",
  authDomain: "medivend-a3d51.firebaseapp.com",
  projectId: "medivend-a3d51",
  storageBucket: "medivend-a3d51.firebasestorage.app",
  messagingSenderId: "743343498567",
  appId: "1:743343498567:web:2d50fb42346f31350d1862"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'medivend-local';

// --- DEFAULT DATABASE ---
const DEFAULT_MEDICINES = [
  { id: 1, name: 'Amoxicillin', dosage: '500mg Cap', price: 15.00 },
  { id: 2, name: 'Paracetamol', dosage: '500mg Tab', price: 5.00 },
  { id: 3, name: 'Ibuprofen', dosage: '200mg Tab', price: 8.00 },
  { id: 4, name: 'Cetirizine', dosage: '10mg Tab', price: 12.50 },
  { id: 5, name: 'Omeprazole', dosage: '20mg Cap', price: 25.00 },
  { id: 6, name: 'Metformin', dosage: '500mg Tab', price: 10.00 },
  { id: 7, name: 'Vitamin C', dosage: '500mg Tab', price: 7.00 },
  { id: 8, name: 'Azithromycin', dosage: '500mg Tab', price: 85.00 },
];

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

function NavButton({ active, onClick, icon, label, isDarkMode }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${active ? 'bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20 shadow-sm' : isDarkMode ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_2px_rgba(99,102,241,0.5)]"></div>}
      {React.cloneElement(icon, { className: `w-5 h-5 transition-colors ${active ? 'text-indigo-500' : isDarkMode ? 'group-hover:text-white' : 'group-hover:text-slate-900'}` })}
      <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50 text-indigo-500" />}
    </button>
  );
}

function NavButtonMobile({ active, onClick, icon, label, isDarkMode }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${active ? 'text-indigo-500 -translate-y-1' : isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
      {active && <div className="absolute -top-2 w-8 h-1 bg-indigo-500 rounded-full shadow-[0_2px_8px_rgba(99,102,241,0.4)]"></div>}
      {React.cloneElement(icon, { className: `w-6 h-6 ${active ? 'fill-current opacity-100' : 'opacity-70'}` })}
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  );
}

function CustomMedicineForm({ onClose, onAdd, initialName }) {
  const [formData, setFormData] = useState({ name: initialName || '', dosage: '', price: '' });
  const handleSubmit = (e) => { e.preventDefault(); if (formData.name) onAdd(formData); };
  return (
    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="font-bold mb-4 uppercase tracking-widest text-sm text-slate-500">Add Custom Item</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Medicine Name</label>
           <input required className="w-full px-4 py-3 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-black placeholder:text-slate-400" placeholder="Enter name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Dosage</label>
           <input required className="w-full px-4 py-3 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-black placeholder:text-slate-400" placeholder="e.g. 500mg Tab" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
        </div>
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Unit Price (₱)</label>
           <input required type="number" className="w-full px-4 py-3 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-black placeholder:text-slate-400" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        </div>
        <div className="flex gap-3 pt-2">
           <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors">Cancel</button>
           <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95">Add Item</button>
        </div>
      </form>
    </div>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = "Confirm", isLoading = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden transform transition-all">
        <div className="p-6 text-center">
           <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
             {type === 'danger' ? <AlertTriangle className="w-7 h-7"/> : <CheckCircle2 className="w-7 h-7"/>}
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
           <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
           <button onClick={onClose} disabled={isLoading} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all disabled:opacity-50">Cancel</button>
           <button onClick={onConfirm} disabled={isLoading} className={`flex-1 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}>
              {isLoading ? 'Processing...' : confirmText}
           </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. SUB-SCREENS
// ==========================================

function AuthScreen({ onAuthSuccess, db, appId }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', license: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState(null); 
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let interval;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (failedAttempts >= 5) {
       setFailedAttempts(0);
       setError('');
    }
    return () => clearInterval(interval);
  }, [lockoutTimer, failedAttempts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setError('');
    setPendingUserEmail(null);
    setIsLoading(true);
    const emailId = formData.email.toLowerCase().trim();

    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', emailId);
      if (isLogin) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = { 
              id: docSnap.id, 
              email: docSnap.data().email || docSnap.id, 
              ...docSnap.data() 
          }; 
          
          if (userData.password === formData.password) {
            if (userData.status === 'active') {
              onAuthSuccess(userData);
              setFailedAttempts(0);
            } else if (userData.status === 'pending') {
              setPendingUserEmail(emailId);
            } else {
              setError("Account rejected or disabled.");
            }
          } else {
            const newCount = failedAttempts + 1;
            setFailedAttempts(newCount);
            if (newCount >= 5) {
                setLockoutTimer(10);
                setError("Maximum attempts reached. Please wait 10s.");
            } else {
                setError(`Incorrect password. ${5 - newCount} attempts remaining.`);
            }
          }
        } else {
          setError(`No account found.`);
        }
      } else {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setError("Account already exists. Please log in.");
        } else {
          const newDoctor = {
            name: formData.name,
            email: emailId,
            password: formData.password,
            license: formData.license,
            status: 'pending',
            clinicDetails: null,
            createdAt: serverTimestamp()
          };
          await setDoc(docRef, newDoctor);
          setPendingUserEmail(emailId);
          setIsLogin(true); 
        }
      }
    } catch (err) {
      console.error(err);
      setError("Connection error. Ensure you are connected to the internet.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] font-sans text-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-black opacity-90"></div>
      <div className="w-full lg:w-1/2 h-full relative z-10 overflow-y-auto no-scrollbar">
        <div className="min-h-full w-full flex flex-col items-center justify-center p-6 md:p-8 lg:p-4 xl:p-12">
          <div className="w-full max-w-md bg-white p-6 md:p-8 lg:p-6 xl:p-10 rounded-3xl shadow-2xl border-4 border-slate-200/20 animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden ring-1 ring-white/10 mb-4 lg:mb-4 xl:mb-6">
            <div className="text-center mb-6 lg:mb-4 xl:mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4 lg:mb-4 transform transition-transform hover:scale-105 ring-4 ring-white">
                <Stethoscope className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h2 className="text-2xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">{isLogin ? 'Welcome Back' : 'Join MediVend'}</h2>
              <p className="text-slate-500 text-xs lg:text-xs xl:text-sm">{isLogin ? 'Enter your credentials to access your dashboard.' : 'Start your digital prescription journey today.'}</p>
            </div>
            {pendingUserEmail && (
              <div className="mb-4 lg:mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Account Pending Approval</p>
                  <p className="mt-1 opacity-90">Your account ({pendingUserEmail}) has been created. Please wait for Super Admin verification.</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-3 xl:space-y-5 relative z-10">
              {!isLogin && (
                <div className="space-y-4 lg:space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="relative group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" /></div>
                      <input required type="text" className="w-full pl-10 pr-4 py-2.5 lg:py-2.5 input-modern rounded-xl outline-none placeholder-slate-400 font-medium" placeholder="Dr. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Medical License</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FileBadge className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" /></div>
                      <input required type="text" className="w-full pl-10 pr-4 py-2.5 lg:py-2.5 input-modern rounded-xl outline-none placeholder-slate-400 font-medium" placeholder="PRC-XXXXXX" value={formData.license} onChange={e => setFormData({...formData, license: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}
              <div className="relative group">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" /></div>
                  <input required type="email" className="w-full pl-10 pr-4 py-2.5 lg:py-2.5 input-modern rounded-xl outline-none placeholder-slate-400 font-medium" placeholder="doctor@hospital.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div className="relative group">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" /></div>
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    className="w-full pl-10 pr-10 py-2.5 lg:py-2.5 input-modern rounded-xl outline-none placeholder-slate-400 font-medium" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer z-10"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2"><AlertCircle className="w-4 h-4" /> {error}</div>}
              <button type="submit" disabled={isLoading || lockoutTimer > 0} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 lg:py-3 rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex justify-center items-center">
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : lockoutTimer > 0 ? `Try again in ${lockoutTimer}s` : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4 ml-2" /></>}
              </button>
            </form>
            <div className="mt-6 lg:mt-4 text-center relative z-10">
              <p className="text-sm text-slate-600">{isLogin ? "Don't have an account?" : "Already have an account?"} <button onClick={() => { setIsLogin(!isLogin); setError(''); setPendingUserEmail(null); setFormData({ name: '', email: '', password: '', license: '' }); }} className="ml-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors hover:underline">{isLogin ? 'Sign up for free' : 'Log in'}</button></p>
            </div>
          </div>
          <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 delay-100">
            <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5"><div className="flex items-center gap-2 mb-1 text-indigo-300 font-bold uppercase tracking-wider"><ShieldCheck className="w-3 h-3"/> App License</div><p className="font-mono text-slate-300">MV-WEB-2026-001</p></div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5"><div className="flex items-center gap-2 mb-1 text-emerald-300 font-bold uppercase tracking-wider"><Award className="w-3 h-3"/> FDA License</div><p className="font-mono text-slate-300">CDRR-NCR-DI-882</p></div>
              <div className="col-span-2 p-2 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center"><div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider"><HelpCircle className="w-3 h-3"/> Customer Service</div><p className="font-mono text-slate-300 flex items-center gap-2 font-bold"><Phone className="w-3 h-3"/> 09273523900</p></div>
            </div>
            <div className="mt-4 text-center text-xs text-slate-500/50"><p>© 2026 MediVend Systems. Secure & Compliant.</p></div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 bg-[#0B0F19] relative overflow-hidden items-center justify-center border-l border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md"><Activity className="w-3 h-3" /> Professional Healthcare Suite</div>
          <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight text-white drop-shadow-sm">Digital Prescriptions <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Reimagined.</span></h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light">Generate secure, trackable prescriptions in seconds. Seamlessly integrated with MediVend kiosks for instant patient fulfillment.</p>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"><Printer className="w-8 h-8 text-emerald-400 mb-3" /><h3 className="font-bold text-white text-sm">Instant Printing</h3><p className="text-xs text-slate-400 mt-1">One-click PDF generation</p></div>
             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"><QrCode className="w-8 h-8 text-blue-400 mb-3" /><h3 className="font-bold text-white text-sm">QR Validation</h3><p className="text-xs text-slate-400 mt-1">Secure dispensing verification</p></div>
             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"><ShieldCheck className="w-8 h-8 text-amber-400 mb-3" /><h3 className="font-bold text-white text-sm">FDA Compliant</h3><p className="text-xs text-slate-400 mt-1">Meets all regulatory standards</p></div>
             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"><History className="w-8 h-8 text-purple-400 mb-3" /><h3 className="font-bold text-white text-sm">Smart History</h3><p className="text-xs text-slate-400 mt-1">Track patient records easily</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({ onComplete, user }) {
  const [details, setDetails] = useState({ name: '', address: '', contactNumber: '', ptr: '', s2: '' });
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Clinic Setup</h2>
        <p className="text-slate-500 mb-6 text-sm">Please provide your clinic details for the prescription header.</p>
        <form onSubmit={(e) => { e.preventDefault(); onComplete(details); }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinic Name</label><input required type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="e.g. City General Hospital" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label><input required type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="Complete Address" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label><input required type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="Tel / Mobile" value={details.contactNumber} onChange={e => setDetails({...details, contactNumber: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">PTR No.</label><input required type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="PTR-XXXXX" value={details.ptr} onChange={e => setDetails({...details, ptr: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">S2 License (Optional)</label><input type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="S2-XXXXX" value={details.s2} onChange={e => setDetails({...details, s2: e.target.value})} /></div>
          <div className="md:col-span-2 mt-4"><button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-all">Save & Continue</button></div>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user, onGenerate, medicineList, onAddCustomMedicine, isDarkMode, patient, setPatient, items, setItems, db, appId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempInstr, setTempInstr] = useState('');
  const [tempDosage, setTempDosage] = useState('');
  const [tempPrice, setTempPrice] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState('editor');
  const [editingId, setEditingId] = useState(null);
  const [broadcast, setBroadcast] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const broadcastsRef = collection(db, 'artifacts', appId, 'public', 'data', 'broadcasts');
    const unsubscribe = onSnapshot(broadcastsRef, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(b => b.active && (b.target === 'all' || b.target === 'doctors')).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      const latestMsg = msgs.length > 0 ? msgs[0] : null;
      if (latestMsg) {
         const dismissedId = localStorage.getItem('medivend_dismissed_broadcast_id');
         if (latestMsg.id !== dismissedId) {
             setBroadcast(latestMsg);
         } else {
             setBroadcast(null);
         }
      } else {
         setBroadcast(null);
      }
    }, (error) => console.error("Broadcast listener error:", error));
    return () => unsubscribe();
  }, []);

  const dismissBroadcast = () => {
    if (broadcast) {
        localStorage.setItem('medivend_dismissed_broadcast_id', broadcast.id);
        setBroadcast(null);
    }
  };

  const filteredMeds = medicineList.filter(m => m && m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectMed = (med) => {
    setSelectedMed(med);
    setSearchQuery(med.name || '');
    // FIX: Master list items might not have dosage, default to empty string to avoid uncontrolled input warning
    setTempDosage(med.dosage || ''); 
    // FIX: Ensure price is a number
    setTempPrice(med.price || 0);
    setIsDropdownOpen(false);
  };

  const handleAddCustomMedicineLocal = (newMed) => {
    const medObject = { id: Date.now(), name: newMed.name, dosage: newMed.dosage, price: parseFloat(newMed.price) };
    onAddCustomMedicine(medObject);
    handleSelectMed(medObject);
    setIsCustomModalOpen(false);
  };

  const addItem = () => {
    if (!selectedMed) return;
    const parsedPrice = parseFloat(tempPrice) || 0;
    const parsedQty = parseInt(tempQty) || 1;
    const newItem = { ...selectedMed, uniqueId: editingId || Date.now(), quantity: parsedQty, dosage: tempDosage, price: parsedPrice, instructions: tempInstr || 'As directed by physician', totalPrice: parsedPrice * parsedQty };
    if (editingId) {
        setItems(items.map(item => item.uniqueId === editingId ? newItem : item));
        setEditingId(null);
    } else {
        setItems([...items, newItem]);
    }
    setSelectedMed(null); setSearchQuery(''); setTempQty(1); setTempInstr(''); setTempDosage(''); setTempPrice(0);
  };

  const startEditing = (item) => {
      setEditingId(item.uniqueId); setSelectedMed(item); setSearchQuery(item.name); setTempQty(item.quantity); setTempDosage(item.dosage); setTempPrice(item.price); setTempInstr(item.instructions); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
      setEditingId(null); setSelectedMed(null); setSearchQuery(''); setTempQty(1); setTempInstr(''); setTempDosage(''); setTempPrice(0);
  };

  const initiateRemoveItem = (id) => {
      if (editingId === id) cancelEdit();
      setItemToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const confirmRemoveItem = () => {
      setItems(items.filter(i => i.uniqueId !== itemToDelete));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
  };

  const handleGenerateClick = () => {
    if (!patient.name || items.length === 0) return;
    const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const uniqueId = `RX-${Math.floor(Math.random() * 1000000)}`; 
    onGenerate({ id: uniqueId, date: new Date().toLocaleDateString(), patient, items, grandTotal, qrValue: JSON.stringify({ app: 'medivend', id: uniqueId, ver: '1' }) });
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden relative bg-transparent">
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmRemoveItem} title="Remove Item?" message="Are you sure you want to remove this medicine from the prescription?" confirmText="Remove" type="danger"/>
      <div className={`md:hidden no-print flex border-b shrink-0 sticky top-0 z-30 ${isDarkMode ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
        <button onClick={() => setMobileView('editor')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileView === 'editor' ? 'text-indigo-500 border-b-2 border-indigo-500 bg-indigo-50/10' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><LayoutDashboard className="w-4 h-4" /> Editor</button>
        <button onClick={() => setMobileView('preview')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileView === 'preview' ? 'text-indigo-500 border-b-2 border-indigo-500 bg-indigo-50/10' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><Eye className="w-4 h-4" /> Live Preview</button>
      </div>

      <div className={`md:block w-full md:w-3/5 p-4 md:p-8 overflow-y-auto border-r h-full ${mobileView === 'editor' ? 'block' : 'hidden'} ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        {broadcast && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2 ${broadcast.priority === 'high' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
            <Megaphone className={`w-5 h-5 mt-0.5 shrink-0 ${broadcast.priority === 'high' ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
            <div className="flex-1">
              <h4 className={`text-sm font-bold uppercase tracking-wide mb-1 ${broadcast.priority === 'high' ? 'text-red-900' : 'text-blue-900'}`}>{broadcast.priority === 'high' ? 'System Alert' : 'System Message'}</h4>
              <p className="text-sm opacity-90 leading-relaxed">{broadcast.message}</p>
              <p className="text-[10px] mt-2 opacity-70 font-mono">{broadcast.timestamp?.seconds ? new Date(broadcast.timestamp.seconds * 1000).toLocaleString() : 'Just now'} • from Super Admin</p>
            </div>
            <button onClick={dismissBroadcast} className={`p-1 rounded-lg transition-colors ${broadcast.priority === 'high' ? 'hover:bg-red-100 text-red-600' : 'hover:bg-blue-100 text-blue-600'}`}><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className={`p-4 md:p-6 rounded-2xl border shadow-sm mb-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}><div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}><User className="w-4 h-4 text-indigo-600" /></div>Patient Details</h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label><input type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none transition-all" placeholder="Enter patient name" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} /></div>
            <div className="col-span-6 md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label><input type="number" min="1" className="w-full px-4 py-3 input-modern rounded-xl outline-none transition-all" placeholder="00" value={patient.age} onChange={e => { const val = e.target.value; if (val === '' || parseInt(val) >= 1) { setPatient({...patient, age: val}); } }} /></div>
            <div className="col-span-6 md:col-span-3"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sex</label><select className="w-full px-4 py-3 input-modern rounded-xl outline-none transition-all" value={patient.sex} onChange={e => setPatient({...patient, sex: e.target.value})}><option>Male</option><option>Female</option></select></div>
          </div>
        </div>

        <div className={`p-4 md:p-6 rounded-2xl border shadow-sm min-h-[400px] ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}><div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}><Pill className="w-4 h-4 text-emerald-600" /></div>{editingId ? 'Edit Medicine' : 'Prescribe Medicine'}</h3>
            <button onClick={() => setIsCustomModalOpen(true)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${isDarkMode ? 'text-indigo-400 bg-indigo-900/30 hover:bg-indigo-900/50' : 'text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100'}`}><Plus className="w-3 h-3" /> Custom Item</button>
          </div>

          <div className={`p-4 md:p-5 rounded-xl border mb-6 relative group focus-within:border-indigo-300 focus-within:shadow-md transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/50 border-slate-200'} ${editingId ? 'ring-2 ring-indigo-500/20' : ''}`}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine Name</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input type="text" className={`w-full pl-9 pr-3 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} placeholder="Search database..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); if (!e.target.value) setSelectedMed(null); }} onFocus={() => setIsDropdownOpen(true)} />
                </div>
                {isDropdownOpen && searchQuery && !selectedMed && (
                  <div className={`absolute z-50 w-full mt-2 border rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    {filteredMeds.length === 0 ? (
                      <div onClick={() => setIsCustomModalOpen(true)} className={`p-4 text-sm cursor-pointer font-medium flex items-center gap-2 ${isDarkMode ? 'text-indigo-400 hover:bg-slate-700' : 'text-indigo-600 hover:bg-indigo-50'}`}><Plus className="w-4 h-4" /> Add "{searchQuery}" as custom medicine</div>
                    ) : (
                      filteredMeds.map(med => (
                        <div key={med.id} onClick={() => handleSelectMed(med)} className={`p-3 cursor-pointer border-b last:border-0 transition-colors ${isDarkMode ? 'hover:bg-slate-700 border-slate-700' : 'hover:bg-slate-50 border-slate-50'}`}>
                          <div className={`font-medium text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {med.name}
                            {med.isMaster && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-bold uppercase tracking-wider">Global</span>}
                          </div>
                          <div className="text-xs text-slate-500 flex justify-between mt-1">
                            <span className={`px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{med.dosage}</span>
                            <span className="font-bold text-emerald-600">₱{med.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="col-span-6 md:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label><input type="number" min="1" className={`w-full px-3 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`} value={tempQty} onChange={e => setTempQty(e.target.value)} /></div>
              <div className="col-span-6 md:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dosage</label><input type="text" className={`w-full px-3 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g. 500mg" value={tempDosage} onChange={e => setTempDosage(e.target.value)} disabled={!selectedMed} /></div>
              <div className="col-span-6 md:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit Price (₱)</label><input type="number" min="0" step="0.25" className={`w-full px-3 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`} value={tempPrice} onChange={e => setTempPrice(e.target.value)} disabled={!selectedMed} /></div>
              <div className="col-span-12 md:col-span-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructions</label><input type="text" className={`w-full px-3 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200'}`} placeholder="e.g. 1 tab after meals" value={tempInstr} onChange={e => setTempInstr(e.target.value)} /></div>
              <div className="col-span-12 flex gap-3">
                {editingId && (<button onClick={cancelEdit} className={`flex-1 py-3.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>)}
                <button onClick={addItem} disabled={!selectedMed} className={`flex-[2] py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] ${!selectedMed ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : editingId ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/20' : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:shadow-slate-500/20'}`}>{editingId ? <><Save className="w-4 h-4" /> Update Item</> : <><Plus className="w-4 h-4" /> Add to List</>}</button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-8">
            {items.length === 0 ? (
              <div className={`text-center py-16 border-2 border-dashed rounded-2xl ${isDarkMode ? 'border-slate-700 bg-slate-800/50 text-slate-500' : 'border-slate-200 bg-slate-50/30 text-slate-400'}`}>
                <div className="mb-2 font-medium">No medicines added yet</div>
                <div className="text-xs opacity-70">Search above to begin building the prescription</div>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={item.uniqueId} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border shadow-sm transition-all group ${editingId === item.uniqueId ? 'border-blue-500 ring-1 ring-blue-500/20' : isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 transition-colors ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300 group-hover:bg-indigo-900/50 group-hover:text-indigo-400' : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>{index + 1}</div>
                    <div className="min-w-0">
                      <div className={`font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{item.name}</div>
                      <div className="text-sm text-slate-500 flex gap-2 items-center flex-wrap mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${isDarkMode ? 'bg-indigo-900/30 text-indigo-300 border-indigo-900/50' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{item.dosage}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>₱{item.price.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-slate-400 italic mt-1 truncate max-w-[200px]">{item.instructions}</div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-1 sm:gap-2 shrink-0">
                    <div className="mr-1 sm:mr-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Qty: {item.quantity}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:hidden">x{item.quantity}</div>
                      <div className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>₱{item.totalPrice.toFixed(2)}</div>
                    </div>
                    <button onClick={() => startEditing(item)} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-500 hover:bg-blue-50'}`}><Pencil className="w-5 h-5" /></button>
                    {/* UPDATED: Uses Modal via state */}
                    <button onClick={() => initiateRemoveItem(item.uniqueId)} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-900/20' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW PANE */}
      <div className={`md:flex flex-col no-print w-full md:w-2/5 md:border-l h-full ${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex ${isDarkMode ? 'bg-[#0B0F19] border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-4 md:p-6 border-b ${isDarkMode ? 'bg-[#0B0F19] border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><FileText className="w-5 h-5 text-indigo-500" /> Live Preview</h3>
        </div>
        <div className={`flex-1 overflow-y-auto p-4 md:p-6 flex justify-center ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-slate-50'}`}>
          <div className="bg-white text-slate-800 w-full max-w-md shadow-2xl border border-slate-200 p-6 md:p-10 min-h-[600px] text-sm relative transition-all duration-500 ease-in-out transform hover:scale-[1.01] ring-1 ring-black/5">
            <div className="absolute inset-0 bg-white opacity-50 pointer-events-none mix-blend-multiply"></div>
            <div className="border-b-2 border-slate-900 pb-6 mb-8 relative z-10">
              <h1 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-widest text-slate-900">{user?.clinicDetails?.name || 'Clinic Name'}</h1>
              <p className="text-xs text-slate-600 whitespace-pre-line mt-2 font-serif">{user?.clinicDetails?.address || 'Clinic Address'}</p>
              <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs space-y-1 font-serif text-slate-800">
                  <p><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Patient:</span> <span className="text-base font-semibold">{patient.name || '___________'}</span></p>
                  <p><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Age/Sex:</span> {patient.age || '__'} / {patient.sex}</p>
                  <p><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Date:</span> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="font-serif relative z-10">
              <div className="text-5xl font-bold text-slate-200 mb-6 italic font-serif">Rx</div>
              <div className="space-y-6">
                {items.length === 0 ? (<p className="text-slate-300 italic text-center py-20">List is empty...</p>) : (
                  items.map((item, idx) => (
                    <div key={item.uniqueId} className="border-b border-slate-100 pb-3 mb-2 last:border-0">
                      <div className="flex justify-between font-bold text-slate-900 text-lg">
                        <span>{item.name} <span className="text-sm font-normal text-slate-500 ml-2">{item.dosage}</span></span>
                        <span>#{item.quantity}</span>
                      </div>
                      <div className="text-sm italic text-slate-600 pl-4 mt-1">Sig: {item.instructions}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="absolute bottom-8 left-8 right-8 border-t border-slate-900 pt-4 flex justify-between items-end z-10">
              <div className="text-[9px] text-slate-400 font-sans w-1/2 leading-tight"><p>This prescription is digitally verified. Valid for dispensing at any MediVend Kiosk or licensed pharmacy.</p></div>
              <div className="text-center w-40">
                  <div className="h-0.5 bg-slate-900 w-full mb-2"></div>
                  <p className="font-bold uppercase text-slate-900 text-xs tracking-wide">{user?.name}</p>
                  <div className="text-[9px] uppercase text-slate-500 font-bold tracking-widest">Lic No: {user?.license}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={`p-4 md:p-6 border-t pb-24 md:pb-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-[#0B0F19] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 font-medium text-sm uppercase tracking-wide">Total Estimated Cost</span>
            <span className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>₱{items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)}</span>
          </div>
          <button onClick={handleGenerateClick} disabled={items.length === 0 || !patient.name} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98]"><Printer className="w-6 h-6" /> Generate Prescription</button>
        </div>
      </div>

      {isCustomModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <CustomMedicineForm onClose={() => setIsCustomModalOpen(false)} onAdd={handleAddCustomMedicineLocal} initialName={searchQuery} />
        </div>
      )}
    </div>
  );
}

function PrescriptionView({ data, doctor, onBack, onNew, onCancel }) {
  if (!data) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qrValue)}`;

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden print:bg-white print:overflow-visible">
      {/* TOOLBAR HIDDEN ON PRINT - Added relative z-30 to ensure clickability */}
      <div className="no-print bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm shrink-0 gap-4 md:gap-0 relative z-30">
        <button type="button" onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors self-start md:self-auto">
          <LayoutDashboard className="w-4 h-4" /> <span className="hidden md:inline">Back to Editor</span> <span className="md:hidden">Back</span>
        </button>
        <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="text-xs md:text-sm text-slate-500 mr-2 md:mr-4 hidden sm:block whitespace-nowrap">ID: <span className="font-mono font-bold text-slate-800">{data.id}</span></div>
          <button type="button" onClick={onCancel} className="bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 font-bold shadow-sm transition-all active:scale-95 text-xs md:text-base whitespace-nowrap"><X className="w-3.5 h-3.5 md:w-4 md:h-4" /> Cancel</button>
          <button type="button" onClick={onNew} className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 font-bold shadow-sm transition-all active:scale-95 text-xs md:text-base whitespace-nowrap"><Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> New Rx</button>
          <button type="button" onClick={() => window.print()} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 font-bold shadow-sm transition-all active:scale-95 text-xs md:text-base"><Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">PDF</span></button>
          <button type="button" onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95 text-xs md:text-base"><Printer className="w-3.5 h-3.5 md:w-4 md:h-4" /> Print</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center print:p-0 print:block">
        <div className="printable-wrapper bg-white w-full max-w-2xl shadow-2xl p-6 md:p-12 relative text-slate-900 font-serif border border-slate-100">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"><div className="rx-watermark text-[8rem] md:text-[10rem] font-bold text-slate-200/50 font-sans italic select-none">Rx</div></div>
          <div className="printable-content relative z-10">
            <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-slate-900 leading-tight">{doctor?.clinicDetails?.name || 'Clinic Name'}</h1>
                <div className="mt-2 text-sm text-slate-600 font-sans space-y-0.5">
                  <p>{doctor?.clinicDetails?.address}</p>
                  <p>Tel: {doctor?.clinicDetails?.contactNumber}</p>
                  <p>PTR: {doctor?.clinicDetails?.ptr}</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-slate-900 p-1 inline-block"><img src={qrUrl} alt="Rx QR" className="w-full h-full object-cover" /></div>
                <p className="text-[10px] font-mono mt-1 text-slate-500 tracking-wider font-bold">{data.id}</p>
              </div>
            </div>

            <div className="mb-8 font-sans grid grid-cols-2 gap-y-2 text-sm border-b border-slate-200 pb-6">
              <div><span className="font-bold text-slate-500 uppercase text-xs">Patient Name</span><br/><span className="text-lg font-semibold">{data.patient.name}</span></div>
              <div className="text-right"><span className="font-bold text-slate-500 uppercase text-xs">Date Issued</span><br/><span className="text-lg font-semibold">{data.date}</span></div>
              <div><span className="font-bold text-slate-500 uppercase text-xs">Age / Sex</span><br/><span>{data.patient.age} / {data.patient.sex}</span></div>
              <div className="text-right"><span className="font-bold text-slate-500 uppercase text-xs">Physician</span><br/><span className="uppercase font-bold">{doctor?.name}</span></div>
            </div>

            <div className="min-h-[400px] print-min-h-reset relative">
              <table className="w-full text-left border-collapse relative z-10">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-[10px] font-bold uppercase text-slate-900 tracking-wider font-sans bg-slate-50/50">
                    <th className="py-2 px-1">Medicine Description</th>
                    <th className="py-2 px-1 text-center">Dosage</th>
                    <th className="py-2 px-1 text-center">Qty</th>
                    <th className="py-2 px-1 text-right">Instructions</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-sm">
                  {data.items.map((item) => (
                    <tr key={item.uniqueId} className="border-b border-slate-100">
                      <td className="py-4 px-1 align-top font-bold text-lg text-slate-900">{item.name}</td>
                      <td className="py-4 px-1 align-top text-center text-slate-600 font-medium">{item.dosage}</td>
                      <td className="py-4 px-1 align-top text-center font-bold text-lg">#{item.quantity}</td>
                      <td className="py-4 px-1 align-top text-right italic text-slate-600 max-w-[200px]">{item.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="printable-footer flex justify-between items-end bg-white relative z-10">
            <div className="text-[10px] text-slate-400 font-sans w-1/2 leading-snug italic"><p>This document is digitally signed. Valid for dispensing at any MediVend Kiosk or licensed pharmacy.</p></div>
            <div className="text-center w-64"><div className="h-[2px] bg-slate-900 w-full mb-2"></div><p className="font-bold uppercase text-sm text-slate-900 tracking-tighter">{doctor?.name}</p><div className="text-[9px] uppercase text-slate-500 font-bold tracking-widest">Lic No: {doctor?.license}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MedicineManager({ medicines, onAdd, onDelete, isDarkMode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchQuery] = useState('');
   
  // MODAL STATES
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const initiateDelete = (id) => {
      setItemToDelete(id);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
      onDelete(itemToDelete);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
  };

  return (
    <div className={`p-4 md:p-8 h-full overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto">
        <ConfirmationModal 
            isOpen={isDeleteModalOpen} 
            onClose={() => setIsDeleteModalOpen(false)} 
            onConfirm={confirmDelete} 
            title="Remove Medicine?" 
            message="Are you sure you want to remove this medicine from your list? If this is a global item, it will be hidden from your view but not deleted from the system." 
            confirmText="Remove" 
            type="danger" 
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input type="text" className={`w-full sm:w-64 pl-9 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 placeholder-slate-400'}`} placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Add Medicine
          </button>
        </div>
        <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className={`border-b text-xs uppercase font-bold tracking-wider ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <th className="px-6 py-4">Medicine Name</th><th className="px-6 py-4">Dosage</th><th className="px-6 py-4">Unit Price</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {filtered.length === 0 ? (<tr><td colSpan="4" className="p-12 text-center text-slate-400">No medicines found.</td></tr>) : (
                filtered.map(med => (
                  <tr key={med.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                    <td className={`px-6 py-4 font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        <div className="flex items-center gap-2">
                            {med.name}
                            {med.isMaster && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[9px] uppercase font-bold tracking-wider border border-blue-200">Global</span>}
                        </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}><span className={`px-2.5 py-1 rounded text-xs border font-medium ${isDarkMode ? 'bg-indigo-900/30 text-indigo-300 border-indigo-900/50' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>{med.dosage}</span></td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">₱{med.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => initiateDelete(med.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-900/20' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`} title="Delete"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className={`md:hidden divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {filtered.length === 0 ? (<div className="p-8 text-center text-slate-400">No medicines found.</div>) : (
               filtered.map(med => (
                 <div key={med.id} className={`p-4 flex flex-col gap-3 transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                    <div className="flex justify-between items-start">
                       <div>
                           <div className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                               {med.name}
                               {med.isMaster && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[9px] uppercase font-bold tracking-wider border border-blue-200">Global</span>}
                           </div>
                           <div className={`text-sm mt-2 inline-block px-2 py-0.5 rounded border font-medium ${isDarkMode ? 'bg-indigo-900/30 text-indigo-300 border-indigo-900/50' : 'text-slate-500 bg-indigo-50 text-indigo-700 border-indigo-100'}`}>{med.dosage}</div>
                       </div>
                       <div className="text-lg font-bold text-emerald-600">₱{med.price.toFixed(2)}</div>
                    </div>
                    <button onClick={() => initiateDelete(med.id)} className={`mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold active:scale-95 transition-all border ${isDarkMode ? 'text-rose-400 bg-rose-900/10 border-rose-900/30 hover:bg-rose-900/30' : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-100'}`}><Trash2 className="w-4 h-4" /> Remove Item</button>
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <CustomMedicineForm onClose={() => setIsModalOpen(false)} onAdd={(med) => { onAdd(med); setIsModalOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function HistoryView({ user, isDarkMode, hiddenIds, onHide }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
   
  // MODAL STATES
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null); 
   
  useEffect(() => {
    // REMOVED limit(50) to ensure newest record is always fetched
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'prescriptions'), where('doctorEmail', '==', user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // FIX: Handle pending writes (null timestamps) by treating them as "now"
      records.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.now();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.now();
          return timeB - timeA;
      });

      setHistory(records);
      setLoading(false);
    }, (error) => { console.error("History fetch error:", error); setLoading(false); });
    return () => unsubscribe();
  }, [user.email]);

  const initiateRemove = (id) => {
     setDeleteAction({ type: 'single', id });
     setIsDeleteModalOpen(true);
  };

  const initiateClearAll = () => {
     setDeleteAction({ type: 'all' });
     setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
     if (deleteAction.type === 'single') {
         onHide([deleteAction.id]);
     } else if (deleteAction.type === 'all') {
         const allCurrentIds = history.map(h => h.id);
         onHide(allCurrentIds);
     }
     setIsDeleteModalOpen(false);
     setDeleteAction(null);
  };
   
  const visibleHistory = history.filter(record => !hiddenIds.includes(record.id));

  return (
    <div className={`p-4 md:p-8 h-full overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <ConfirmationModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={confirmDelete} 
          title={deleteAction?.type === 'all' ? "Clear History?" : "Remove Record?"} 
          message={deleteAction?.type === 'all' ? "Are you sure you want to clear ALL records from your local view? This does not delete them from the database." : "Are you sure you want to remove this record from your view? Note: This only hides it from the list; the record remains in the database."} 
          confirmText={deleteAction?.type === 'all' ? "Clear All" : "Remove"} 
          type="danger" 
      />

      <div className={`max-w-6xl mx-auto rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <span className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Recent Activity</span>
            {visibleHistory.length > 0 && (<button onClick={initiateClearAll} className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${isDarkMode ? 'border-rose-900/30 text-rose-400 hover:bg-rose-900/20' : 'border-rose-100 text-rose-600 hover:bg-rose-50'}`}><Trash2 className="w-3.5 h-3.5" /> Clear View</button>)}
        </div>
        <table className="w-full text-left text-sm hidden md:table">
          <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}><tr><th className="px-6 py-4">Date Issued</th><th className="px-6 py-4">Patient Name</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 text-center">Action</th></tr></thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {loading ? (<tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">Syncing...</td></tr>) : visibleHistory.length === 0 ? (<tr><td colSpan="4" className="p-12 text-center text-slate-400 italic">No recent activity found in this session.</td></tr>) : (visibleHistory.map(r => (<tr key={r.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><td className={`px-6 py-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{r.date}</td><td className={`px-6 py-4 font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{r.patient.name}</td><td className="px-6 py-4 text-right font-bold text-emerald-600">₱{r.grandTotal.toFixed(2)}</td><td className="px-6 py-4 text-center"><button onClick={() => initiateRemove(r.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-900/20' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`} title="Hide from list"><Trash2 className="w-4 h-4" /></button></td></tr>)))}
          </tbody>
        </table>
        <div className={`md:hidden divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {loading ? (<div className="p-8 text-center text-slate-400 italic">Syncing...</div>) : visibleHistory.length === 0 ? (<div className="p-8 text-center text-slate-400 italic">No recent activity found.</div>) : (visibleHistory.map(r => (<div key={r.id} className={`p-4 flex items-center justify-between transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><div><div className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{r.patient.name}</div><div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{r.date}</div></div><div className="flex items-center gap-4"><span className="font-bold text-emerald-600">₱{r.grandTotal.toFixed(2)}</span><button onClick={() => initiateRemove(r.id)} className={`p-3 rounded-lg transition-colors border ${isDarkMode ? 'text-rose-400 border-rose-900/30 bg-rose-900/10 active:bg-rose-900/30' : 'text-rose-600 border-rose-100 bg-rose-50 active:bg-rose-100'}`} title="Hide"><Trash2 className="w-5 h-5" /></button></div></div>)))}
        </div>
      </div>
    </div>
  );
}

// ... SettingsView and SupportView remain unchanged ...
// They are re-included implicitly because I am updating the main App flow
function SettingsView({ user, onUpdateUser, isDarkMode }) {
  // ... existing implementation ...
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [profileData, setProfileData] = useState({ name: user.name || '', license: user.license || '', email: user.email || '' });
  const [clinicData, setClinicData] = useState({ name: user.clinicDetails?.name || '', address: user.clinicDetails?.address || '', contactNumber: user.clinicDetails?.contactNumber || '', ptr: user.clinicDetails?.ptr || '', s2: user.clinicDetails?.s2 || '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const showNotification = (message, type = 'success') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 3000); };
  const handleSaveProfile = async () => { setIsLoading(true); try { const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email); await updateDoc(doctorRef, { name: profileData.name, license: profileData.license }); onUpdateUser({ ...user, ...profileData }); showNotification("Profile updated successfully."); } catch (e) { showNotification(e.message, 'error'); } setIsLoading(false); };
  const handleSaveClinic = async () => { setIsLoading(true); try { const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email); await updateDoc(doctorRef, { clinicDetails: clinicData }); onUpdateUser({ ...user, clinicDetails: clinicData }); showNotification("Clinic details updated successfully."); } catch (e) { showNotification(e.message, 'error'); } setIsLoading(false); };
  const handleSavePassword = async () => { if (passwordData.new !== passwordData.confirm) return showNotification("New passwords do not match.", 'error'); if (passwordData.current !== user.password) return showNotification("Current password is incorrect.", 'error'); setIsLoading(true); try { const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email); await updateDoc(doctorRef, { password: passwordData.new }); onUpdateUser({ ...user, password: passwordData.new }); setPasswordData({ current: '', new: '', confirm: '' }); showNotification("Password changed successfully."); } catch (e) { showNotification(e.message, 'error'); } setIsLoading(false); };

  return (
    <div className={`p-4 md:p-8 h-full overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8"><h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Settings</h1><p className="text-slate-500">Manage your account and clinic preferences.</p></div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
           <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}><User className="w-4 h-4" /> My Profile</button>
           <button onClick={() => setActiveTab('clinic')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'clinic' ? 'bg-indigo-600 text-white shadow-md' : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}><Building className="w-4 h-4" /> Clinic Details</button>
           <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}><Lock className="w-4 h-4" /> Security</button>
        </div>
        <div className={`rounded-2xl border shadow-sm p-6 md:p-8 relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
           {notification && (<div className={`absolute top-0 left-0 right-0 p-3 text-center text-sm font-bold ${notification.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{notification.message}</div>)}
           {activeTab === 'profile' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`flex items-center gap-4 border-b pb-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}><div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>{profileData.name.charAt(0)}</div><div><h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Personal Information</h3><p className="text-slate-500 text-sm">Update your public profile information.</p></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label><div className="relative"><User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} placeholder="Dr. Full Name" /></div></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label><div className="relative opacity-60 cursor-not-allowed"><Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input disabled className={`w-full pl-9 pr-3 py-3 border rounded-xl shadow-inner ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200'}`} value={profileData.email} /></div></div>
                   <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">License Number</label><div className="relative"><FileBadge className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={profileData.license} onChange={e => setProfileData({...profileData, license: e.target.value})} placeholder="PRC-XXXXXX" /></div></div>
                </div>
                <div className="pt-4 flex justify-end"><button onClick={handleSaveProfile} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-70 transition-all active:scale-95">{isLoading ? 'Saving...' : 'Save Profile'}</button></div>
             </div>
           )}
           {activeTab === 'clinic' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`border-b pb-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}><h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Clinic Information</h3><p className="text-slate-500 text-sm">This information appears on your prescription header.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Clinic / Hospital Name</label><div className="relative"><Building className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={clinicData.name} onChange={e => setClinicData({...clinicData, name: e.target.value})} placeholder="e.g. St. Luke's Medical Center" /></div></div>
                   <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Address</label><div className="relative"><MapPin className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={clinicData.address} onChange={e => setClinicData({...clinicData, address: e.target.value})} placeholder="Unit, Building, Street, City" /></div></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contact Number</label><div className="relative"><Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={clinicData.contactNumber} onChange={e => setClinicData({...clinicData, contactNumber: e.target.value})} placeholder="(02) 8-7000" /></div></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PTR Number</label><div className="relative"><FileText className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={clinicData.ptr} onChange={e => setClinicData({...clinicData, ptr: e.target.value})} placeholder="PTR-XXXXXX" /></div></div>
                   <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">S2 License (Optional)</label><div className="relative"><ShieldCheck className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={clinicData.s2} onChange={e => setClinicData({...clinicData, s2: e.target.value})} placeholder="S2-XXXXXX" /></div></div>
                </div>
                <div className="pt-4 flex justify-end"><button onClick={handleSaveClinic} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-70 transition-all active:scale-95">{isLoading ? 'Saving...' : 'Update Clinic'}</button></div>
             </div>
           )}
           {activeTab === 'security' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`border-b pb-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}><h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Security Settings</h3><p className="text-slate-500 text-sm">Update your password to keep your account safe.</p></div>
                <div className="max-w-md mx-auto space-y-5 py-4">
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Current Password</label><div className="relative"><Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="password" className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} placeholder="••••••••" /></div></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Password</label><div className="relative"><Key className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="password" className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} placeholder="New secure password" /></div></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Confirm New Password</label><div className="relative"><CheckCircle2 className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="password" className={`w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`} value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} placeholder="Repeat new password" /></div></div>
                   <div className="pt-2"><button onClick={handleSavePassword} disabled={isLoading || !passwordData.current || !passwordData.new} className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg disabled:opacity-70 transition-all active:scale-95">{isLoading ? 'Updating...' : 'Change Password'}</button></div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function SupportView({ user, isDarkMode, db, appId }) {
  // ... existing implementation ...
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', priority: 'normal', message: '' });
   
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deletedTicketIds, setDeletedTicketIds] = useState(() => {
    const saved = localStorage.getItem('medivend_deleted_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'support_tickets'),
      where('doctorEmail', '==', user.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setTickets(list);
    });
    return () => unsubscribe();
  }, [user.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'support_tickets'), {
        ...newTicket,
        status: 'open',
        sender: user.name,
        doctorEmail: user.email,
        timestamp: serverTimestamp(),
        type: 'doctor_issue'
      });
      setIsModalOpen(false);
      setNewTicket({ subject: '', priority: 'normal', message: '' });
      alert("Ticket submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit ticket.");
    }
  };

  const confirmDeleteTicket = () => {
      const newDeletedIds = [...deletedTicketIds, ticketToDelete];
      setDeletedTicketIds(newDeletedIds);
      localStorage.setItem('medivend_deleted_tickets', JSON.stringify(newDeletedIds));
      setIsDeleteModalOpen(false);
      setTicketToDelete(null);
  };
   
  const initiateDeleteTicket = (id) => {
      setTicketToDelete(id);
      setIsDeleteModalOpen(true);
  }

  const visibleTickets = tickets.filter(t => !deletedTicketIds.includes(t.id));

  return (
    <div className={`p-4 md:p-8 h-full overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
       <ConfirmationModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={confirmDeleteTicket} 
          title="Delete Ticket?" 
          message="This will hide the ticket from your view. The admin will still have a record of it." 
          confirmText="Delete" 
          type="danger" 
      />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Support Tickets</h1>
            <p className="text-slate-500">Track status of your help requests.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
            <Plus className="w-4 h-4"/> New Ticket
          </button>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className={`hidden md:block rounded-xl border overflow-hidden shadow-sm ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <table className={`w-full text-left ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600'}`}>
                <thead className={`text-xs uppercase font-bold border-b ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                    <tr>
                        <th className="px-6 py-4">Ticket Subject</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                    {visibleTickets.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center italic opacity-70">No tickets found.</td></tr>
                    ) : (
                        visibleTickets.map(t => (
                            <tr key={t.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                                <td className="px-6 py-4">
                                    <div className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{t.subject}</div>
                                    <div className="text-xs opacity-70 truncate max-w-[200px]">{t.message}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${t.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-blue-500/10 text-blue-500'}`}>{t.priority}</span>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {t.status ? t.status.replace('_', ' ') : 'open'}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono opacity-70">
                                    {t.timestamp?.seconds ? new Date(t.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => initiateDeleteTicket(t.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-900/20' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}><Trash2 className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden space-y-3">
          {visibleTickets.length === 0 ? (
            <div className="text-center p-8 text-slate-400 italic border-2 border-dashed rounded-xl border-slate-700">No support tickets found.</div>
          ) : (
            visibleTickets.map(t => (
              <div key={t.id} className={`p-4 rounded-xl border flex justify-between items-start ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.subject}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${t.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-blue-500/10 text-blue-500'}`}>{t.priority}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{t.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{t.timestamp?.seconds ? new Date(t.timestamp.seconds * 1000).toLocaleString() : 'Just now'}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : t.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {t.status ? t.status.replace('_', ' ') : 'open'}
                  </span>
                  <button onClick={() => initiateDeleteTicket(t.id)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-900/20' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`} title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Submit New Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                <input required className="w-full p-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 mt-1 bg-white text-slate-900 placeholder:text-slate-400" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} placeholder="Brief summary of issue" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                <select className="w-full p-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 mt-1 bg-white text-slate-900" value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})}>
                  <option value="low">Low - General Question</option>
                  <option value="normal">Normal - Standard Issue</option>
                  <option value="high">High - Urgent / Blocker</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                <textarea required rows="4" className="w-full p-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 mt-1 bg-white text-slate-900 placeholder:text-slate-400" value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} placeholder="Describe the issue in detail..." />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-sm hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/30">Submit Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. MAIN APP COMPONENT (Entry Point)
// ==========================================

export default function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [user, setUser] = useState(null); 
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [personalMedicines, setPersonalMedicines] = useState(DEFAULT_MEDICINES);
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [hiddenMasterIds, setHiddenMasterIds] = useState([]); // Array of IDs hidden by this specific doctor
  const [hiddenHistoryIds, setHiddenHistoryIds] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- STATE LIFTED UP: Persists between Editor and Preview ---
  const [patient, setPatient] = useState({ name: '', age: '', sex: 'Male' });
  const [items, setItems] = useState([]);

  // --- MODAL STATES ---
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for loading indicator

  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error("Auth failed:", err));
    const unsubscribe = onAuthStateChanged(auth, () => {});
    return () => unsubscribe();
  }, []);

  // --- NEW: LISTEN TO MASTER INVENTORY ---
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'medicines'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        // Tag these items as coming from Master
        const masters = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(), 
            isMaster: true 
        }));
        setMasterMedicines(masters);
    }, (error) => console.error("Master inventory sync failed:", error));
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    
    // 1. LOAD PERSONAL INVENTORY
    if (userData.savedInventory && Array.isArray(userData.savedInventory) && userData.savedInventory.length > 0) {
      const validItems = userData.savedInventory.filter(item => item && item.name && item.price);
      setPersonalMedicines(validItems.length > 0 ? validItems : DEFAULT_MEDICINES);
    } else {
      setPersonalMedicines(DEFAULT_MEDICINES);
    }

    // 2. LOAD HIDDEN MASTER ITEMS (User's deletion preference)
    if (userData.hiddenMasterItems && Array.isArray(userData.hiddenMasterItems)) {
        setHiddenMasterIds(userData.hiddenMasterItems);
    }

    // 3. LOAD HIDDEN HISTORY (New Persistent Feature)
    if (userData.hiddenHistory && Array.isArray(userData.hiddenHistory)) {
        setHiddenHistoryIds(userData.hiddenHistory);
    } else {
        setHiddenHistoryIds([]);
    }

    try {
      if (userData.id || userData.email) {
        const doctorId = userData.id || userData.email;
        const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', doctorId);
        updateDoc(doctorRef, { lastLogin: serverTimestamp() }).catch(e => console.warn("Login timestamp failed:", e));
      }
    } catch (e) {
      console.log("Login timestamp skipped:", e.message);
    }
    
    // VIEW ROUTING
    if (userData.status === 'active' && !userData.clinicDetails) {
      setCurrentView('onboarding');
    } else if (userData.status === 'active') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('auth');
    }
  };

  const handleOnboardingComplete = async (details) => {
    const updatedUser = { ...user, clinicDetails: details };
    setUser(updatedUser);
    try {
        const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
        await setDoc(doctorRef, { clinicDetails: details }, { merge: true });
    } catch (e) {
      console.error("Error saving clinic details:", e);
    }
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleAddMedicine = async (newMed) => {
    const medObject = {
      id: newMed.id || Date.now(), 
      name: newMed.name,
      dosage: newMed.dosage,
      price: parseFloat(newMed.price)
    };
    
    const newList = [...personalMedicines, medObject];
    setPersonalMedicines(newList);

    if (user && (user.id || user.email)) {
      try {
        const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
        await updateDoc(doctorRef, { savedInventory: newList });
      } catch (e) {
        console.error("Failed to save inventory:", e);
      }
    }
  };

  const handleDeleteMedicine = async (id) => {
    // Check if this is a Master Item
    const isMasterItem = masterMedicines.some(m => m.id === id);

    if (isMasterItem) {
        // SOFT DELETE: Add to hidden list
        const newHiddenList = [...hiddenMasterIds, id];
        setHiddenMasterIds(newHiddenList);

        // Persist to user profile
        if (user && (user.id || user.email)) {
            try {
                const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
                await updateDoc(doctorRef, { hiddenMasterItems: newHiddenList });
            } catch (e) {
                console.error("Failed to save hidden items preference:", e);
            }
        }
    } else {
        // HARD DELETE: Remove from personal list
        const newList = personalMedicines.filter(m => m.id !== id);
        setPersonalMedicines(newList);

        if (user && (user.id || user.email)) {
            try {
                const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
                await updateDoc(doctorRef, { savedInventory: newList });
            } catch (e) {
                console.error("Failed to save inventory deletion:", e);
            }
        }
    }
  };

  const handleHideHistory = async (idsToHide) => {
    // Combine existing hidden IDs with new ones, ensuring uniqueness
    const newHidden = [...new Set([...hiddenHistoryIds, ...idsToHide])];
    setHiddenHistoryIds(newHidden);

    if (user && (user.id || user.email)) {
        try {
            const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
            await updateDoc(doctorRef, { hiddenHistory: newHidden });
        } catch (e) {
            console.error("Failed to save hidden history preference:", e);
        }
    }
  };

  const handleGenerate = (prescriptionData) => {
    setCurrentPrescription(prescriptionData);
    setCurrentView('prescription');
  };

  // --- SAVE LOGIC (Called after confirmation) ---
  const executeSaveAndNew = async () => {
    // Safety check: ensure we have data and a user to attribute it to
    if (!currentPrescription || !user) {
        console.error("Missing prescription data or user session");
        setIsSaveModalOpen(false);
        return;
    }

    setIsSaving(true); // START LOADING

    try {
      const rxRef = doc(db, 'artifacts', appId, 'public', 'data', 'prescriptions', currentPrescription.id);
      
      // Sanitize clinic details to ensure no undefined values (which crash Firestore)
      const cleanClinicDetails = user.clinicDetails ? {
          name: user.clinicDetails.name || '',
          address: user.clinicDetails.address || '',
          contactNumber: user.clinicDetails.contactNumber || '',
          ptr: user.clinicDetails.ptr || '',
          s2: user.clinicDetails.s2 || ''
      } : null;

      // Sanitize data to prevent "undefined" errors in Firestore
      const cloudData = {
        id: currentPrescription.id || '',
        date: currentPrescription.date || new Date().toLocaleDateString(),
        status: 'issued',
        patient: currentPrescription.patient || {},
        items: currentPrescription.items || [],
        grandTotal: currentPrescription.grandTotal || 0,
        doctorName: user.name || 'Unknown Doctor',
        doctorLicense: user.license || 'N/A',
        doctorEmail: user.email || 'N/A',
        clinicDetails: cleanClinicDetails, // Use sanitized object
        createdAt: serverTimestamp(),
        isHidden: false 
      };
      
      await setDoc(rxRef, cloudData);

      // Reset Form
      setPatient({ name: '', age: '', sex: 'Male' });
      setItems([]);
      
      // Clear Preview Data
      setCurrentPrescription(null);
      
      // Navigate
      setCurrentView('dashboard');
      
      // Close Modal
      setIsSaveModalOpen(false); 
      
    } catch (e) {
      console.error("Failed to upload prescription:", e);
      alert(`Error saving prescription: ${e.message}. Please check your internet connection.`);
      setIsSaveModalOpen(false);
    } finally {
        setIsSaving(false); // STOP LOADING
    }
  };

  // --- DISCARD LOGIC (Called after confirmation) ---
  const executeDiscard = () => {
      setPatient({ name: '', age: '', sex: 'Male' });
      setItems([]);
      setCurrentPrescription(null);
      setCurrentView('dashboard');
      setIsDiscardModalOpen(false); // Close modal
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPrescription(null);
    setPatient({ name: '', age: '', sex: 'Male' });
    setItems([]);
    setHiddenMasterIds([]); // Reset session
    setHiddenHistoryIds([]); // Reset session
    setCurrentView('auth');
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
  };

  // --- COMBINE LISTS FOR DISPLAY ---
  // 1. Personal Items
  // 2. Master Items (filtered by hidden IDs)
  const displayedMedicines = [
      ...personalMedicines,
      ...masterMedicines.filter(m => !hiddenMasterIds.includes(m.id))
  ];

  return (
    <div className={`h-[100dvh] font-sans overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'}`}>
      {/* GLOBAL STYLES */}
      <style>
        {`
          .input-modern {
              background-color: ${isDarkMode ? '#1e293b' : '#f9fafb'};
              border: 1px solid ${isDarkMode ? '#334155' : '#e5e7eb'};
              color: ${isDarkMode ? '#f1f5f9' : '#1e293b'};
              transition: all 0.2s ease;
          }
          .input-modern:focus {
              background-color: ${isDarkMode ? '#0f172a' : 'white'};
              border-color: #6366f1; /* Indigo-500 */
              box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @media print {
            @page { size: auto; margin: 0.5in; }
            .no-print, nav, .mobile-nav-bar { display: none !important; }
            body, html, #root { background: white !important; margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
            .printable-wrapper { display: flex !important; flex-direction: column !important; min-height: 90vh !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
            .printable-content { flex: 1 0 auto !important; padding-bottom: 20px !important; }
            .printable-footer { flex-shrink: 0 !important; margin-top: auto !important; width: 100% !important; page-break-inside: avoid !important; padding-top: 10px !important; border-top: 1px solid #e2e8f0 !important; }
            .printable-wrapper h1 { font-size: 18pt !important; line-height: 1.2 !important; margin-bottom: 5px !important; }
            .printable-wrapper p, .printable-wrapper span { font-size: 10pt !important; }
            .printable-wrapper .text-xs { font-size: 8pt !important; }
            .printable-wrapper .text-sm { font-size: 9pt !important; }
            .printable-wrapper .text-lg { font-size: 11pt !important; }
            .printable-wrapper .text-4xl { font-size: 20pt !important; }
            .printable-wrapper table td, .printable-wrapper table th { padding-top: 4px !important; padding-bottom: 4px !important; font-size: 10pt !important; }
            .rx-watermark { font-size: 8rem !important; color: #94a3b8 !important; opacity: 0.3 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .print-min-h-reset { min-height: auto !important; }
          }
        `}
      </style>

      {/* CONFIRMATION MODALS */}
      <ConfirmationModal 
         isOpen={isSaveModalOpen}
         onClose={() => setIsSaveModalOpen(false)}
         onConfirm={executeSaveAndNew}
         title="Confirm Prescription"
         message="This will save the patient data to the database and return you to the prescription writer for a new patient."
         confirmText="Save & New"
         type="info"
         isLoading={isSaving} 
      />

      <ConfirmationModal 
         isOpen={isDiscardModalOpen}
         onClose={() => setIsDiscardModalOpen(false)}
         onConfirm={executeDiscard}
         title="Discard Changes?"
         message="WARNING: Data will NOT be saved. This will discard the current prescription and start a new one."
         confirmText="Discard"
         type="danger"
      />

      {currentView === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} db={db} appId={appId} />}
      {currentView === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} user={user} />}
      
      {['dashboard', 'prescription', 'history', 'settings', 'medicines', 'support'].includes(currentView) && (
        <div className={`flex h-full overflow-hidden print:bg-white print:block ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-white'}`}>
          {/* DESKTOP SIDEBAR */}
          <aside className={`no-print w-72 flex-col hidden md:flex border-r shadow-2xl z-30 relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0B0F19] text-slate-300 border-white/5' : 'bg-white text-slate-600 border-slate-200'}`}>
              <div className={`relative z-10 p-6 flex items-center gap-3 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="bg-gradient-to-tr from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`font-bold text-lg tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>MediVend</h1>
                <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Doctor Portal</p>
              </div>
            </div>
            
            <nav className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto">
              <div className="px-3 mb-2 mt-2 text-[10px] font-extrabold uppercase tracking-widest opacity-70">Clinical Workspace</div>
              <NavButton active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard className="w-5 h-5" />} label="Prescription Writer" isDarkMode={isDarkMode} />
              <NavButton active={currentView === 'history'} onClick={() => setCurrentView('history')} icon={<History className="w-5 h-5" />} label="Patient History" isDarkMode={isDarkMode} />
              <div className="px-3 mt-8 mb-2 text-[10px] font-extrabold uppercase tracking-widest opacity-70">Management</div>
               <NavButton active={currentView === 'medicines'} onClick={() => setCurrentView('medicines')} icon={<Pill className="w-5 h-5" />} label="Medicine List" isDarkMode={isDarkMode} />
              <div className="px-3 mt-8 mb-2 text-[10px] font-extrabold uppercase tracking-widest opacity-70">System</div>
              <NavButton active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<Settings className="w-5 h-5" />} label="Account Settings" isDarkMode={isDarkMode} />
              <NavButton active={currentView === 'support'} onClick={() => setCurrentView('support')} icon={<LifeBuoy className="w-5 h-5" />} label="Support & Help" isDarkMode={isDarkMode} />
            </nav>
            <div className={`relative z-10 p-4 border-t ${isDarkMode ? 'bg-[#05080F] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl border transition-colors ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-indigo-200'}`}>
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div className="overflow-hidden">
                  <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{user?.name}</p>
                  <p className="text-xs opacity-70 truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-sm font-medium group">
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Sign Out
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative print:block ${isDarkMode ? 'bg-[#0B0F19]' : 'bg-white'}`}>
            <header className={`no-print border-b flex items-center justify-between px-4 md:px-8 py-3 md:py-0 shadow-md z-20 shrink-0 sticky top-0 transition-colors ${isDarkMode ? 'bg-[#0B0F19] border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="py-4">
                <h2 className={`text-lg md:text-xl font-bold tracking-tight capitalize flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {currentView === 'dashboard' ? <><LayoutDashboard className="w-5 h-5 text-indigo-500"/> Prescription Writer</> : 
                   currentView === 'medicines' ? <><Pill className="w-5 h-5 text-emerald-500"/> Medicine List</> : 
                   currentView === 'history' ? <><History className="w-5 h-5 text-indigo-500"/> Patient History</> :
                   currentView === 'prescription' ? <><Printer className="w-5 h-5 text-indigo-500"/> Prescription Preview</> :
                   currentView === 'support' ? <><LifeBuoy className="w-5 h-5 text-amber-500"/> Support & Help</> :
                   <><Settings className="w-5 h-5 text-slate-400"/> Account Settings</>}
                </h2>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 py-1">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </button>
                <div className={`hidden sm:flex text-xs md:text-sm font-medium items-center gap-2 px-3 py-1.5 rounded-full border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> <span className={isDarkMode ? 'text-slate-200 font-semibold' : 'text-slate-900 font-semibold'}>{new Date().toLocaleDateString()}</span>
                </div>
                {/* Profile Avatar inside the header on Mobile to open Settings */}
                <button 
                  onClick={() => setCurrentView('settings')} 
                  className={`md:hidden w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs shadow-md border-2 transition-all ${currentView === 'settings' ? 'border-indigo-400 bg-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent bg-indigo-600 hover:bg-indigo-700'}`} 
                  title="Account Settings"
                >
                  {user?.name?.charAt(0) || 'D'}
                </button>
              </div>
            </header>

            {/* VIEWS CONTAINER */}
            <main className="flex-1 overflow-hidden relative bg-transparent print:bg-white print:overflow-visible pb-20 md:pb-0 print:pb-0">
              {currentView === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  onGenerate={handleGenerate} 
                  medicineList={displayedMedicines} // Pass combined list
                  onAddCustomMedicine={handleAddMedicine}
                  isDarkMode={isDarkMode}
                  patient={patient}
                  setPatient={setPatient}
                  items={items}
                  setItems={setItems}
                  db={db}
                  appId={appId}
                />
              )}
              {currentView === 'history' && <HistoryView user={user} isDarkMode={isDarkMode} hiddenIds={hiddenHistoryIds} onHide={handleHideHistory} />}
              {currentView === 'medicines' && (
                <MedicineManager 
                   medicines={displayedMedicines} // Pass combined list
                   onAdd={handleAddMedicine} 
                   onDelete={handleDeleteMedicine} 
                   isDarkMode={isDarkMode}
                />
              )}
              {currentView === 'settings' && <SettingsView user={user} onUpdateUser={handleUpdateUser} isDarkMode={isDarkMode} />}
              {currentView === 'support' && <SupportView user={user} isDarkMode={isDarkMode} db={db} appId={appId} />}
              {currentView === 'prescription' && (
                <PrescriptionView 
                  data={currentPrescription} 
                  doctor={user} 
                  onBack={() => setCurrentView('dashboard')} 
                  onCancel={() => setIsDiscardModalOpen(true)}      
                  onNew={() => setIsSaveModalOpen(true)}                  
                />
              )}
            </main>

            {/* MOBILE BOTTOM NAVIGATION */}
            <nav className={`mobile-nav-bar md:hidden no-print fixed bottom-0 left-0 right-0 border-t flex justify-around px-2 py-3 z-50 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.1)] pb-safe transition-colors ${isDarkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-white border-slate-200'}`}>
              <NavButtonMobile active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard />} label="Writer" isDarkMode={isDarkMode} />
              <NavButtonMobile active={currentView === 'history'} onClick={() => handleNavClick('history')} icon={<History />} label="History" isDarkMode={isDarkMode} />
              <NavButtonMobile active={currentView === 'medicines'} onClick={() => handleNavClick('medicines')} icon={<Pill />} label="Meds List" isDarkMode={isDarkMode} />
              <NavButtonMobile active={currentView === 'support'} onClick={() => handleNavClick('support')} icon={<LifeBuoy />} label="Support" isDarkMode={isDarkMode} />
              <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative text-slate-400 hover:text-rose-500">
                  <LogOut className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">Log Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}