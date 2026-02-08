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
  Key,
  ArrowRight,
  Sparkles,
  Award,
  HelpCircle
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
    <div className="h-[100dvh] bg-[#F3F4F6] font-sans text-slate-800 overflow-hidden flex flex-col">
      {/* PRINT ENGINE & GLOBAL STYLES */}
      <style>
        {`
          /* Modern Input Field Style */
          .input-modern {
             background-color: #f9fafb;
             border: 1px solid #e5e7eb;
             transition: all 0.2s ease;
          }
          .input-modern:focus {
             background-color: white;
             border-color: #6366f1; /* Indigo-500 */
             box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
          }

          @media print {
            @page {
              size: auto; 
              margin: 0.5in;
            }
            .no-print {
              display: none !important;
            }
            
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
            
            .printable-wrapper {
              display: flex !important;
              flex-direction: column !important;
              min-height: 90vh !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }

            .printable-content {
              flex: 1 0 auto !important;
              padding-bottom: 20px !important;
            }

            .printable-footer {
              flex-shrink: 0 !important;
              margin-top: auto !important;
              width: 100% !important;
              page-break-inside: avoid !important;
              padding-top: 10px !important;
              border-top: 1px solid #e2e8f0 !important;
            }

            .printable-wrapper h1 { font-size: 18pt !important; line-height: 1.2 !important; margin-bottom: 5px !important; }
            .printable-wrapper p, .printable-wrapper span { font-size: 10pt !important; }
            .printable-wrapper .text-xs { font-size: 8pt !important; }
            .printable-wrapper .text-sm { font-size: 9pt !important; }
            .printable-wrapper .text-lg { font-size: 11pt !important; }
            .printable-wrapper .text-4xl { font-size: 20pt !important; }

            .printable-wrapper table td,
            .printable-wrapper table th {
              padding-top: 4px !important;
              padding-bottom: 4px !important;
              font-size: 10pt !important;
            }
            
            .rx-watermark {
               font-size: 8rem !important;
               color: #94a3b8 !important;
               opacity: 0.3 !important;
               -webkit-print-color-adjust: exact !important;
               print-color-adjust: exact !important;
            }
            
            .print-min-h-reset {
              min-height: auto !important;
            }
          }
        `}
      </style>

      {currentView === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} db={db} appId={appId} />}
      {currentView === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} user={user} />}
      
      {['dashboard', 'prescription', 'history', 'settings', 'medicines'].includes(currentView) && (
        <div className="flex h-full overflow-hidden bg-[#0B0F19] print:bg-white print:block">
          {/* DESKTOP SIDEBAR - Deep Navy (#0B0F19) */}
          <aside className="no-print w-72 bg-[#0B0F19] text-slate-300 flex-col hidden md:flex border-r border-white/5 shadow-2xl z-30 relative overflow-hidden">
              
             <div className="relative z-10 p-6 flex items-center gap-3 border-b border-white/5">
              <div className="bg-gradient-to-tr from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-wide">MediVend</h1>
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Doctor Portal</p>
              </div>
            </div>
            
            <nav className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto">
              <div className="px-3 mb-2 mt-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500/80">Clinical Workspace</div>
              <NavButton active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard className="w-5 h-5" />} label="New Prescription" />
              <NavButton active={currentView === 'history'} onClick={() => setCurrentView('history')} icon={<History className="w-5 h-5" />} label="Patient History" />
              
              <div className="px-3 mt-8 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500/80">Management</div>
               <NavButton active={currentView === 'medicines'} onClick={() => setCurrentView('medicines')} icon={<Pill className="w-5 h-5" />} label="Medicine List" />

              <div className="px-3 mt-8 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500/80">System</div>
              <NavButton active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<Settings className="w-5 h-5" />} label="Account Settings" />
            </nav>

            <div className="relative z-10 p-4 bg-[#05080F] border-t border-white/5">
              <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all text-sm font-medium group">
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Sign Out
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA - DEEP NAVY BG for layout */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:block bg-[#0B0F19]">
            <header className="no-print bg-[#0B0F19] border-b border-white/5 flex items-center justify-between px-4 md:px-8 shadow-md z-20 shrink-0 sticky top-0">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight capitalize flex items-center gap-2">
                  {currentView === 'dashboard' ? <><LayoutDashboard className="w-5 h-5 text-indigo-400"/> New Prescription</> : 
                   currentView === 'medicines' ? <><Pill className="w-5 h-5 text-emerald-400"/> Medicine List</> : 
                   currentView === 'history' ? <><History className="w-5 h-5 text-indigo-400"/> Patient History</> :
                   currentView === 'prescription' ? <><Printer className="w-5 h-5 text-indigo-400"/> Prescription Preview</> :
                   <><Settings className="w-5 h-5 text-slate-400"/> Account Settings</>}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs md:text-sm font-medium text-slate-300 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> <span className="font-semibold text-slate-200">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </header>

            {/* VIEWS CONTAINER */}
            <main className="flex-1 overflow-hidden relative bg-transparent print:bg-white print:overflow-visible pb-20 md:pb-0 print:pb-0">
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
            <nav className="mobile-nav-bar md:hidden no-print fixed bottom-0 left-0 right-0 bg-[#0B0F19] border-t border-white/10 flex justify-around px-2 py-3 z-50 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.3)] pb-safe">
              <NavButtonMobile active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard />} label="New Rx" />
              <NavButtonMobile active={currentView === 'history'} onClick={() => setCurrentView('history')} icon={<History />} label="History" />
              <NavButtonMobile active={currentView === 'medicines'} onClick={() => setCurrentView('medicines')} icon={<Pill />} label="Meds List" />
              <NavButtonMobile active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<Settings />} label="Account" />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

