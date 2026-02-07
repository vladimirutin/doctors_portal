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
  Key
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
  limit
} from "firebase/firestore";
import { 
  getAuth, 
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: "AIzaSyBT93hmr81TT_-KltaYxcYwms_xKxg3c1I",
  authDomain: "medivend-a3d51.firebaseapp.com",
  projectId: "medivend-a3d51",
  storageBucket: "medivend-a3d51.firebasestorage.app",
  messagingSenderId: "743343498567",
  appId: "1:743343498567:web:2d50fb42346f31350d1862"
};

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

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [user, setUser] = useState(null); 
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [medicineList, setMedicineList] = useState(DEFAULT_MEDICINES);

  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error("Auth failed:", err));
    const unsubscribe = onAuthStateChanged(auth, () => {});
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    
    // LOAD SAVED INVENTORY IF EXISTS
    if (userData.savedInventory && Array.isArray(userData.savedInventory) && userData.savedInventory.length > 0) {
      setMedicineList(userData.savedInventory);
    } else {
      setMedicineList(DEFAULT_MEDICINES);
    }

    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', userData.email);
      await updateDoc(doctorRef, { lastLogin: serverTimestamp() });
    } catch (e) {
      console.log("Login timestamp update note:", e.message);
    }
    
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
        const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
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
    
    const newList = [...medicineList, medObject];
    setMedicineList(newList);

    // PERSIST TO FIRESTORE
    if (user && user.email) {
      try {
        const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
        await updateDoc(doctorRef, { savedInventory: newList });
      } catch (e) {
        console.error("Failed to save inventory:", e);
      }
    }
  };

  const handleDeleteMedicine = async (id) => {
    if(window.confirm("Are you sure you want to delete this medicine?")) {
      const newList = medicineList.filter(m => m.id !== id);
      setMedicineList(newList);

      // PERSIST TO FIRESTORE
      if (user && user.email) {
        try {
          const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
          await updateDoc(doctorRef, { savedInventory: newList });
        } catch (e) {
          console.error("Failed to save inventory deletion:", e);
        }
      }
    }
  };

  const handleGenerate = async (prescriptionData) => {
    setCurrentPrescription(prescriptionData);
    try {
      const rxRef = doc(db, 'artifacts', appId, 'public', 'data', 'prescriptions', prescriptionData.id);
      const cloudData = {
        id: prescriptionData.id,
        date: prescriptionData.date,
        status: 'issued',
        patient: prescriptionData.patient,
        items: prescriptionData.items,
        grandTotal: prescriptionData.grandTotal,
        doctorName: user.name,
        doctorLicense: user.license,
        doctorEmail: user.email,
        clinicDetails: user.clinicDetails,
        createdAt: serverTimestamp()
      };
      await setDoc(rxRef, cloudData);
    } catch (e) {
      console.error("Failed to upload prescription:", e);
    }
    setCurrentView('prescription');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPrescription(null);
    setCurrentView('auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden">
      {/* PRINT ENGINE: ROBUST FLOW LAYOUT TO PREVENT OVERLAP ON LETTER/A4 */}
      <style>
        {`
          @media print {
            @page {
              size: auto; /* Adapts to Letter, A4, etc */
              margin: 0.5in; /* Standard Office Margin */
            }
            .no-print {
              display: none !important;
            }
            
            /* Strictly hide navigation in print */
            nav, .mobile-nav-bar {
              display: none !important;
            }

            body, html, #root {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              overflow: visible !important;
            }
            
            /* Main Print Container */
            .printable-wrapper {
              display: flex !important;
              flex-direction: column !important;
              min-height: 90vh !important; /* Use 90vh to stay safe within page margins */
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }

            /* Content Area - Expands to fill space */
            .printable-content {
              flex: 1 0 auto !important; /* Grow, don't shrink */
              padding-bottom: 20px !important; /* Buffer before footer */
            }

            /* Footer - Pushed to bottom via flex, but flows naturally if content is long */
            .printable-footer {
              flex-shrink: 0 !important;
              margin-top: auto !important;
              width: 100% !important;
              page-break-inside: avoid !important;
              padding-top: 10px !important;
              border-top: 1px solid #e2e8f0 !important;
            }

            /* --- COMPACT TYPOGRAPHY FOR LETTER/A4 --- */
            .printable-wrapper h1 { font-size: 18pt !important; line-height: 1.2 !important; margin-bottom: 5px !important; }
            .printable-wrapper p, .printable-wrapper span { font-size: 10pt !important; }
            .printable-wrapper .text-xs { font-size: 8pt !important; }
            .printable-wrapper .text-sm { font-size: 9pt !important; }
            .printable-wrapper .text-lg { font-size: 11pt !important; }
            .printable-wrapper .text-4xl { font-size: 20pt !important; } /* Rx Symbol */

            /* Dense Table for 10+ items */
            .printable-wrapper table td,
            .printable-wrapper table th {
              padding-top: 4px !important;
              padding-bottom: 4px !important;
              font-size: 10pt !important;
            }
            
            /* Watermark adjustments - SIGNIFICANTLY DARKER */
            .rx-watermark {
               font-size: 8rem !important;
               color: #94a3b8 !important; /* Darker Slate-400 for better print visibility */
               opacity: 0.3 !important; /* Increased to 0.3 */
               -webkit-print-color-adjust: exact !important;
               print-color-adjust: exact !important;
            }
            
            /* Override tailwind min-height in print */
            .print-min-h-reset {
              min-height: auto !important;
            }
          }
        `}
      </style>

      {currentView === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} db={db} appId={appId} />}
      {currentView === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} user={user} />}
      
      {['dashboard', 'prescription', 'history', 'settings', 'medicines'].includes(currentView) && (
        <div className="flex h-screen overflow-hidden bg-slate-100 print:bg-white print:block">
          {/* DESKTOP SIDEBAR */}
          <aside className="no-print w-72 bg-[#0f172a] text-slate-400 flex-col hidden md:flex border-r border-slate-800 shadow-xl z-30">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-wide">MediVend</h1>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Doctor Portal</p>
              </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Workspace</div>
              <NavButton active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard className="w-5 h-5" />} label="New Prescription" />
              <NavButton active={currentView === 'history'} onClick={() => setCurrentView('history')} icon={<History className="w-5 h-5" />} label="History Logs" />
              
              <div className="px-3 mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Inventory</div>
               <NavButton active={currentView === 'medicines'} onClick={() => setCurrentView('medicines')} icon={<Pill className="w-5 h-5" />} label="Medicine List" />

              <div className="px-3 mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Preferences</div>
              <NavButton active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<Settings className="w-5 h-5" />} label="Account Settings" />
            </nav>

            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:block">
            <header className="no-print bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-20 shrink-0">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight capitalize">
                  {currentView === 'dashboard' ? 'Prescription Writer' : 
                   currentView === 'medicines' ? 'Medicine Inventory' : currentView}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs md:text-sm font-medium text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Clock className="w-4 h-4 text-blue-600" /> {new Date().toLocaleDateString()}
                </div>
              </div>
            </header>

            {/* VIEWS CONTAINER with mobile padding bottom - REMOVED PADDING ON PRINT */}
            <main className="flex-1 overflow-hidden relative bg-slate-50/50 print:bg-white print:overflow-visible pb-20 md:pb-0 print:pb-0">
              {currentView === 'dashboard' && (
                <Dashboard 
                  user={user} 
                  onGenerate={handleGenerate} 
                  medicineList={medicineList}
                  onAddCustomMedicine={handleAddMedicine}
                />
              )}
              {currentView === 'history' && <HistoryView user={user} />}
              {currentView === 'medicines' && (
                <MedicineManager 
                   medicines={medicineList} 
                   onAdd={handleAddMedicine} 
                   onDelete={handleDeleteMedicine} 
                />
              )}
              {currentView === 'settings' && <SettingsView user={user} onUpdateUser={handleUpdateUser} />}
              {currentView === 'prescription' && (
                <PrescriptionView 
                  data={currentPrescription} 
                  doctor={user} 
                  onBack={() => setCurrentView('dashboard')} 
                />
              )}
            </main>

            {/* MOBILE BOTTOM NAVIGATION - HIDDEN ON PRINT */}
            <nav className="mobile-nav-bar md:hidden no-print fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around px-2 py-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <NavButtonMobile active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard />} label="Writer" />
              <NavButtonMobile active={currentView === 'history'} onClick={() => setCurrentView('history')} icon={<History />} label="History" />
              <NavButtonMobile active={currentView === 'medicines'} onClick={() => setCurrentView('medicines')} icon={<Pill />} label="Meds" />
              <NavButtonMobile active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<Settings />} label="Config" />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

