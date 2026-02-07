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
  Mail
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

  const handleAddMedicine = (newMed) => {
    const medObject = {
      id: newMed.id || Date.now(), 
      name: newMed.name,
      dosage: newMed.dosage,
      price: parseFloat(newMed.price)
    };
    setMedicineList(prev => [...prev, medObject]);
  };

  const handleDeleteMedicine = (id) => {
    if(window.confirm("Are you sure you want to delete this medicine?")) {
      setMedicineList(prev => prev.filter(m => m.id !== id));
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {currentView === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} db={db} appId={appId} />}
      {currentView === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} user={user} />}
      
      {['dashboard', 'prescription', 'history', 'settings', 'medicines'].includes(currentView) && (
        <div className="flex h-screen overflow-hidden bg-slate-100">
          <aside className="w-72 bg-[#0f172a] text-slate-400 flex-col hidden md:flex border-r border-slate-800 shadow-xl z-30">
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
                  {user?.name.charAt(0)}
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

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-20 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight capitalize">
                  {currentView === 'dashboard' ? 'Prescription Writer' : 
                   currentView === 'medicines' ? 'Medicine Inventory' : currentView}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-slate-500 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Clock className="w-4 h-4 text-blue-600" /> {new Date().toLocaleDateString()}
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-hidden relative bg-slate-50/50">
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
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function AuthScreen({ onAuthSuccess, db, appId }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', license: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            } else if (userData.status === 'pending') {
              setPendingUserEmail(emailId);
            } else {
              setError("Account rejected or disabled.");
            }
          } else {
            setError("Incorrect password.");
          }
        } else {
          setError("No account found.");
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
      console.error("Database Error:", err);
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
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex justify-center items-center">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    <div className="flex h-full w-full overflow-hidden">
      <div className="w-1/2 lg:w-3/5 p-6 lg:p-8 overflow-y-auto border-r border-slate-200">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
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

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="bg-emerald-100 p-1.5 rounded-lg"><Pill className="w-4 h-4 text-emerald-600" /></div>
              Prescribe Medicine
            </h3>
            <button onClick={() => setIsCustomModalOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> Custom Item
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 relative group focus-within:border-blue-300 focus-within:shadow-md transition-all">
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
                <input type="number" min="0" step="0.25" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={tempPrice} onChange={e => setTempPrice(e.target.value)} disabled={!selectedMed} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructions</label>
                <input type="text" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. 1 tab after meals" value={tempInstr} onChange={e => setTempInstr(e.target.value)} />
              </div>
              <div className="col-span-12">
                <button onClick={addItem} disabled={!selectedMed} className={`w-full py-3 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${selectedMed ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg transform active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  <Plus className="w-4 h-4" /> Add to List
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="mb-2">No medicines added yet.</div>
                <div className="text-xs">Search above to begin.</div>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={item.uniqueId} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm border border-slate-200">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-sm text-slate-500 flex gap-2 items-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">{item.dosage}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs border border-emerald-100">₱{item.price.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-slate-400 italic mt-1">{item.instructions}</div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
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

      <div className="w-1/2 lg:w-2/5 bg-slate-50 border-l border-slate-200 flex flex-col h-full">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Live Preview
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div className="bg-white w-full max-w-md shadow-xl border border-slate-200 p-8 min-h-[600px] text-sm relative">
            <div className="border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">{user.clinicDetails?.name || 'Clinic Name'}</h1>
              <p className="text-xs text-slate-600 whitespace-pre-line">{user.clinicDetails?.address || 'Clinic Address'}</p>
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
                 <p className="font-bold uppercase text-slate-900">{user.name}</p>
                 <div className="text-[10px] uppercase text-slate-500">Lic No: {user.license}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 font-medium">Total Estimated Cost</span>
            <span className="text-2xl font-bold text-blue-600">
              ₱{items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)}
            </span>
          </div>
          <button onClick={handleGenerate} disabled={items.length === 0 || !patient.name} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg">
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
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm shrink-0">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" /> Back to Editor
        </button>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 mr-4">ID: <span className="font-mono font-bold text-slate-800">{data.id}</span></div>
          <button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md transition-all">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="bg-white w-full max-w-2xl shadow-2xl print:shadow-none print:w-full p-12 relative text-slate-900 font-serif">
          <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900">{doctor.clinicDetails.name}</h1>
              <div className="mt-2 text-sm text-slate-600 font-sans space-y-0.5">
                <p>{doctor.clinicDetails.address}</p>
                <p>Tel: {doctor.clinicDetails.contactNumber}</p>
                <p>PTR: {doctor.clinicDetails.ptr}</p>
              </div>
            </div>
            <div className="text-right">
               <div className="w-24 h-24 bg-white border-2 border-slate-900 p-1 inline-block">
                  <img src={qrUrl} alt="Rx QR" className="w-full h-full object-cover" />
               </div>
               <p className="text-xs font-mono mt-1 text-slate-500 tracking-wider">{data.id}</p>
            </div>
          </div>

          <div className="mb-8 font-sans grid grid-cols-2 gap-y-2 text-sm border-b border-slate-200 pb-6">
            <div><span className="font-bold text-slate-500 uppercase text-xs">Patient Name</span><br/><span className="text-lg font-semibold">{data.patient.name}</span></div>
            <div className="text-right"><span className="font-bold text-slate-500 uppercase text-xs">Date</span><br/><span className="text-lg font-semibold">{data.date}</span></div>
            <div><span className="font-bold text-slate-500 uppercase text-xs">Age / Sex</span><br/><span>{data.patient.age} / {data.patient.sex}</span></div>
            <div className="text-right"><span className="font-bold text-slate-500 uppercase text-xs">Physician</span><br/><span className="uppercase">{doctor.name}</span></div>
          </div>

          <div className="min-h-[400px]">
            <div className="text-6xl font-bold text-slate-200 mb-6 font-sans">Rx</div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-xs font-bold uppercase text-slate-900 tracking-wider font-sans">
                  <th className="py-2">Medicine</th>
                  <th className="py-2 text-center">Dosage</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Instructions</th>
                </tr>
              </thead>
              <tbody className="font-sans">
                {data.items.map((item) => (
                  <tr key={item.uniqueId} className="border-b border-slate-100">
                    <td className="py-4 align-top font-bold text-lg">{item.name}</td>
                    <td className="py-4 align-top text-center text-slate-600">{item.dosage}</td>
                    <td className="py-4 align-top text-center font-bold text-lg">#{item.quantity}</td>
                    <td className="py-4 align-top text-right italic text-slate-600 max-w-[200px]">{item.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-end mt-12 pt-8">
            <div className="text-xs text-slate-400 font-sans w-1/2">
              <p>This prescription is digitally verified. Valid for dispensing at any MediVend Kiosk or licensed pharmacy.</p>
            </div>
            <div className="text-center w-64">
               <div className="h-px bg-slate-900 w-full mb-2"></div>
               <p className="font-bold uppercase text-sm">{doctor.name}</p>
               <p className="text-[10px] uppercase text-slate-500 tracking-wider">Lic No. {user.license}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- VIEW: MEDICINE MANAGER ---
function MedicineManager({ medicines, onAdd, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchQuery] = useState('');

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
             <input type="text" className="pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white" placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95">
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

// --- VIEW: HISTORY ---
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
      } catch (err) {
        console.error("Error fetching history", err);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [user.email]);

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
          <div className="text-sm text-slate-500">Showing last 50 records</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Date Issued</th>
                <th className="px-6 py-4">Reference ID</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400">Loading records...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400">No prescriptions found.</td></tr>
              ) : (
                history.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{record.date}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{record.id}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{record.patient.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-center">{record.items.length}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">₱{record.grandTotal.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- VIEW: SETTINGS ---
function SettingsView({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('account'); 
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: user.password || '', 
    clinicName: user.clinicDetails?.name || '',
    clinicAddress: user.clinicDetails?.address || '',
    clinicContact: user.clinicDetails?.contactNumber || '',
    ptr: user.clinicDetails?.ptr || '',
    s2: user.clinicDetails?.s2 || ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: user.name,
      email: user.email,
      clinicName: user.clinicDetails?.name || '',
      clinicAddress: user.clinicDetails?.address || '',
      clinicContact: user.clinicDetails?.contactNumber || '',
      ptr: user.clinicDetails?.ptr || '',
      s2: user.clinicDetails?.s2 || ''
    }));
  }, [user]);

  const handleSaveClinic = async () => {
    try {
      const newDetails = {
        name: formData.clinicName,
        address: formData.clinicAddress,
        contactNumber: formData.clinicContact,
        ptr: formData.ptr,
        s2: formData.s2
      };
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
      await updateDoc(doctorRef, { clinicDetails: newDetails });
      onUpdateUser({ ...user, clinicDetails: newDetails });
      alert("Clinic details updated successfully.");
    } catch (e) {
      alert("Error updating clinic details: " + e.message);
    }
  };

  const handleSaveAccount = async () => {
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
      await updateDoc(doctorRef, { name: formData.name });
      onUpdateUser({ ...user, name: formData.name });
      alert("Profile updated successfully.");
    } catch (e) {
      alert("Error updating profile: " + e.message);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Account & Settings</h2>
        <div className="flex gap-6">
          <div className="w-48 shrink-0">
             <div className="flex flex-col gap-1">
                <button onClick={() => setActiveTab('account')} className={`px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-all ${activeTab === 'account' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>My Profile</button>
                <button onClick={() => setActiveTab('clinic')} className={`px-4 py-2.5 text-sm font-medium rounded-lg text-left transition-all ${activeTab === 'clinic' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>Clinic Details</button>
             </div>
          </div>
          <div className="flex-1">
            {activeTab === 'account' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Personal Information</h3>
                  <p className="text-sm text-slate-500 mb-6">Manage your basic profile details.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Display Name</label>
                      <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                      <input type="email" disabled className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg cursor-not-allowed" value={formData.email} />
                      <p className="text-xs text-slate-400 mt-2">To change your email, please contact support.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button onClick={() => setShowPasswordModal(true)} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <Lock className="w-4 h-4" /> Change Password
                  </button>
                  <button onClick={handleSaveAccount} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'clinic' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Clinic Profile</h3>
                  <p className="text-sm text-slate-500 mb-6">These details will appear on all generated prescriptions.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hospital / Clinic Name</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200"><Building className="w-5 h-5 text-slate-400" /></div>
                        <input type="text" className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200"><MapPin className="w-5 h-5 text-slate-400" /></div>
                        <textarea rows="2" className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.clinicAddress} onChange={e => setFormData({...formData, clinicAddress: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact Number</label>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200"><Phone className="w-5 h-5 text-slate-400" /></div>
                        <input type="text" className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.clinicContact} onChange={e => setFormData({...formData, clinicContact: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">PTR No.</label>
                        <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.ptr} onChange={e => setFormData({...formData, ptr: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">S2 License</label>
                        <input type="text" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.s2} onChange={e => setFormData({...formData, s2: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button onClick={handleSaveClinic} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" /> Update Clinic Info
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <PasswordModal 
          onClose={() => setShowPasswordModal(false)}
          currentUser={user}
          onUpdate={async (newPass) => {
            try {
              const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
              await updateDoc(doctorRef, { password: newPass });
              setShowPasswordModal(false);
              alert("Password updated successfully.");
            } catch (e) {
              alert("Failed to update password.");
            }
          }}
        />
      )}
    </div>
  );
}

function PasswordModal({ onClose, currentUser, onUpdate }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (current !== currentUser.password) { setErr("Incorrect current password"); return; }
    if (newPass.length < 6) { setErr("Password must be at least 6 chars"); return; }
    if (newPass !== confirm) { setErr("Passwords do not match"); return; }
    onUpdate(newPass);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Change Password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" placeholder="Current Password" value={current} onChange={e => setCurrent(e.target.value)} />
          <input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" placeholder="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} />
          <input type="password" required className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" placeholder="Confirm New Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          {err && <p className="text-red-500 text-xs text-center">{err}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg">Update Password</button>
        </form>
      </div>
    </div>
  );
}

function CustomMedicineForm({ onClose, onAdd, initialName }) {
  const [formData, setFormData] = useState({ name: initialName || '', dosage: '', price: '' });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.price) {
      onAdd(formData);
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">Add Custom Medicine</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicine Name</label>
          <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Bioflu" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Default Dosage</label>
          <input required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 500mg Tab" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Standard Price (₱)</label>
          <input required type="number" step="0.25" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md mt-2">Add & Select</button>
      </form>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'} transition-colors` })}
      <span className="font-medium text-sm">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );
}