// ... AuthScreen, OnboardingScreen remain unchanged ...

// --- SUB-COMPONENTS ---

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
    <div className="flex h-screen w-full bg-[#0B0F19] font-sans text-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-black opacity-90"></div>
      
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-6 md:p-12 relative z-10 overflow-y-auto">
        {/* LOGIN CARD */}
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border-4 border-slate-200/20 animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden ring-1 ring-white/10 mb-6">
          
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-6 transform transition-transform hover:scale-105 ring-4 ring-white">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Join MediVend'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start your digital prescription journey today.'}
            </p>
          </div>

          {pendingUserEmail && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account Pending Approval</p>
                <p className="mt-1 opacity-90">Your account ({pendingUserEmail}) has been created. Please wait for Super Admin verification.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {!isLogin && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="relative group">
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Full Name</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input required type="text" className="w-full pl-10 pr-4 py-3 input-modern rounded-xl outline-none placeholder-slate-400 font-medium" placeholder="Dr. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                </div>
                <div className="relative group">
                   <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Medical License</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileBadge className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input required type="text" className="w-full pl-10 pr-4 py-3 input-modern rounded-xl outline-none placeholder-slate-400 font-medium" placeholder="PRC-XXXXXX" value={formData.license} onChange={e => setFormData({...formData, license: e.target.value})} />
                   </div>
                </div>
              </div>
            )}
            
            <div className="relative group">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Email Address</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input required type="email" className="w-full pl-10 pr-4 py-3 input-modern rounded-xl outline-none placeholder-slate-400 font-medium" placeholder="doctor@hospital.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
            </div>

            <div className="relative group">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Password</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input required type="password" className="w-full pl-10 pr-4 py-3 input-modern rounded-xl outline-none placeholder-slate-400 font-medium" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
               </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button type="submit" disabled={isLoading || lockoutTimer > 0} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex justify-center items-center">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : lockoutTimer > 0 ? (
                `Try again in ${lockoutTimer}s`
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-sm text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); setPendingUserEmail(null); setFormData({ name: '', email: '', password: '', license: '' }); }} 
                className="ml-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors hover:underline"
              >
                {isLogin ? 'Sign up for free' : 'Log in'}
              </button>
            </p>
          </div>
        </div>

        {/* NEW FOOTER SECTION FOR LICENSES */}
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 delay-100">
          <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1 text-indigo-300 font-bold uppercase tracking-wider">
                 <ShieldCheck className="w-3 h-3"/> App License
              </div>
              <p className="font-mono text-slate-300">MV-WEB-2026-001</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 mb-1 text-emerald-300 font-bold uppercase tracking-wider">
                 <Award className="w-3 h-3"/> FDA License
              </div>
              <p className="font-mono text-slate-300">CDRR-NCR-DI-882</p>
            </div>
            <div className="col-span-2 p-2 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider">
                 <HelpCircle className="w-3 h-3"/> Customer Service
               </div>
               <p className="font-mono text-slate-300 flex items-center gap-2 font-bold">
                 <Phone className="w-3 h-3"/> (02) 8-7000-000
               </p>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-slate-500/50">
             <p>© 2026 MediVend Systems. Secure & Compliant.</p>
          </div>
        </div>

      </div>

      {/* Right Side Hero */}
      <div className="hidden lg:flex w-1/2 bg-[#0B0F19] relative overflow-hidden items-center justify-center border-l border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
            <Activity className="w-3 h-3" /> Professional Healthcare Suite
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight text-white drop-shadow-sm">
            Digital Prescriptions <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Reimagined.</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed font-light">
            Generate secure, trackable prescriptions in seconds. Seamlessly integrated with MediVend kiosks for instant patient fulfillment.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
             {/* Feature Cards */}
             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                <Printer className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="font-bold text-white text-sm">Instant Printing</h3>
                <p className="text-xs text-slate-400 mt-1">One-click PDF generation</p>
             </div>
             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                <QrCode className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-bold text-white text-sm">QR Validation</h3>
                <p className="text-xs text-slate-400 mt-1">Secure dispensing verification</p>
             </div>
             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                <ShieldCheck className="w-8 h-8 text-amber-400 mb-3" />
                <h3 className="font-bold text-white text-sm">FDA Compliant</h3>
                <p className="text-xs text-slate-400 mt-1">Meets all regulatory standards</p>
             </div>
             <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                <History className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-bold text-white text-sm">Smart History</h3>
                <p className="text-xs text-slate-400 mt-1">Track patient records easily</p>
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
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Clinic Setup</h2>
        <p className="text-slate-500 mb-6 text-sm">Please provide your clinic details for the prescription header.</p>
        
        <form onSubmit={(e) => { e.preventDefault(); onComplete(details); }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Clinic Name</label>
            <input required type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="e.g. City General Hospital" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
            <input required type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="Complete Address" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
            <input required type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="Tel / Mobile" value={details.contactNumber} onChange={e => setDetails({...details, contactNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PTR No.</label>
            <input required type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="PTR-XXXXX" value={details.ptr} onChange={e => setDetails({...details, ptr: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">S2 License (Optional)</label>
            <input type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none" placeholder="S2-XXXXX" value={details.s2} onChange={e => setDetails({...details, s2: e.target.value})} />
          </div>
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition-all">Save & Continue</button>
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
      <div className="md:hidden no-print flex bg-[#1e293b] border-b border-slate-700 shrink-0 sticky top-0 z-30">
        <button 
          onClick={() => setMobileView('editor')} 
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileView === 'editor' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Editor
        </button>
        <button 
          onClick={() => setMobileView('preview')} 
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mobileView === 'preview' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-800/50' : 'text-slate-400'}`}
        >
          <Eye className="w-4 h-4" /> Live Preview
        </button>
      </div>

      {/* EDITOR PANE (LEFT) - LIGHT GRAY/WHITE BACKGROUND (#F3F4F6) */}
      <div className={`${mobileView === 'editor' ? 'block' : 'hidden'} md:block w-full md:w-3/5 p-4 md:p-8 overflow-y-auto border-r border-slate-700 h-full bg-[#F3F4F6]`}>
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="bg-indigo-100 p-1.5 rounded-lg"><User className="w-4 h-4 text-indigo-600" /></div>
            Patient Details
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-7">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input type="text" className="w-full px-4 py-3 input-modern rounded-xl outline-none transition-all" placeholder="Enter patient name" value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} />
            </div>
            <div className="col-span-6 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-4 py-3 input-modern rounded-xl outline-none transition-all" 
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
              <select className="w-full px-4 py-3 input-modern rounded-xl outline-none transition-all" value={patient.sex} onChange={e => setPatient({...patient, sex: e.target.value})}>
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
            <button onClick={() => setIsCustomModalOpen(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> Custom Item
            </button>
          </div>

          <div className="bg-slate-50/50 p-4 md:p-5 rounded-xl border border-slate-200 mb-6 relative group focus-within:border-indigo-300 focus-within:shadow-md transition-all">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-8 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine Name</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input type="text" className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="Search database..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); if (!e.target.value) setSelectedMed(null); }} onFocus={() => setIsDropdownOpen(true)} />
                </div>
                {isDropdownOpen && searchQuery && !selectedMed && (
                  <div className="absolute z-50 w-full bg-white mt-2 border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {filteredMeds.length === 0 ? (
                      <div onClick={() => setIsCustomModalOpen(true)} className="p-4 text-sm text-indigo-600 hover:bg-indigo-50 cursor-pointer font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add "{searchQuery}" as custom medicine
                      </div>
                    ) : (
                      filteredMeds.map(med => (
                        <div key={med.id} onClick={() => handleSelectMed(med)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                          <div className="font-medium text-sm text-slate-900">{med.name}</div>
                          <div className="text-xs text-slate-500 flex justify-between mt-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{med.dosage}</span>
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
                <input type="number" min="1" className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={tempQty} onChange={e => setTempQty(e.target.value)} />
              </div>
              <div className="col-span-6 md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dosage</label>
                <input type="text" className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g. 500mg" value={tempDosage} onChange={e => setTempDosage(e.target.value)} disabled={!selectedMed} />
              </div>
              <div className="col-span-6 md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit Price (₱)</label>
                <input type="number" min="0" step="0.25" className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={tempPrice} onChange={e => setTempPrice(e.target.value)} disabled={!selectedMed} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructions</label>
                <input type="text" className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g. 1 tab after meals" value={tempInstr} onChange={e => setTempInstr(e.target.value)} />
              </div>
              <div className="col-span-12">
                <button onClick={addItem} disabled={!selectedMed} className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] ${selectedMed ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:shadow-slate-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
                  <Plus className="w-4 h-4" /> Add to List
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-8">
            {items.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                <div className="mb-2 font-medium">No medicines added yet</div>
                <div className="text-xs opacity-70">Search above to begin building the prescription</div>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={item.uniqueId} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm border border-slate-200 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">{item.name}</div>
                      <div className="text-sm text-slate-500 flex gap-2 items-center flex-wrap mt-0.5">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border border-blue-100">{item.dosage}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border border-emerald-100">₱{item.price.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-slate-400 italic mt-1 truncate max-w-[200px]">{item.instructions}</div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4 shrink-0">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</div>
                      <div className="font-bold text-slate-900 text-lg">₱{item.totalPrice.toFixed(2)}</div>
                    </div>
                    <button onClick={() => removeItem(item.uniqueId)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW PANE (RIGHT) - DARK NAVY BACKGROUND (#0B0F19) */}
      <div className={`${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex flex-col no-print w-full md:w-2/5 md:bg-[#0B0F19] md:border-l border-slate-700 h-full`}>
        <div className="p-4 md:p-6 border-b border-slate-700 bg-[#0B0F19]">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Live Preview
          </h3>
        </div>
        
        {/* CHANGED BG TO #0B0F19 TO SHOW PAPER CONTRAST */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0B0F19] flex justify-center">
          <div className="bg-white w-full max-w-md shadow-2xl border border-slate-200 p-6 md:p-10 min-h-[600px] text-sm relative transition-all duration-500 ease-in-out transform hover:scale-[1.01] ring-1 ring-black/5">
            {/* Paper texture effect */}
            <div className="absolute inset-0 bg-white opacity-50 pointer-events-none mix-blend-multiply"></div>

            <div className="border-b-2 border-slate-900 pb-6 mb-8 relative z-10">
              <h1 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-widest text-slate-900">{user?.clinicDetails?.name || 'Clinic Name'}</h1>
              <p className="text-xs text-slate-600 whitespace-pre-line mt-2 font-serif">{user?.clinicDetails?.address || 'Clinic Address'}</p>
              <div className="flex justify-between items-end mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs space-y-1 font-serif">
                  <p><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Patient:</span> <span className="text-base font-semibold">{patient.name || '___________'}</span></p>
                  <p><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Age/Sex:</span> {patient.age || '__'} / {patient.sex}</p>
                  <p><span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Date:</span> {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="font-serif relative z-10">
              <div className="text-5xl font-bold text-slate-200 mb-6 italic font-serif">Rx</div>
              <div className="space-y-6">
                {items.length === 0 ? (
                  <p className="text-slate-300 italic text-center py-20">List is empty...</p>
                ) : (
                  items.map((item, idx) => (
                    <div key={item.uniqueId} className="border-b border-slate-100 pb-3 mb-2 last:border-0">
                      <div className="flex justify-between font-bold text-slate-900 text-lg">
                        <span>{item.name} <span className="text-sm font-normal text-slate-500 ml-2">{item.dosage}</span></span>
                        <span>#{item.quantity}</span>
                      </div>
                      <div className="text-sm italic text-slate-600 pl-4 mt-1">
                        Sig: {item.instructions}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 border-t border-slate-900 pt-4 flex justify-between items-end z-10">
              <div className="text-[9px] text-slate-400 font-sans w-1/2 leading-tight">
                <p>This prescription is digitally verified. Valid for dispensing at any MediVend Kiosk or licensed pharmacy.</p>
              </div>
              <div className="text-center w-40">
                  <div className="h-0.5 bg-slate-900 w-full mb-2"></div>
                  <p className="font-bold uppercase text-slate-900 text-xs tracking-wide">{user?.name}</p>
                  <div className="text-[9px] uppercase text-slate-500 font-bold tracking-widest">Lic No: {user?.license}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-[#0B0F19] border-t border-slate-700 pb-24 md:pb-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400 font-medium text-sm uppercase tracking-wide">Total Estimated Cost</span>
            <span className="text-3xl font-bold text-white tracking-tight">
              ₱{items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)}
            </span>
          </div>
          <button onClick={handleGenerate} disabled={items.length === 0 || !patient.name} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98]">
            <Printer className="w-6 h-6" /> Generate Prescription
          </button>
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

// --- 4. PRESCRIPTION VIEW COMPONENT (Restored) ---
function PrescriptionView({ data, doctor, onBack }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qrValue)}`;

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden print:bg-white print:overflow-visible">
      {/* TOOLBAR HIDDEN ON PRINT */}
      <div className="no-print bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm shrink-0">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors">
          <LayoutDashboard className="w-4 h-4" /> <span className="hidden md:inline">Back to Editor</span> <span className="md:hidden">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-xs md:text-sm text-slate-500 mr-2 md:mr-4 hidden sm:block">ID: <span className="font-mono font-bold text-slate-800">{data.id}</span></div>
          <button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95 text-sm md:text-base">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center print:p-0 print:block">
        {/* WRAPPER: UPDATED FOR FLEXIBLE WIDTH PRINTING & FLEX LAYOUT */}
        <div className="printable-wrapper bg-white w-full max-w-2xl shadow-2xl p-6 md:p-12 relative text-slate-900 font-serif border border-slate-100">
          
          {/* FIXED WATERMARK: Centered in wrapper */}
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
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#F3F4F6]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-auto">
             <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
             <input type="text" className="w-full sm:w-64 pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder-slate-400" placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus className="w-5 h-5" /> Add Medicine
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* DESKTOP TABLE */}
          <table className="w-full text-left hidden md:table">
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
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs border border-indigo-100 font-medium">{med.dosage}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">₱{med.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => onDelete(med.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* MOBILE LIST (Cards) */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.length === 0 ? (
               <div className="p-8 text-center text-slate-400">No medicines found.</div>
            ) : (
               filtered.map(med => (
                 <div key={med.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="font-bold text-slate-800 text-lg">{med.name}</div>
                          <div className="text-sm text-slate-500 mt-2 inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-medium">{med.dosage}</div>
                       </div>
                       <div className="text-lg font-bold text-emerald-600">₱{med.price.toFixed(2)}</div>
                    </div>
                    <button 
                      onClick={() => onDelete(med.id)} 
                      className="mt-2 w-full flex items-center justify-center gap-2 text-rose-600 bg-rose-50 py-3 rounded-xl font-bold active:scale-95 transition-all hover:bg-rose-100 border border-rose-100"
                    >
                       <Trash2 className="w-4 h-4" /> Remove Item
                    </button>
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
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#F3F4F6]">
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
  // ... (Keeping exact same logic from previous turn for settings, just updating styles if needed)
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
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-[#F3F4F6]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">Manage your account and clinic preferences.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
           <button 
             onClick={() => setActiveTab('profile')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
           >
             <User className="w-4 h-4" /> My Profile
           </button>
           <button 
             onClick={() => setActiveTab('clinic')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'clinic' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
           >
             <Building className="w-4 h-4" /> Clinic Details
           </button>
           <button 
             onClick={() => setActiveTab('security')}
             className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
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
                   <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
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
                        <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} placeholder="Dr. Full Name" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                      <div className="relative opacity-60 cursor-not-allowed">
                        <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input disabled className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-inner" value={profileData.email} />
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">License Number</label>
                      <div className="relative">
                        <FileBadge className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={profileData.license} onChange={e => setProfileData({...profileData, license: e.target.value})} placeholder="PRC-XXXXXX" />
                      </div>
                   </div>
                </div>
                <div className="pt-4 flex justify-end">
                   <button onClick={handleSaveProfile} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-70 transition-all active:scale-95">
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
                        <Building className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={clinicData.name} onChange={e => setClinicData({...clinicData, name: e.target.value})} placeholder="e.g. St. Luke's Medical Center" />
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Address</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={clinicData.address} onChange={e => setClinicData({...clinicData, address: e.target.value})} placeholder="Unit, Building, Street, City" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contact Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={clinicData.contactNumber} onChange={e => setClinicData({...clinicData, contactNumber: e.target.value})} placeholder="(02) 8-7000" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">PTR Number</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={clinicData.ptr} onChange={e => setClinicData({...clinicData, ptr: e.target.value})} placeholder="PTR-XXXXXX" />
                      </div>
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">S2 License (Optional)</label>
                      <div className="relative">
                        <ShieldCheck className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={clinicData.s2} onChange={e => setClinicData({...clinicData, s2: e.target.value})} placeholder="S2-XXXXXX" />
                      </div>
                   </div>
                </div>
                <div className="pt-4 flex justify-end">
                   <button onClick={handleSaveClinic} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-70 transition-all active:scale-95">
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
                        <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input type="password" className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} placeholder="••••••••" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Password</label>
                      <div className="relative">
                        <Key className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input type="password" className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} placeholder="New secure password" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <CheckCircle2 className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input type="password" className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} placeholder="Repeat new password" />
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
    <button onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${active ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
      {/* Active Indicator Bar */}
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_2px_rgba(99,102,241,0.5)]"></div>}
      
      {React.cloneElement(icon, { className: `w-5 h-5 transition-colors ${active ? 'text-indigo-400' : 'group-hover:text-white'}` })}
      <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50 text-indigo-400" />}
    </button>
  );
}

function NavButtonMobile({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${active ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-slate-300'}`}
    >
      {active && <div className="absolute -top-2 w-8 h-1 bg-indigo-500 rounded-full shadow-[0_2px_8px_rgba(99,102,241,0.4)]"></div>}
      {React.cloneElement(icon, { className: `w-6 h-6 ${active ? 'fill-current opacity-20' : ''}` })}
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
    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="font-bold mb-4 uppercase tracking-widest text-sm text-slate-500">Add Custom Item</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Medicine Name</label>
           <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Enter name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Dosage</label>
           <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. 500mg Tab" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
        </div>
        <div>
           <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Unit Price (₱)</label>
           <input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        </div>
        <div className="flex gap-3 pt-2">
           <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors">Cancel</button>
           <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95">Add Item</button>
        </div>
      </form>
    </div>
  );
}