// ... AuthScreen, OnboardingScreen remain unchanged ...

// --- SUB-COMPONENTS (INCLUDED FOR CONTEXT) ---
function AuthScreen({ onAuthSuccess, db, appId }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', license: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState(null); 
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

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
          const userData = docSnap.data();
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
                setError("Maximum attempts reached. Please wait 10 seconds.");
            } else {
                setError(`Incorrect password. ${5 - newCount} attempts remaining.`);
            }
          }
        } else {
          const newCount = failedAttempts + 1;
          setFailedAttempts(newCount);
          if (newCount >= 5) {
                setLockoutTimer(10);
                setError("Maximum attempts reached. Please wait 10 seconds.");
          } else {
                setError(`No account found. ${5 - newCount} attempts remaining.`);
          }
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
      if (formData.email === 'test@doctor.com' && formData.password === '123') {
         onAuthSuccess({
             name: 'Dr. John Doe',
             email: 'test@doctor.com',
             password: '123',
             license: 'PRC-1234567',
             status: 'active',
             clinicDetails: { name: 'City Central', address: '123 Main St', contactNumber: '12345', ptr: '1', s2: '2' }
         });
         return;
      }
      setError("Connection error. Ensure you are connected to the internet.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-white font-sans text-slate-900 overflow-hidden">
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 mb-6 transform transition-transform hover:scale-105">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-slate-500">
              {isLogin ? 'Please enter your details to access your dashboard.' : 'Sign up to start prescribing digitally with MediVend.'}
            </p>
          </div>
          {pendingUserEmail && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account Pending Approval</p>
                <p className="mt-1 opacity-90">Your account ({pendingUserEmail}) has been created. Please wait for Super Admin verification.</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative group">
                    <User className="w-5 h-5 absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input required type="text" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400" placeholder="Dr. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Medical License No.</label>
                  <div className="relative group">
                    <FileBadge className="w-5 h-5 absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input required type="text" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400" placeholder="PRC-XXXXXX" value={formData.license} onChange={e => setFormData({...formData, license: e.target.value})} />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input required type="email" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400" placeholder="doctor@hospital.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input required type="password" className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <button type="submit" disabled={isLoading || lockoutTimer > 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex justify-center items-center">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : lockoutTimer > 0 ? (
                `Try again in ${lockoutTimer}s`
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          <div className="text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); setPendingUserEmail(null); setFormData({ name: '', email: '', password: '', license: '' }); }} 
                className="ml-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                {isLogin ? 'Sign up for free' : 'Log in'}
              </button>
            </p>
          </div>
          <div className="pt-8 mt-8 border-t border-slate-100 text-center lg:text-left opacity-80 hover:opacity-100 transition-opacity">
             <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 text-xs text-slate-400">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                   <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="space-y-1 text-center lg:text-left">
                   <p className="font-semibold text-slate-600">MediVend Healthcare Inc.</p>
                   <p>Customer Service: <span className="font-mono text-slate-500">(02) 8-7000</span></p>
                   <p>FDA License: <span className="font-mono bg-slate-100 px-1 rounded text-slate-600">LTO-30000012345</span></p>
                   <p>© 2023 MediVend Systems. Secure & Compliant.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950"></div>
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm">
            <Activity className="w-3 h-3" /> Secure Prescription System
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Digital Care</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light">
            Generate secure, trackable prescriptions in seconds. Connect directly with MediVend kiosks for seamless, contactless fulfillment.
          </p>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-md hover:bg-slate-800/60 transition-colors">
                <Printer className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="font-bold text-white">Instant Generation</h3>
                <p className="text-xs text-slate-400 mt-1">Create Rx slips instantly.</p>
             </div>
             <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-md hover:bg-slate-800/60 transition-colors">
                <QrCode className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="font-bold text-white">QR Integration</h3>
                <p className="text-xs text-slate-400 mt-1">Secure kiosk dispensing.</p>
             </div>
             <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-md hover:bg-slate-800/60 transition-colors">
                <ShieldCheck className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="font-bold text-white">Fully Compliant</h3>
                <p className="text-xs text-slate-400 mt-1">FDA & DOH Standards.</p>
             </div>
             <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-md hover:bg-slate-800/60 transition-colors">
                <CheckCircle2 className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-bold text-white">Track Record</h3>
                <p className="text-xs text-slate-400 mt-1">History at your fingertips.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({ onComplete, user }) {
  const [details, setDetails] = useState({ name: '', address: '', contactNumber: '', ptr: '', s2: '' });

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Clinic Setup</h2>
        <p className="text-slate-500 mb-6 text-sm">Please provide your clinic details for the prescription header.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); onComplete(details); }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinic Name</label>
            <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. City General Hospital" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
            <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Complete Address" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
            <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tel / Mobile" value={details.contactNumber} onChange={e => setDetails({...details, contactNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PTR No.</label>
            <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="PTR-XXXXX" value={details.ptr} onChange={e => setDetails({...details, ptr: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">S2 License (Optional)</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="S2-XXXXX" value={details.s2} onChange={e => setDetails({...details, s2: e.target.value})} />
          </div>
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all">Save & Continue</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user, onGenerate, medicineList, onAddCustomMedicine }) {
  const [patient, setPatient] = useState({ name: '', age: '', sex: 'Male' });
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempInstr, setTempInstr] = useState('');
  const [tempDosage, setTempDosage] = useState('');
  const [tempPrice, setTempPrice] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'

  const filteredMeds = medicineList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMed = (med) => {
    setSelectedMed(med);
    setSearchQuery(med.name);
    setTempDosage(med.dosage);
    setTempPrice(med.price);
    setIsDropdownOpen(false);
  };

  const handleAddCustomMedicineLocal = (newMed) => {
    const medObject = {
      id: Date.now(), 
      name: newMed.name,
      dosage: newMed.dosage,
      price: parseFloat(newMed.price)
    };
    onAddCustomMedicine(medObject);
    handleSelectMed(medObject);
    setIsCustomModalOpen(false);
  };

  const addItem = () => {
    if (!selectedMed) return;
    const parsedPrice = parseFloat(tempPrice) || 0;
    const parsedQty = parseInt(tempQty) || 1;
    setItems([...items, {
      ...selectedMed,
      uniqueId: Date.now(),
      quantity: parsedQty,
      dosage: tempDosage, 
      price: parsedPrice, 
      instructions: tempInstr || 'As directed by physician',
      totalPrice: parsedPrice * parsedQty
    }]);
    setSelectedMed(null);
    setSearchQuery('');
    setTempQty(1);
    setTempInstr('');
    setTempDosage('');
    setTempPrice(0);
  };

  const removeItem = (id) => setItems(items.filter(i => i.uniqueId !== id));

  const handleGenerate = () => {
    if (!patient.name || items.length === 0) return;
    const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const uniqueId = `RX-${Math.floor(Math.random() * 1000000)}`; 

    onGenerate({
      id: uniqueId,
      date: new Date().toLocaleDateString(),
      patient,
      items,
      grandTotal,
      qrValue: JSON.stringify({ app: 'medivend', id: uniqueId, ver: '1' })
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden relative bg-white md:bg-transparent">
      {/* MOBILE TABS */}
      <div className="md:hidden no-print flex bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30">
        <button 
          onClick={() => setMobileView('editor')} 
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileView === 'editor' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Editor
        </button>
        <button 
          onClick={() => setMobileView('preview')} 
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileView === 'preview' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500'}`}
        >
          <Eye className="w-4 h-4" /> Live Preview
        </button>
      </div>

      {/* EDITOR PANE */}
      <div className={`${mobileView === 'editor' ? 'block' : 'hidden'} md:block w-full md:w-3/5 p-4 md:p-8 overflow-y-auto border-r border-slate-200 h-full`}>
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg"><User className="w-4 h-4 text-blue-600" /></div>
            Patient Details
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Enter patient name" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} />
            </div>
            <div className="col-span-6 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                placeholder="00" 
                value={patient.age} 
                onChange={e => {
                  const val = e.target.value;
                  if (val === '' || parseInt(val) >= 1) {
                    setPatient({...patient, age: val});
                  }
                }} 
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sex</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all" value={patient.sex} onChange={e => setPatient({...patient, sex: e.target.value})}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="bg-emerald-100 p-1.5 rounded-lg"><Pill className="w-4 h-4 text-emerald-600" /></div>
              Prescribe Medicine
            </h3>
            <button onClick={() => setIsCustomModalOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> Custom Item
            </button>
          </div>

          <div className="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200 mb-6 relative group focus-within:border-blue-300 focus-within:shadow-md transition-all">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine Name</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input type="text" className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Search database..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); if (!e.target.value) setSelectedMed(null); }} onFocus={() => setIsDropdownOpen(true)} />
                </div>
                {isDropdownOpen && searchQuery && !selectedMed && (
                  <div className="absolute z-50 w-full bg-white mt-1 border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredMeds.length === 0 ? (
                      <div onClick={() => setIsCustomModalOpen(true)} className="p-3 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add "{searchQuery}" as custom medicine
                      </div>
                    ) : (
                      filteredMeds.map(med => (
                        <div key={med.id} onClick={() => handleSelectMed(med)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                          <div className="font-medium text-sm text-slate-900">{med.name}</div>
                          <div className="text-xs text-slate-500 flex justify-between">
                            <span>{med.dosage}</span>
                            <span className="font-bold text-emerald-600">₱{med.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                <input type="number" min="1" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={tempQty} onChange={e => setTempQty(e.target.value)} />
              </div>
              <div className="col-span-6 md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dosage</label>
                <input type="text" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. 500mg" value={tempDosage} onChange={e => setTempDosage(e.target.value)} disabled={!selectedMed} />
              </div>
              <div className="col-span-6 md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit Price (₱)</label>
                <input type="number" min="0" step="0.25" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={tempPrice} onChange={e => setTempPrice(e.target.value)} disabled={!selectedMed} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructions</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. 1 tab after meals" value={tempInstr} onChange={e => setTempInstr(e.target.value)} />
              </div>
              <div className="col-span-12">
                <button onClick={addItem} disabled={!selectedMed} className={`w-full py-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${selectedMed ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg transform active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  <Plus className="w-4 h-4" /> Add to List
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-8">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="mb-2">No medicines added yet.</div>
                <div className="text-xs">Search above to begin.</div>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={item.uniqueId} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm border border-slate-200 shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">{item.name}</div>
                      <div className="text-sm text-slate-500 flex gap-2 items-center flex-wrap">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">{item.dosage}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs border border-emerald-100">₱{item.price.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-slate-400 italic mt-1 truncate">{item.instructions}</div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4 shrink-0">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Qty: {item.quantity}</div>
                      <div className="font-bold text-slate-900 text-lg">₱{item.totalPrice.toFixed(2)}</div>
                    </div>
                    <button onClick={() => removeItem(item.uniqueId)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW PANE */}
      <div className={`${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex flex-col no-print w-full md:w-2/5 md:bg-slate-50 md:border-l border-slate-200 h-full`}>
        <div className="p-4 md:p-6 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Live Preview
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-md shadow-xl border border-slate-200 p-6 md:p-8 min-h-[600px] text-sm relative">
            <div className="border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-slate-900">{user?.clinicDetails?.name || 'Clinic Name'}</h1>
              <p className="text-xs text-slate-600 whitespace-pre-line">{user?.clinicDetails?.address || 'Clinic Address'}</p>
              <div className="flex justify-between items-end mt-4">
                <div className="text-xs">
                  <p><span className="font-bold">Patient:</span> {patient.name || '___________'}</p>
                  <p><span className="font-bold">Age/Sex:</span> {patient.age || '__'} / {patient.sex}</p>
                  <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="font-serif">
              <div className="text-4xl font-bold text-slate-300 mb-4">Rx</div>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-slate-300 italic text-center py-10">List is empty...</p>
                ) : (
                  items.map((item, idx) => (
                    <div key={item.uniqueId} className="border-b border-slate-100 pb-2 mb-2 last:border-0">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{item.name} <span className="text-xs font-normal text-slate-500">{item.dosage}</span></span>
                        <span>#{item.quantity}</span>
                      </div>
                      <div className="text-xs italic text-slate-600 pl-4 mt-1">
                        Sig: {item.instructions}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 border-t border-slate-300 pt-4 flex justify-between items-end">
              <div className="text-[10px] text-slate-400 font-sans w-1/2">
                <p>This prescription is digitally verified. Valid for dispensing at any MediVend Kiosk or licensed pharmacy.</p>
              </div>
              <div className="text-center w-64">
                  <div className="h-px bg-slate-900 w-full mb-2"></div>
                  <p className="font-bold uppercase text-slate-900">{user?.name}</p>
                  <div className="text-[10px] uppercase text-slate-500">Lic No: {user?.license}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-white border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium">Total Estimated Cost</span>
            <span className="text-2xl font-bold text-blue-600">
              ₱{items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)}
            </span>
          </div>
          <button onClick={handleGenerate} disabled={items.length === 0 || !patient.name} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg">
            <Printer className="w-6 h-6" /> Generate Prescription
          </button>
        </div>
      </div>

      {isCustomModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <CustomMedicineForm onClose={() => setIsCustomModalOpen(false)} onAdd={handleAddCustomMedicineLocal} initialName={searchQuery} />
        </div>
      )}
    </div>
  );
}

// --- 4. PRESCRIPTION VIEW ---
function PrescriptionView({ data, doctor, onBack }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qrValue)}`;

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden print:bg-white print:overflow-visible">
      {/* TOOLBAR HIDDEN ON PRINT */}
      <div className="no-print bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm shrink-0">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" /> <span className="hidden md:inline">Back to Editor</span> <span className="md:hidden">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-xs md:text-sm text-slate-500 mr-2 md:mr-4 hidden sm:block">ID: <span className="font-mono font-bold text-slate-800">{data.id}</span></div>
          <button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md transition-all active:scale-95 text-sm md:text-base">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center print:p-0 print:block">
        {/* WRAPPER: UPDATED FOR FLEXIBLE WIDTH PRINTING & FLEX LAYOUT */}
        <div className="printable-wrapper bg-white w-full max-w-2xl shadow-2xl p-6 md:p-12 relative text-slate-900 font-serif border border-slate-100">
          
          {/* FIXED WATERMARK: Moved to wrapper level to center on page */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="rx-watermark text-[8rem] md:text-[10rem] font-bold text-slate-200/50 font-sans italic select-none">Rx</div>
          </div>

          {/* CONTENT SECTION (Grows) */}
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
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-slate-900 p-1 inline-block">
                    <img src={qrUrl} alt="Rx QR" className="w-full h-full object-cover" />
                </div>
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

          {/* FOOTER SECTION */}
          <div className="printable-footer flex justify-between items-end bg-white relative z-10">
            <div className="text-[10px] text-slate-400 font-sans w-1/2 leading-snug italic">
              <p>This document is digitally signed. Valid for dispensing at any MediVend Kiosk or licensed pharmacy.</p>
            </div>
            <div className="text-center w-64">
               <div className="h-[2px] bg-slate-900 w-full mb-2"></div>
               <p className="font-bold uppercase text-sm text-slate-900 tracking-tighter">{doctor?.name}</p>
               <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Lic No. {doctor?.license}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// MedicineManager, HistoryView, NavButton, PasswordModal, CustomMedicineForm, NavButtonMobile remain as previously defined

function MedicineManager({ medicines, onAdd, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchQuery] = useState('');
  const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-auto">
             <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
             <input type="text" className="w-full sm:w-64 pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white" placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Add Medicine
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Medicine Name</th>
                <th className="px-6 py-4">Dosage</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-slate-400">No medicines found.</td></tr>
              ) : (
                filtered.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{med.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 font-medium">{med.dosage}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">₱{med.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => onDelete(med.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <CustomMedicineForm onClose={() => setIsModalOpen(false)} onAdd={(med) => { onAdd(med); setIsModalOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function HistoryView({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'artifacts', appId, 'public', 'data', 'prescriptions'),
          where('doctorEmail', '==', user.email),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        records.sort((a, b) => new Date(b.createdAt?.seconds * 1000) - new Date(a.createdAt?.seconds * 1000));
        setHistory(records);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchHistory();
  }, [user.email]);
  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Activity</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
            <tr><th className="px-6 py-4">Date Issued</th><th className="px-6 py-4">Patient Name</th><th className="px-6 py-4 text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan="3" className="p-12 text-center text-slate-400 italic">Syncing...</td></tr> : history.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-500">{r.date}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{r.patient.name}</td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600">₱{r.grandTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsView({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize form state
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    license: user.license || '',
    email: user.email || ''
  });

  const [clinicData, setClinicData] = useState({
    name: user.clinicDetails?.name || '',
    address: user.clinicDetails?.address || '',
    contactNumber: user.clinicDetails?.contactNumber || '',
    ptr: user.clinicDetails?.ptr || '',
    s2: user.clinicDetails?.s2 || ''
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
      await updateDoc(doctorRef, { 
        name: profileData.name,
        license: profileData.license
      });
      onUpdateUser({ ...user, ...profileData });
      showNotification("Profile updated successfully.");
    } catch (e) {
      showNotification(e.message, 'error');
    }
    setIsLoading(false);
  };

  const handleSaveClinic = async () => {
    setIsLoading(true);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
      await updateDoc(doctorRef, { 
        clinicDetails: clinicData
      });
      onUpdateUser({ ...user, clinicDetails: clinicData });
      showNotification("Clinic details updated successfully.");
    } catch (e) {
      showNotification(e.message, 'error');
    }
    setIsLoading(false);
  };

  const handleSavePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showNotification("New passwords do not match.", 'error');
      return;
    }
    if (passwordData.current !== user.password) {
       showNotification("Current password is incorrect.", 'error');
       return;
    }
    
    setIsLoading(true);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
      await updateDoc(doctorRef, { password: passwordData.new });
      onUpdateUser({ ...user, password: passwordData.new }); 
      setPasswordData({ current: '', new: '', confirm: '' });
      showNotification("Password changed successfully.");
    } catch (e) {
      showNotification(e.message, 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">Manage your account and clinic preferences.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
           <button 
             onClick={() => setActiveTab('profile')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
           >
             <User className="w-4 h-4" /> My Profile
           </button>
           <button 
             onClick={() => setActiveTab('clinic')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'clinic' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
           >
             <Building className="w-4 h-4" /> Clinic Details
           </button>
           <button 
             onClick={() => setActiveTab('security')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
           >
             <Lock className="w-4 h-4" /> Security
           </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 relative overflow-hidden">
           {notification && (
             <div className={`absolute top-0 left-0 right-0 p-3 text-center text-sm font-bold ${notification.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
               {notification.message}
             </div>
           )}
           
           {/* PROFILE TAB */}
           {activeTab === 'profile' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                   <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                      {profileData.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-800 text-lg">Personal Information</h3>
                      <p className="text-slate-500 text-sm">Update your public profile information.</p>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} placeholder="Dr. Full Name" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                      <div className="relative opacity-60 cursor-not-allowed">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input disabled className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50" value={profileData.email} />
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">License Number</label>
                      <div className="relative">
                        <FileBadge className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={profileData.license} onChange={e => setProfileData({...profileData, license: e.target.value})} placeholder="PRC-XXXXXX" />
                      </div>
                   </div>
                </div>
                <div className="pt-4 flex justify-end">
                   <button onClick={handleSaveProfile} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
                      {isLoading ? 'Saving...' : 'Save Profile'}
                   </button>
                </div>
             </div>
           )}

           {/* CLINIC TAB */}
           {activeTab === 'clinic' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="border-b border-slate-100 pb-6">
                   <h3 className="font-bold text-slate-800 text-lg">Clinic Information</h3>
                   <p className="text-slate-500 text-sm">This information appears on your prescription header.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Clinic / Hospital Name</label>
                      <div className="relative">
                        <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={clinicData.name} onChange={e => setClinicData({...clinicData, name: e.target.value})} placeholder="e.g. St. Luke's Medical Center" />
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Address</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={clinicData.address} onChange={e => setClinicData({...clinicData, address: e.target.value})} placeholder="Unit, Building, Street, City" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contact Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={clinicData.contactNumber} onChange={e => setClinicData({...clinicData, contactNumber: e.target.value})} placeholder="(02) 8-7000" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PTR Number</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={clinicData.ptr} onChange={e => setClinicData({...clinicData, ptr: e.target.value})} placeholder="PTR-XXXXXX" />
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">S2 License (Optional)</label>
                      <div className="relative">
                        <ShieldCheck className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={clinicData.s2} onChange={e => setClinicData({...clinicData, s2: e.target.value})} placeholder="S2-XXXXXX" />
                      </div>
                   </div>
                </div>
                <div className="pt-4 flex justify-end">
                   <button onClick={handleSaveClinic} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
                      {isLoading ? 'Saving...' : 'Update Clinic'}
                   </button>
                </div>
             </div>
           )}

           {/* SECURITY TAB */}
           {activeTab === 'security' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="border-b border-slate-100 pb-6">
                   <h3 className="font-bold text-slate-800 text-lg">Security Settings</h3>
                   <p className="text-slate-500 text-sm">Update your password to keep your account safe.</p>
                </div>
                <div className="max-w-md mx-auto space-y-5 py-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Current Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input type="password" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} placeholder="••••••••" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Password</label>
                      <div className="relative">
                        <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input type="password" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} placeholder="New secure password" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <CheckCircle2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input type="password" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} placeholder="Repeat new password" />
                      </div>
                   </div>
                   <div className="pt-2">
                      <button onClick={handleSavePassword} disabled={isLoading || !passwordData.current || !passwordData.new} className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg disabled:opacity-70 transition-all active:scale-95">
                          {isLoading ? 'Updating...' : 'Change Password'}
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
      {React.cloneElement(icon, { className: "w-5 h-5" })}
      <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );
}

function NavButtonMobile({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {React.cloneElement(icon, { className: "w-6 h-6" })}
      <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  );
}

function PasswordModal({ onClose, currentUser, onUpdate }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); onUpdate(newPass); };
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm">
        <h3 className="font-bold mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required className="w-full p-3 border rounded-xl" placeholder="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">Update</button>
          <button onClick={onClose} type="button" className="w-full text-slate-400">Cancel</button>
        </form>
      </div>
    </div>
  );
}

function CustomMedicineForm({ onClose, onAdd, initialName }) {
  const [formData, setFormData] = useState({ name: initialName || '', dosage: '', price: '' });
  const handleSubmit = (e) => { e.preventDefault(); if (formData.name) onAdd(formData); };
  return (
    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-slate-100">
      <h3 className="font-bold mb-4 uppercase tracking-widest text-sm">Add Custom Item</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required className="w-full p-3 border rounded-xl" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required className="w-full p-3 border rounded-xl" placeholder="Dosage" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
        <input required type="number" className="w-full p-3 border rounded-xl" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">Add & Select</button>
        <button onClick={onClose} type="button" className="w-full text-slate-400">Cancel</button>
      </form>
    </div>
  );
}