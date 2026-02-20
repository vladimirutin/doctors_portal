import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, Lock, Stethoscope, Plus, Trash2, Printer, LayoutDashboard, Clock, History, Settings, Pill, Save, X, Building, Phone, MapPin, FileBadge, Search, AlertCircle, FileText, LogOut, ShieldCheck, ChevronRight, Activity, QrCode, CheckCircle2, Mail, Eye, EyeOff, Key, ArrowRight, Award, HelpCircle, Sun, Moon, Pencil, Download, Megaphone, AlertTriangle, LifeBuoy, Globe, Database
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, getDocs, query, where, limit, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

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

// ── Ripple hook ──
function useRipple() {
  const [ripples, setRipples] = useState([]);
  const trigger = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 700);
  }, []);
  const rippleEls = ripples.map(r => (
    <span
      key={r.id}
      className="ripple-el"
      style={{ left: r.x, top: r.y }}
    />
  ));
  return { trigger, rippleEls };
}

// ── NavButton ──
function NavButton({ active, onClick, icon, label, isDarkMode, badge }) {
  const { trigger, rippleEls } = useRipple();
  return (
    <button
      onClick={(e) => { trigger(e); onClick(); }}
      className={`nav-btn relative flex w-full items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden ${
        active
          ? 'nav-btn-active text-white shadow-lg'
          : isDarkMode
            ? 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
      }`}
    >
      {rippleEls}
      {active && <span className="nav-active-glow" />}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-cyan-300 to-indigo-400 rounded-r-full" />
      )}
      <span className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {React.cloneElement(icon, { className: 'w-[18px] h-[18px]' })}
      </span>
      <span className="relative z-10 font-bold text-[11px] uppercase tracking-[0.12em] flex-1 text-left">{label}</span>
      {badge && (
        <span className="relative z-10 text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
      {active && <ChevronRight className="relative z-10 w-3 h-3 opacity-50" />}
    </button>
  );
}

// ── NavButtonMobile ──
function NavButtonMobile({ active, onClick, icon, label, isDarkMode }) {
  const { trigger, rippleEls } = useRipple();
  return (
    <button
      onClick={(e) => { trigger(e); onClick(); }}
      className={`mobile-nav-btn relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 overflow-hidden ${
        active
          ? 'text-white'
          : isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {rippleEls}
      {active && (
        <>
          <span className="mobile-nav-active-bg" />
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_2px_12px_rgba(99,102,241,0.7)]" />
        </>
      )}
      <span className={`relative z-10 transition-all duration-300 ${active ? 'scale-110 -translate-y-0.5' : ''}`}>
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </span>
      <span className="relative z-10 text-[9px] font-bold uppercase tracking-[0.1em]">{label}</span>
    </button>
  );
}

// ── GlassCard ──
function GlassCard({ children, className = '', isDarkMode, glow, hover }) {
  return (
    <div className={`glass-card rounded-3xl border transition-all duration-300 ${
      isDarkMode
        ? `bg-white/[0.03] border-white/[0.07] ${glow ? 'shadow-[0_0_60px_rgba(99,102,241,0.1)]' : ''} ${hover ? 'hover:border-white/[0.12] hover:bg-white/[0.05]' : ''}`
        : `bg-white border-slate-200 ${glow ? 'shadow-[0_8px_40px_rgba(99,102,241,0.08)]' : 'shadow-sm'} ${hover ? 'hover:border-indigo-200 hover:shadow-md' : ''}`
    } ${className}`}>
      {children}
    </div>
  );
}

// ── PrimaryButton ──
function PrimaryButton({ children, onClick, disabled, className = '', variant = 'indigo', size = 'md', loading, type }) {
  const { trigger, rippleEls } = useRipple();
  const handleClick = (e) => {
    if (disabled || loading) return;
    trigger(e);
    onClick?.(e);
  };

  const variants = {
    indigo: 'btn-indigo',
    emerald: 'btn-emerald',
    danger: 'btn-danger',
    dark: 'btn-dark',
    ghost: 'btn-ghost',
    cyan: 'btn-cyan',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[11px]',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-6 py-3.5 text-sm',
    xl: 'px-8 py-4 text-sm',
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        primary-btn relative overflow-hidden text-white font-bold rounded-2xl
        shadow-lg transition-all duration-200 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed
        flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {rippleEls}
      <span className="btn-shine" />
      {loading
        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        : <span className="relative z-10 flex items-center gap-2">{children}</span>
      }
    </button>
  );
}

// ── Badge ──
function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return (
    <span className={`badge inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ── Input Field ──
function Field({ label, icon: Icon, isDarkMode, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className={`block text-[9px] font-black uppercase tracking-[0.15em] mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors z-10" />}
        {children}
      </div>
    </div>
  );
}

function inputClass(isDarkMode, hasIcon = true) {
  return `w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all duration-200
    focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/70 focus:shadow-[0_0_20px_rgba(99,102,241,0.12)]
    ${isDarkMode 
      ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-slate-600 hover:border-white/[0.15]' 
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 hover:border-slate-300'
    }`;
}

// ── Custom Medicine Form ──
function CustomMedicineForm({ onClose, onAdd, initialName, isDarkMode }) {
  const [formData, setFormData] = useState({ name: initialName || '', dosage: '', price: '' });
  const handleSubmit = (e) => { e.preventDefault(); if (formData.name) onAdd(formData); };
  return (
    <div className={`modal-card rounded-3xl p-8 w-full max-w-sm shadow-2xl border backdrop-blur-2xl ${isDarkMode ? 'bg-[#0d1220]/95 border-white/10' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="icon-wrap p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/25">
          <Pill className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className={`font-black text-base tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Add Custom Item</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Fill in medicine details below</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: 'Medicine Name', key: 'name', placeholder: 'e.g. Losartan', type: 'text', icon: Pill },
          { label: 'Dosage Form', key: 'dosage', placeholder: 'e.g. 50mg Tab', type: 'text', icon: FileText },
          { label: 'Unit Price (₱)', key: 'price', placeholder: '0.00', type: 'number', icon: null },
        ].map(({ label, key, placeholder, type, icon: Icon }) => (
          <Field key={key} label={label} isDarkMode={isDarkMode} icon={Icon}>
            <input
              required type={type}
              className={inputClass(isDarkMode, !!Icon)}
              placeholder={placeholder}
              value={formData[key]}
              onChange={e => setFormData({ ...formData, [key]: e.target.value })}
            />
          </Field>
        ))}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/[0.08]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'}`}>
            Cancel
          </button>
          <PrimaryButton type="submit" className="flex-1 py-3 justify-center">Add Item</PrimaryButton>
        </div>
      </form>
    </div>
  );
}

// ── Confirmation Modal ──
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = "Confirm", isLoading = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-lg p-4">
      <div className={`modal-card w-full max-w-sm border overflow-hidden ${type === 'danger' ? 'bg-white border-rose-100' : 'bg-white border-indigo-50'}`} style={{ borderRadius: 28 }}>
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mx-auto ${
            type === 'danger' 
              ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-[0_8px_32px_rgba(244,63,94,0.35)]' 
              : 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_8px_32px_rgba(99,102,241,0.35)]'
          }`}>
            {type === 'danger' ? <AlertTriangle className="w-7 h-7 text-white" /> : <CheckCircle2 className="w-7 h-7 text-white" />}
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="bg-slate-50 p-5 flex gap-3 border-t border-slate-100">
          <button onClick={onClose} disabled={isLoading} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all disabled:opacity-50">
            Cancel
          </button>
          <PrimaryButton onClick={onConfirm} disabled={isLoading} loading={isLoading} variant={type === 'danger' ? 'danger' : 'indigo'} className="flex-1 justify-center py-3">
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════
function AuthScreen({ onAuthSuccess, db, appId }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', license: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  useEffect(() => {
    let interval;
    if (lockoutTimer > 0) {
      interval = setInterval(() => setLockoutTimer(p => p - 1), 1000);
    } else if (failedAttempts >= 5) {
      setFailedAttempts(0); setError('');
    }
    return () => clearInterval(interval);
  }, [lockoutTimer, failedAttempts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setError(''); setPendingUserEmail(null); setIsLoading(true);
    const emailId = formData.email.toLowerCase().trim();
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', emailId);
      if (isLogin) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = { id: docSnap.id, email: docSnap.data().email || docSnap.id, ...docSnap.data() };
          if (userData.password === formData.password) {
            if (userData.status === 'active') { onAuthSuccess(userData); setFailedAttempts(0); }
            else if (userData.status === 'pending') { setPendingUserEmail(emailId); }
            else { setError("Account rejected or disabled."); }
          } else {
            const newCount = failedAttempts + 1; setFailedAttempts(newCount);
            if (newCount >= 5) { setLockoutTimer(10); setError("Maximum attempts reached. Please wait 10s."); }
            else { setError(`Incorrect password. ${5 - newCount} attempts remaining.`); }
          }
        } else { setError(`No account found.`); }
      } else {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) { setError("Account already exists. Please log in."); }
        else {
          await setDoc(docRef, { name: formData.name, email: emailId, password: formData.password, license: formData.license, status: 'pending', clinicDetails: null, createdAt: serverTimestamp() });
          setPendingUserEmail(emailId); setIsLogin(true);
        }
      }
    } catch (err) { setError("Connection error. Check your internet connection."); }
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-black opacity-90"></div>

      {/* LEFT: Form */}
      <div className={`auth-panel-left w-full lg:w-[480px] h-full relative z-10 overflow-y-auto flex flex-col items-center justify-center p-6 lg:p-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
        {/* Logo */}
        <div className="w-full max-w-sm mb-8">
          <div className="flex items-center gap-3">
            <div className="logo-icon relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.45)]">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#060b18] shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">MediVend</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.25em]">Doctor Portal</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="auth-card rounded-3xl border border-white/[0.08] p-8 shadow-2xl overflow-hidden">
            <div className="auth-card-glow" />
            <div className="relative z-10">
              <div className="mb-7">
                <h2 className="text-3xl font-black text-white tracking-tight mb-1.5">
                  {isLogin ? 'Welcome back' : 'Join MediVend'}
                </h2>
                <p className="text-slate-500 text-sm">{isLogin ? 'Sign in to your clinical dashboard.' : 'Create your doctor account.'}</p>
              </div>

              {pendingUserEmail && (
                <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-bold text-amber-200 text-sm">Account Pending Approval</p>
                    <p className="mt-0.5 opacity-70 text-xs">Your account is under review by the admin.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {!isLogin && (
                  <div className="space-y-3.5 form-slide-in">
                    <Field label="Full Name" icon={User} isDarkMode>
                      <input required type="text" className={inputClass(true)} placeholder="Dr. Juan dela Cruz" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </Field>
                    <Field label="PRC License No." icon={FileBadge} isDarkMode>
                      <input required type="text" className={inputClass(true)} placeholder="PRCL-XXXXXX" value={formData.license} onChange={e => setFormData({ ...formData, license: e.target.value })} />
                    </Field>
                  </div>
                )}
                <Field label="Email Address" icon={Mail} isDarkMode>
                  <input required type="email" className={inputClass(true)} placeholder="doctor@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </Field>
                <Field label="Password" icon={Lock} isDarkMode>
                  <input required type={showPassword ? 'text' : 'password'} className={`${inputClass(true)} pr-11`} placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5 z-10">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </Field>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <PrimaryButton onClick={handleSubmit} disabled={isLoading || lockoutTimer > 0} loading={isLoading} size="lg" className="w-full justify-center mt-2">
                  {lockoutTimer > 0 ? `Wait ${lockoutTimer}s` : isLogin ? (<>Sign In <ArrowRight className="w-4 h-4" /></>) : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
                </PrimaryButton>
              </form>

              <div className="mt-5 text-center">
                <p className="text-sm text-slate-600">
                  {isLogin ? "New to MediVend?" : "Already have an account?"}
                  <button
                    onClick={() => { setIsLogin(!isLogin); setError(''); setPendingUserEmail(null); setFormData({ name: '', email: '', password: '', license: '' }); }}
                    className="ml-2 text-indigo-400 font-bold hover:text-cyan-300 transition-colors"
                  >
                    {isLogin ? 'Create account' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Info strip */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {[
              { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'FDA Licensed', value: 'CDRR-NCR-882', color: 'text-emerald-400' },
              { icon: <Award className="w-3.5 h-3.5" />, label: 'App License', value: 'MV-WEB-2026', color: 'text-indigo-400' },
              { icon: <Phone className="w-3.5 h-3.5" />, label: 'Support', value: '09273523900', color: 'text-amber-400' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="auth-info-chip rounded-2xl border border-white/[0.06] p-3 text-center">
                <div className={`flex justify-center mb-1.5 ${color}`}>{icon}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{label}</div>
                <div className="text-[10px] text-slate-300 font-black font-mono">{value}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-4">© 2026 MediVend Systems · Secure & HIPAA-Compliant</p>
        </div>
      </div>

      {/* RIGHT: Hero */}
      <div className={`hidden lg:flex flex-1 relative overflow-hidden flex-col items-center justify-center p-12 transition-all duration-700 delay-200 border-l border-white/5 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <div className="absolute inset-0 bg-[#0B0F19]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/8 text-indigo-300 text-xs font-bold uppercase tracking-[0.15em] mb-10">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Professional Healthcare Suite
          </div>
          <h1 className="text-6xl xl:text-7xl font-black text-white leading-[1.0] tracking-tight mb-6">
            Digital<br />
            <span className="auth-gradient-text">Prescriptions</span><br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.5px rgba(148,163,184,0.3)' }}>Reimagined</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
            Generate secure, trackable prescriptions in seconds. Integrated with MediVend kiosks for instant patient fulfillment.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Printer />, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20', title: 'Instant Printing', desc: 'One-click PDF generation' },
              { icon: <QrCode />, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20', title: 'QR Validation', desc: 'Secure dispensing verification' },
              { icon: <ShieldCheck />, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20', title: 'FDA Compliant', desc: 'All regulatory standards met' },
              { icon: <History />, color: 'from-purple-500 to-indigo-500', shadow: 'shadow-purple-500/20', title: 'Smart History', desc: 'Track patient records easily' },
            ].map(({ icon, color, shadow, title, desc }) => (
              <div key={title} className="feature-card group p-5 rounded-2xl border border-white/[0.06] transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.04] cursor-default">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg ${shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
                </div>
                <div className="font-bold text-white text-sm">{title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Onboarding Screen ──
function OnboardingScreen({ onComplete, user }) {
  const [details, setDetails] = useState({ name: '', address: '', contactNumber: '', ptr: '', s2: '' });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#0B0F19] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0B0F19] to-black opacity-90"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_8px_32px_rgba(99,102,241,0.4)] mb-6">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Clinic Setup</h1>
          <p className="text-slate-500 mt-2 text-sm">This info will appear on your prescriptions</p>
        </div>
        <div className="auth-card rounded-3xl border border-white/[0.08] p-8">
          <form onSubmit={(e) => { e.preventDefault(); onComplete(details); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Clinic / Hospital Name', key: 'name', placeholder: 'e.g. City General Hospital', icon: Building, span: 2 },
                { label: 'Full Address', key: 'address', placeholder: 'Complete clinic address', icon: MapPin, span: 2 },
                { label: 'Contact Number', key: 'contactNumber', placeholder: 'Tel / Mobile', icon: Phone, span: 1 },
                { label: 'PTR No.', key: 'ptr', placeholder: 'PTR-XXXXX', icon: FileText, span: 1 },
                { label: 'S2 License (Optional)', key: 's2', placeholder: 'S2-XXXXX', icon: ShieldCheck, span: 2 },
              ].map(({ label, key, placeholder, icon: Icon, span }) => (
                <Field key={key} label={label} icon={Icon} isDarkMode className={span === 2 ? 'col-span-2' : 'col-span-1'}>
                  <input type="text" className={inputClass(true)} placeholder={placeholder} value={details[key]} onChange={e => setDetails({ ...details, [key]: e.target.value })} required={key !== 's2'} />
                </Field>
              ))}
            </div>
            <PrimaryButton size="lg" className="w-full justify-center mt-2">
              Save & Continue <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
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
        setBroadcast(latestMsg.id !== dismissedId ? latestMsg : null);
      } else { setBroadcast(null); }
    });
    return () => unsubscribe();
  }, []);

  const dismissBroadcast = () => {
    if (broadcast) { localStorage.setItem('medivend_dismissed_broadcast_id', broadcast.id); setBroadcast(null); }
  };

  const filteredMeds = medicineList.filter(m => m && m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const handleSelectMed = (med) => {
    setSelectedMed(med); setSearchQuery(med.name || ''); setTempDosage(med.dosage || ''); setTempPrice(med.price || 0); setIsDropdownOpen(false);
  };
  const handleAddCustomMedicineLocal = (newMed) => {
    const medObject = { id: Date.now(), name: newMed.name, dosage: newMed.dosage, price: parseFloat(newMed.price) };
    onAddCustomMedicine(medObject); handleSelectMed(medObject); setIsCustomModalOpen(false);
  };
  const addItem = () => {
    if (!selectedMed) return;
    const parsedPrice = parseFloat(tempPrice) || 0;
    const parsedQty = parseInt(tempQty) || 1;
    const newItem = { ...selectedMed, uniqueId: editingId || Date.now(), quantity: parsedQty, dosage: tempDosage, price: parsedPrice, instructions: tempInstr || 'As directed by physician', totalPrice: parsedPrice * parsedQty };
    if (editingId) { setItems(items.map(i => i.uniqueId === editingId ? newItem : i)); setEditingId(null); }
    else { setItems([...items, newItem]); }
    setSelectedMed(null); setSearchQuery(''); setTempQty(1); setTempInstr(''); setTempDosage(''); setTempPrice(0);
  };
  const startEditing = (item) => {
    setEditingId(item.uniqueId); setSelectedMed(item); setSearchQuery(item.name); setTempQty(item.quantity); setTempDosage(item.dosage); setTempPrice(item.price); setTempInstr(item.instructions);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => {
    setEditingId(null); setSelectedMed(null); setSearchQuery(''); setTempQty(1); setTempInstr(''); setTempDosage(''); setTempPrice(0);
  };
  const initiateRemoveItem = (id) => { if (editingId === id) cancelEdit(); setItemToDelete(id); setIsDeleteModalOpen(true); };
  const confirmRemoveItem = () => { setItems(items.filter(i => i.uniqueId !== itemToDelete)); setIsDeleteModalOpen(false); setItemToDelete(null); };
  const handleGenerateClick = () => {
    if (!patient.name || items.length === 0) return;
    const grandTotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const uniqueId = `RX-${Math.floor(Math.random() * 1000000)}`;
    onGenerate({ id: uniqueId, date: new Date().toLocaleDateString(), patient, items, grandTotal, qrValue: JSON.stringify({ app: 'medivend', id: uniqueId, ver: '1' }) });
  };

  const grandTotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const isReady = items.length > 0 && patient.name;

  return (
    <div className={`flex flex-col md:flex-row h-full w-full overflow-hidden ${isDarkMode ? 'bg-[#060b18]' : 'bg-slate-50'}`}>
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmRemoveItem} title="Remove Item?" message="Remove this medicine from the prescription?" confirmText="Remove" type="danger" />

      {/* Mobile tabs */}
      <div className={`md:hidden no-print flex border-b shrink-0 sticky top-0 z-30 ${isDarkMode ? 'bg-[#0a1020] border-white/[0.07]' : 'bg-white border-slate-200'}`}>
        {[{ id: 'editor', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Editor' }, { id: 'preview', icon: <Eye className="w-4 h-4" />, label: 'Preview' }].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setMobileView(id)} className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${mobileView === id ? 'text-indigo-400 border-b-2 border-indigo-500' : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── EDITOR ── */}
      <div className={`md:block w-full md:w-3/5 p-4 md:p-7 overflow-y-auto border-r flex-1 min-h-0 ${mobileView === 'editor' ? 'block' : 'hidden'} ${isDarkMode ? 'border-white/[0.05]' : 'border-slate-200'}`}>

        {broadcast && (
          <div className={`mb-5 p-4 rounded-2xl border flex items-start gap-3 ${broadcast.priority === 'high' ? 'bg-rose-500/8 border-rose-500/20 text-rose-300' : 'bg-blue-500/8 border-blue-500/20 text-blue-300'}`}>
            <Megaphone className={`w-5 h-5 mt-0.5 shrink-0 ${broadcast.priority === 'high' ? 'animate-pulse' : ''}`} />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60">{broadcast.priority === 'high' ? 'System Alert' : 'System Message'}</p>
              <p className="text-sm">{broadcast.message}</p>
            </div>
            <button onClick={dismissBroadcast} className="p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Patient card */}
        <GlassCard isDarkMode={isDarkMode} className="p-6 mb-4" glow>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-indigo-500/15 border-indigo-500/25' : 'bg-indigo-50 border-indigo-200'}`}>
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className={`font-black text-xs uppercase tracking-[0.15em] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Patient Information</h3>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <Field label="Full Name" icon={User} isDarkMode={isDarkMode} className="col-span-12 md:col-span-7">
              <input type="text" className={inputClass(isDarkMode)} placeholder="Enter patient full name" value={patient.name} onChange={e => setPatient({ ...patient, name: e.target.value })} />
            </Field>
            <Field label="Age" icon={null} isDarkMode={isDarkMode} className="col-span-6 md:col-span-2">
              <input type="number" min="1" className={inputClass(isDarkMode, false)} placeholder="—" value={patient.age} onChange={e => { const v = e.target.value; if (v === '' || parseInt(v) >= 1) setPatient({ ...patient, age: v }); }} />
            </Field>
            <Field label="Sex" icon={null} isDarkMode={isDarkMode} className="col-span-6 md:col-span-3">
              <select className={inputClass(isDarkMode, false)} value={patient.sex} onChange={e => setPatient({ ...patient, sex: e.target.value })}>
                <option className={isDarkMode ? "bg-slate-800 text-white" : ""}>Male</option>
                <option className={isDarkMode ? "bg-slate-800 text-white" : ""}>Female</option>
              </select>
            </Field>
          </div>
        </GlassCard>

        {/* Medicine card */}
        <GlassCard isDarkMode={isDarkMode} className="p-6 min-h-[400px]">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                editingId
                  ? (isDarkMode ? 'bg-blue-500/15 border-blue-500/25' : 'bg-blue-50 border-blue-200')
                  : (isDarkMode ? 'bg-emerald-500/15 border-emerald-500/25' : 'bg-emerald-50 border-emerald-200')
              }`}>
                {editingId ? <Pencil className="w-4 h-4 text-blue-400" /> : <Pill className="w-4 h-4 text-emerald-400" />}
              </div>
              <h3 className={`font-black text-xs uppercase tracking-[0.15em] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {editingId ? 'Edit Medicine' : 'Prescribe Medicine'}
              </h3>
            </div>
            <button onClick={() => setIsCustomModalOpen(true)}
              className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
                isDarkMode ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/8 hover:bg-indigo-500/18' : 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100'
              }`}>
              <Plus className="w-3.5 h-3.5" /> Custom
            </button>
          </div>

          {/* Search area */}
          <div className={`p-5 rounded-2xl border mb-5 transition-all duration-300 ${
            editingId
              ? (isDarkMode ? 'border-blue-500/30 bg-blue-500/[0.05]' : 'border-blue-200 bg-blue-50/40')
              : (isDarkMode ? 'border-white/[0.05] bg-white/[0.02]' : 'border-slate-200/70 bg-slate-50/50')
          }`}>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-8 relative">
                <label className={`block text-[9px] font-black uppercase tracking-[0.15em] mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Medicine Name</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                  <input type="text" className={`${inputClass(isDarkMode)} transition-shadow duration-200 focus:shadow-[0_0_30px_rgba(99,102,241,0.15)]`} placeholder="Search medicine database..." value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setIsDropdownOpen(true); if (!e.target.value) setSelectedMed(null); }}
                    onFocus={() => setIsDropdownOpen(true)} />
                </div>
                {isDropdownOpen && searchQuery && !selectedMed && (
                  <div className={`dropdown absolute z-50 w-full mt-2 rounded-2xl border shadow-2xl max-h-56 overflow-y-auto ${isDarkMode ? 'bg-[#0d1525] border-white/10' : 'bg-white border-slate-100 shadow-slate-300/30'}`}>
                    {filteredMeds.length === 0 ? (
                      <div onClick={() => setIsCustomModalOpen(true)} className={`p-4 text-sm cursor-pointer font-bold flex items-center gap-2 rounded-2xl transition-colors ${isDarkMode ? 'text-indigo-400 hover:bg-white/[0.05]' : 'text-indigo-600 hover:bg-indigo-50'}`}>
                        <Plus className="w-4 h-4" /> Add "{searchQuery}" as custom
                      </div>
                    ) : filteredMeds.map((med, i) => (
                      <div key={med.id} onClick={() => handleSelectMed(med)}
                        className={`p-3.5 cursor-pointer border-b last:border-0 transition-all duration-150 ${isDarkMode ? 'hover:bg-white/[0.06] border-white/[0.04]' : 'hover:bg-slate-50 border-slate-50'}`}
                        style={{ animationDelay: `${i * 30}ms` }}>
                        <div className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {med.name}
                          {med.isMaster && <Badge variant="cyan">Global</Badge>}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-slate-500">{med.dosage}</span>
                          <span className="text-xs font-black text-emerald-400">₱{med.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Field label="Quantity" icon={null} isDarkMode={isDarkMode} className="col-span-6 md:col-span-4">
                <input type="number" min="1" className={inputClass(isDarkMode, false)} value={tempQty} onChange={e => setTempQty(e.target.value)} />
              </Field>
              <Field label="Dosage Form" icon={null} isDarkMode={isDarkMode} className="col-span-6 md:col-span-4">
                <input type="text" className={inputClass(isDarkMode, false)} placeholder="e.g. 500mg" value={tempDosage} onChange={e => setTempDosage(e.target.value)} disabled={!selectedMed} />
              </Field>
              <Field label="Unit Price (₱)" icon={null} isDarkMode={isDarkMode} className="col-span-6 md:col-span-4">
                <input type="number" min="0" step="0.25" className={inputClass(isDarkMode, false)} value={tempPrice} onChange={e => setTempPrice(e.target.value)} disabled={!selectedMed} />
              </Field>
              <Field label="Instructions" icon={null} isDarkMode={isDarkMode} className="col-span-12 md:col-span-4">
                <input type="text" className={inputClass(isDarkMode, false)} placeholder="e.g. 1 tab after meals" value={tempInstr} onChange={e => setTempInstr(e.target.value)} />
              </Field>
              <div className="col-span-12 flex gap-3">
                {editingId && (
                  <button onClick={cancelEdit} className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/[0.07]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    Cancel
                  </button>
                )}
                <PrimaryButton onClick={addItem} disabled={!selectedMed} variant={editingId ? 'indigo' : 'dark'} className={`${editingId ? 'flex-1' : 'flex-[3]'} justify-center py-3.5`}>
                  {editingId ? <><Save className="w-4 h-4" /> Update Item</> : <><Plus className="w-4 h-4" /> Add to Prescription</>}
                </PrimaryButton>
              </div>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-2.5 pb-2">
            {items.length === 0 ? (
              <div className={`text-center py-14 border-2 border-dashed rounded-2xl transition-colors ${isDarkMode ? 'border-white/[0.06] text-slate-600' : 'border-slate-200 text-slate-400'}`}>
                <Pill className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <div className="font-bold text-sm">No medicines added yet</div>
                <div className="text-xs opacity-60 mt-1">Search above to begin the prescription</div>
              </div>
            ) : items.map((item, index) => (
              <div key={item.uniqueId} className={`rx-item flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group ${
                editingId === item.uniqueId
                  ? (isDarkMode ? 'border-blue-500/40 bg-blue-500/[0.07]' : 'border-blue-300 bg-blue-50')
                  : (isDarkMode ? 'border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/80')
              }`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border shrink-0 transition-all duration-200 ${
                    isDarkMode ? 'bg-white/[0.04] border-white/[0.07] text-slate-500 group-hover:bg-indigo-500/15 group-hover:text-indigo-400 group-hover:border-indigo-500/25' : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-black text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.name}</div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <Badge variant="indigo">{item.dosage}</Badge>
                      <Badge variant="emerald">₱{item.price.toFixed(2)}/u</Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 italic mt-1 truncate">{item.instructions}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <div className="text-right mr-1">
                    <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">×{item.quantity}</div>
                    <div className={`font-black text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>₱{item.totalPrice.toFixed(2)}</div>
                  </div>
                  <button onClick={() => startEditing(item)} className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${isDarkMode ? 'text-blue-400 hover:bg-blue-500/15' : 'text-blue-500 hover:bg-blue-50'}`}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => initiateRemoveItem(item.uniqueId)} className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${isDarkMode ? 'text-slate-700 hover:text-rose-400 hover:bg-rose-500/15' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── PREVIEW ── */}
      <div className={`no-print w-full md:w-2/5 flex-col flex-1 min-h-0 ${mobileView === 'preview' ? 'flex' : 'hidden'} md:flex ${isDarkMode ? 'bg-[#050a14]' : 'bg-slate-100'}`}>
        <div className={`p-4 border-b shrink-0 flex items-center gap-2 ${isDarkMode ? 'bg-[#0a1020] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
          <div className={`w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]`} />
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Live Preview</span>
        </div>

        <div className={`flex-1 overflow-y-auto p-5 flex justify-center items-start ${isDarkMode ? 'bg-[#050a14]' : 'bg-slate-100'}`}>
          <div className="bg-white text-slate-800 w-full max-w-md shadow-2xl border border-slate-200 p-8 min-h-[560px] text-sm relative transition-all duration-500" style={{ fontFamily: 'Georgia, serif', borderRadius: 4 }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
              <span className="text-[9rem] font-black text-slate-400 select-none italic" style={{ fontFamily: 'Georgia, serif' }}>Rx</span>
            </div>
            <div className="border-b-2 border-slate-900 pb-4 mb-6 relative z-10">
              <h1 className="text-base font-bold uppercase tracking-widest text-slate-900">{user?.clinicDetails?.name || 'Clinic Name'}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{user?.clinicDetails?.address || 'Clinic Address'}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-700 space-y-0.5">
                <div><span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Patient: </span>{patient.name || '___________'}</div>
                <div className="flex gap-4">
                  <span><span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Age/Sex: </span>{patient.age || '__'} / {patient.sex}</span>
                  <span><span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Date: </span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold text-slate-200 mb-4 italic" style={{ fontFamily: 'Georgia, serif' }}>Rx</div>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-slate-300 italic text-center py-12 text-sm">Prescription list is empty…</p>
                ) : items.map((item) => (
                  <div key={item.uniqueId} className="border-b border-slate-100 pb-3">
                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                      <span>{item.name} <span className="font-normal text-slate-500">{item.dosage}</span></span>
                      <span>#{item.quantity}</span>
                    </div>
                    <div className="text-xs italic text-slate-600 pl-4 mt-0.5">Sig: {item.instructions}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 border-t border-slate-800 pt-3 flex justify-between items-end z-10">
              <div className="text-[9px] text-slate-400 w-1/2 leading-tight">Digitally verified. Valid at any MediVend Kiosk.</div>
              <div className="text-center w-36">
                <div className="h-[1px] bg-slate-900 w-full mb-1.5" />
                <p className="font-bold uppercase text-slate-900 text-[10px]">{user?.name}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Lic: {user?.license}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-5 border-t shrink-0 z-20 ${isDarkMode ? 'bg-[#0a1020] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className={`text-[10px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Est. Total Cost</span>
              <span className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ₱{grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${items.length > 0 ? 'text-emerald-400' : isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <PrimaryButton onClick={handleGenerateClick} disabled={!isReady} size="xl" className={`w-full justify-center transition-all duration-300 ${isReady ? 'generate-btn-ready' : ''}`}>
            <Printer className="w-5 h-5" /> Generate Prescription
          </PrimaryButton>
          {!isReady && <p className={`text-center text-[10px] mt-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            {!patient.name ? 'Enter patient name to proceed' : 'Add at least one medicine'}
          </p>}
        </div>
      </div>

      {isCustomModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
          <CustomMedicineForm onClose={() => setIsCustomModalOpen(false)} onAdd={handleAddCustomMedicineLocal} initialName={searchQuery} isDarkMode={isDarkMode} />
        </div>
      )}
    </div>
  );
}

// ── Prescription View ──
function PrescriptionView({ data, doctor, onBack, onNew, onCancel }) {
  if (!data) return null;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.qrValue)}`;

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden print:bg-white print:overflow-visible">
      <div className="no-print bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm shrink-0 gap-4 z-30">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-bold transition-colors self-start group">
          <span className="group-hover:-translate-x-0.5 transition-transform"><LayoutDashboard className="w-4 h-4" /></span>
          Back to Editor
        </button>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap gap-y-2">
          <span className="text-xs text-slate-400 mr-2 hidden sm:block font-mono">ID: <span className="font-black text-slate-700">{data.id}</span></span>
          <button onClick={onCancel} className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"><X className="w-3.5 h-3.5" /> Cancel</button>
          <button onClick={onNew} className="px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95"><Plus className="w-3.5 h-3.5" /> New Rx</button>
          <button onClick={() => window.print()} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95"><Printer className="w-3.5 h-3.5" /> Print</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center print:p-0 print:block">
        <div className="printable-wrapper bg-white w-full max-w-2xl shadow-2xl p-8 md:p-12 relative text-slate-900 border border-slate-100" style={{ fontFamily: 'Georgia, serif' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <span className="rx-watermark text-[10rem] font-black text-slate-200 italic select-none">Rx</span>
          </div>
          <div className="printable-content relative z-10">
            <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-slate-900">{doctor?.clinicDetails?.name || 'Clinic Name'}</h1>
                <div className="mt-2 text-sm text-slate-600 space-y-0.5" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  <p>{doctor?.clinicDetails?.address}</p>
                  <p>Tel: {doctor?.clinicDetails?.contactNumber}</p>
                  <p>PTR: {doctor?.clinicDetails?.ptr}</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-slate-900 p-1 inline-block">
                  <img src={qrUrl} alt="Rx QR" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] font-mono mt-1 text-slate-500 font-bold">{data.id}</p>
              </div>
            </div>
            <div className="mb-8 grid grid-cols-2 gap-y-2 text-sm border-b border-slate-200 pb-6" style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div><span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Patient Name</span><br /><span className="text-lg font-bold">{data.patient.name}</span></div>
              <div className="text-right"><span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Date Issued</span><br /><span className="text-lg font-bold">{data.date}</span></div>
              <div><span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Age / Sex</span><br /><span>{data.patient.age} / {data.patient.sex}</span></div>
              <div className="text-right"><span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Physician</span><br /><span className="uppercase font-bold">{doctor?.name}</span></div>
            </div>
            <div className="min-h-[400px] print-min-h-reset relative">
              <table className="w-full text-left border-collapse" style={{ fontFamily: 'system-ui, sans-serif' }}>
                <thead>
                  <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase text-slate-900 tracking-widest bg-slate-50/50">
                    <th className="py-2 px-1">Medicine Description</th>
                    <th className="py-2 px-1 text-center">Dosage</th>
                    <th className="py-2 px-1 text-center">Qty</th>
                    <th className="py-2 px-1 text-right">Instructions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.items.map(item => (
                    <tr key={item.uniqueId} className="border-b border-slate-100">
                      <td className="py-4 px-1 align-top font-bold text-lg text-slate-900">{item.name}</td>
                      <td className="py-4 px-1 align-top text-center text-slate-600">{item.dosage}</td>
                      <td className="py-4 px-1 align-top text-center font-bold text-lg">#{item.quantity}</td>
                      <td className="py-4 px-1 align-top text-right italic text-slate-600 max-w-[200px]">{item.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="printable-footer flex justify-between items-end bg-white relative z-10">
            <div className="text-[10px] text-slate-400 w-1/2 leading-snug italic">Digitally signed. Valid at any MediVend Kiosk or licensed pharmacy.</div>
            <div className="text-center w-64">
              <div className="h-[2px] bg-slate-900 w-full mb-2" />
              <p className="font-bold uppercase text-sm text-slate-900 tracking-tight">{doctor?.name}</p>
              <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Lic No: {doctor?.license}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Medicine Manager ──
function MedicineManager({ medicines, onAdd, onDelete, isDarkMode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const filtered = medicines.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const initiateDelete = (id) => { setItemToDelete(id); setIsDeleteModalOpen(true); };
  const confirmDelete = () => { onDelete(itemToDelete); setIsDeleteModalOpen(false); setItemToDelete(null); };

  return (
    <div className={`p-4 md:p-7 h-full overflow-y-auto ${isDarkMode ? 'bg-[#060b18]' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto">
        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Remove Medicine?" message="Global items will be hidden from your view. Personal items will be permanently deleted." confirmText="Remove" type="danger" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" className={`w-full sm:w-72 pl-10 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/70 ${isDarkMode ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`} placeholder="Search inventory..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <PrimaryButton onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" /> Add Medicine
          </PrimaryButton>
        </div>

        <GlassCard isDarkMode={isDarkMode} className="overflow-hidden">
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className={`border-b text-[9px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02] text-slate-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Medicine Name</th>
                <th className="px-6 py-4">Dosage</th>
                <th className="px-6 py-4">Unit Price</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/[0.04]' : 'divide-slate-50'}`}>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-500 italic text-sm">No medicines found.</td></tr>
              ) : filtered.map((med, i) => (
                <tr key={med.id} className={`transition-all duration-200 group ${isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`}>
                  <td className={`px-6 py-4 text-xs font-mono ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {med.name}
                      {med.isMaster && <Badge variant="cyan">Global</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="indigo">{med.dosage}</Badge></td>
                  <td className="px-6 py-4 font-black text-emerald-400 text-sm">₱{med.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => initiateDelete(med.id)} className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/15' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile */}
          <div className={`md:hidden divide-y ${isDarkMode ? 'divide-white/[0.05]' : 'divide-slate-100'}`}>
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic text-sm">No medicines found.</div>
            ) : filtered.map(med => (
              <div key={med.id} className={`p-4 transition-all ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className={`font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {med.name}
                      {med.isMaster && <Badge variant="cyan">Global</Badge>}
                    </div>
                    <div className="mt-2"><Badge variant="indigo">{med.dosage}</Badge></div>
                  </div>
                  <div className="font-black text-emerald-400 text-lg">₱{med.price.toFixed(2)}</div>
                </div>
                <button onClick={() => initiateDelete(med.id)} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border ${isDarkMode ? 'text-rose-400 border-rose-500/20 bg-rose-500/[0.07] hover:bg-rose-500/15' : 'text-rose-600 border-rose-100 bg-rose-50 hover:bg-rose-100'}`}>
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
          <CustomMedicineForm onClose={() => setIsModalOpen(false)} onAdd={(med) => { onAdd(med); setIsModalOpen(false); }} isDarkMode={isDarkMode} />
        </div>
      )}
    </div>
  );
}

// ── History View ──
function HistoryView({ user, isDarkMode, hiddenIds, onHide }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'prescriptions'), where('doctorEmail', '==', user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      records.sort((a, b) => {
        const tA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.now();
        const tB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.now();
        return tB - tA;
      });
      setHistory(records); setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user.email]);

  const confirmDelete = async () => {
    if (deleteAction.type === 'single') onHide([deleteAction.id]);
    else onHide(history.map(h => h.id));
    setIsDeleteModalOpen(false); setDeleteAction(null);
  };

  const visibleHistory = history.filter(r => !hiddenIds.includes(r.id));

  return (
    <div className={`p-4 md:p-7 h-full overflow-y-auto ${isDarkMode ? 'bg-[#060b18]' : 'bg-slate-50'}`}>
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title={deleteAction?.type === 'all' ? "Clear History?" : "Remove Record?"} message={deleteAction?.type === 'all' ? "Clear all records from your view? Records remain in the database." : "Hide this record from your view?"} confirmText={deleteAction?.type === 'all' ? "Clear All" : "Remove"} type="danger" />
      <GlassCard isDarkMode={isDarkMode} className="max-w-5xl mx-auto overflow-hidden">
        <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-indigo-500/15 border-indigo-500/25' : 'bg-indigo-50 border-indigo-200'}`}>
              <History className="w-4 h-4 text-indigo-400" />
            </div>
            <span className={`text-xs font-black uppercase tracking-[0.15em] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Recent Activity</span>
            {visibleHistory.length > 0 && <Badge variant="indigo">{visibleHistory.length}</Badge>}
          </div>
          {visibleHistory.length > 0 && (
            <button onClick={() => { setDeleteAction({ type: 'all' }); setIsDeleteModalOpen(true); }} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border transition-all active:scale-95 ${isDarkMode ? 'text-rose-400 border-rose-500/20 bg-rose-500/[0.07] hover:bg-rose-500/15' : 'text-rose-600 border-rose-100 bg-rose-50 hover:bg-rose-100'}`}>
              <Trash2 className="w-3.5 h-3.5" /> Clear View
            </button>
          )}
        </div>
        <table className="w-full text-left hidden md:table">
          <thead className={`border-b text-[9px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02] text-slate-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Patient Name</th>
              <th className="px-6 py-4">Prescription ID</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-white/[0.04]' : 'divide-slate-50'}`}>
            {loading ? (
              <tr><td colSpan="5" className="p-12 text-center text-slate-500 italic text-sm">Syncing with server…</td></tr>
            ) : visibleHistory.length === 0 ? (
              <tr><td colSpan="5" className="p-12 text-center text-slate-500 italic text-sm">No prescription history yet.</td></tr>
            ) : visibleHistory.map(r => (
              <tr key={r.id} className={`transition-all duration-200 group ${isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`}>
                <td className={`px-6 py-4 text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{r.date}</td>
                <td className={`px-6 py-4 font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{r.patient.name}</td>
                <td className={`px-6 py-4 text-xs font-mono ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{r.id}</td>
                <td className="px-6 py-4 text-right font-black text-emerald-400">₱{r.grandTotal.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => { setDeleteAction({ type: 'single', id: r.id }); setIsDeleteModalOpen(true); }} className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/15' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile */}
        <div className={`md:hidden divide-y ${isDarkMode ? 'divide-white/[0.05]' : 'divide-slate-100'}`}>
          {loading ? (
            <div className="p-8 text-center text-slate-500 italic text-sm">Syncing…</div>
          ) : visibleHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic text-sm">No prescription history yet.</div>
          ) : visibleHistory.map(r => (
            <div key={r.id} className={`p-4 flex items-center justify-between ${isDarkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
              <div>
                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{r.patient.name}</div>
                <div className={`text-xs mt-0.5 font-mono ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{r.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-emerald-400">₱{r.grandTotal.toFixed(2)}</span>
                <button onClick={() => { setDeleteAction({ type: 'single', id: r.id }); setIsDeleteModalOpen(true); }} className={`p-2.5 rounded-xl transition-all active:scale-95 border ${isDarkMode ? 'text-rose-400 border-rose-500/20 bg-rose-500/[0.07]' : 'text-rose-600 border-rose-100 bg-rose-50'}`}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Settings View ──
function SettingsView({ user, onUpdateUser, onLogout, isDarkMode }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [profileData, setProfileData] = useState({ name: user.name || '', license: user.license || '', email: user.email || '' });
  const [clinicData, setClinicData] = useState({ name: user.clinicDetails?.name || '', address: user.clinicDetails?.address || '', contactNumber: user.clinicDetails?.contactNumber || '', ptr: user.clinicDetails?.ptr || '', s2: user.clinicDetails?.s2 || '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const showNotification = (message, type = 'success') => { setNotification({ message, type }); setTimeout(() => setNotification(null), 3000); };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
      await updateDoc(doctorRef, { name: profileData.name, license: profileData.license });
      onUpdateUser({ ...user, ...profileData }); showNotification("Profile updated successfully.");
    } catch (e) { showNotification(e.message, 'error'); }
    setIsLoading(false);
  };

  const handleSaveClinic = async () => {
    setIsLoading(true);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
      await updateDoc(doctorRef, { clinicDetails: clinicData });
      onUpdateUser({ ...user, clinicDetails: clinicData }); showNotification("Clinic details updated.");
    } catch (e) { showNotification(e.message, 'error'); }
    setIsLoading(false);
  };

  const handleSavePassword = async () => {
    if (passwordData.new !== passwordData.confirm) return showNotification("Passwords don't match.", 'error');
    if (passwordData.current !== user.password) return showNotification("Current password is incorrect.", 'error');
    setIsLoading(true);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.email);
      await updateDoc(doctorRef, { password: passwordData.new });
      onUpdateUser({ ...user, password: passwordData.new }); setPasswordData({ current: '', new: '', confirm: '' }); showNotification("Password changed.");
    } catch (e) { showNotification(e.message, 'error'); }
    setIsLoading(false);
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'My Profile' },
    { id: 'clinic', icon: Building, label: 'Clinic' },
    { id: 'security', icon: Lock, label: 'Security' },
  ];

  return (
    <div className={`p-4 md:p-7 h-full overflow-y-auto ${isDarkMode ? 'bg-[#060b18]' : 'bg-slate-50'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-7">
          <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account and clinic preferences</p>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : isDarkMode ? 'bg-white/[0.04] text-slate-400 border border-white/[0.07] hover:bg-white/[0.08]' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <GlassCard isDarkMode={isDarkMode} className="p-6 md:p-8 relative overflow-hidden">
          {notification && (
            <div className={`absolute top-0 left-0 right-0 p-3 text-center text-xs font-black uppercase tracking-widest z-20 transition-all ${notification.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {notification.message}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className={`flex items-center gap-4 border-b pb-6 ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_8px_32px_rgba(99,102,241,0.35)]">
                  {profileData.name.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{profileData.name}</h3>
                  <p className="text-slate-500 text-sm">{profileData.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" icon={User} isDarkMode={isDarkMode}>
                  <input className={inputClass(isDarkMode)} value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })} />
                </Field>
                <div>
                  <label className={`block text-[9px] font-black uppercase tracking-[0.15em] mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email (read-only)</label>
                  <div className="relative opacity-50">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                    <input disabled className={inputClass(isDarkMode)} value={profileData.email} />
                  </div>
                </div>
                <Field label="License Number" icon={FileBadge} isDarkMode={isDarkMode} className="md:col-span-2">
                  <input className={inputClass(isDarkMode)} value={profileData.license} onChange={e => setProfileData({ ...profileData, license: e.target.value })} />
                </Field>
              </div>
              <div className="flex justify-end pt-2">
                <PrimaryButton onClick={handleSaveProfile} loading={isLoading}><Save className="w-4 h-4" /> Save Profile</PrimaryButton>
              </div>
            </div>
          )}

          {activeTab === 'clinic' && (
            <div className="space-y-6">
              <div className={`border-b pb-5 ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Clinic Information</h3>
                <p className="text-slate-500 text-sm mt-1">Appears on your prescription header</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Clinic Name', key: 'name', icon: Building, span: 2 },
                  { label: 'Full Address', key: 'address', icon: MapPin, span: 2 },
                  { label: 'Contact Number', key: 'contactNumber', icon: Phone, span: 1 },
                  { label: 'PTR Number', key: 'ptr', icon: FileText, span: 1 },
                  { label: 'S2 License (Optional)', key: 's2', icon: ShieldCheck, span: 2 },
                ].map(({ label, key, icon: Icon, span }) => (
                  <Field key={key} label={label} icon={Icon} isDarkMode={isDarkMode} className={span === 2 ? 'md:col-span-2' : ''}>
                    <input className={inputClass(isDarkMode)} value={clinicData[key]} onChange={e => setClinicData({ ...clinicData, [key]: e.target.value })} />
                  </Field>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <PrimaryButton onClick={handleSaveClinic} loading={isLoading}><Save className="w-4 h-4" /> Update Clinic</PrimaryButton>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className={`border-b pb-5 ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <h3 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Security Settings</h3>
                <p className="text-slate-500 text-sm mt-1">Update your account password</p>
              </div>
              <div className="max-w-sm mx-auto space-y-4 py-4">
                {[
                  { label: 'Current Password', key: 'current', icon: Lock },
                  { label: 'New Password', key: 'new', icon: Key },
                  { label: 'Confirm New Password', key: 'confirm', icon: CheckCircle2 },
                ].map(({ label, key, icon: Icon }) => (
                  <Field key={key} label={label} icon={Icon} isDarkMode={isDarkMode}>
                    <input type="password" className={inputClass(isDarkMode)} value={passwordData[key]} onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })} />
                  </Field>
                ))}
                <PrimaryButton onClick={handleSavePassword} disabled={isLoading || !passwordData.current || !passwordData.new} loading={isLoading} variant="dark" className="w-full justify-center mt-4 py-3.5">
                  <Lock className="w-4 h-4" /> Change Password
                </PrimaryButton>
              </div>
            </div>
          )}
        </GlassCard>

        <div className="md:hidden mt-5">
          <button onClick={onLogout} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border ${isDarkMode ? 'text-rose-400 border-rose-500/20 bg-rose-500/[0.07] hover:bg-rose-500/15' : 'text-rose-600 border-rose-100 bg-rose-50 hover:bg-rose-100'}`}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Support View ──
function SupportView({ user, isDarkMode, db, appId }) {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', priority: 'normal', message: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deletedTicketIds, setDeletedTicketIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medivend_deleted_tickets') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'support_tickets'), where('doctorEmail', '==', user.email));
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
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'support_tickets'), { ...newTicket, status: 'open', sender: user.name, doctorEmail: user.email, timestamp: serverTimestamp(), type: 'doctor_issue' });
      setIsModalOpen(false); setNewTicket({ subject: '', priority: 'normal', message: '' });
    } catch (err) { alert("Failed to submit ticket."); }
  };

  const confirmDeleteTicket = () => {
    const newIds = [...deletedTicketIds, ticketToDelete];
    setDeletedTicketIds(newIds); localStorage.setItem('medivend_deleted_tickets', JSON.stringify(newIds));
    setIsDeleteModalOpen(false); setTicketToDelete(null);
  };

  const visibleTickets = tickets.filter(t => !deletedTicketIds.includes(t.id));
  const statusVariant = (s) => s === 'resolved' ? 'emerald' : s === 'in_progress' ? 'blue' : 'amber';

  return (
    <div className={`p-4 md:p-7 h-full overflow-y-auto ${isDarkMode ? 'bg-[#060b18]' : 'bg-slate-50'}`}>
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDeleteTicket} title="Delete Ticket?" message="This hides the ticket from your view." confirmText="Delete" type="danger" />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-7">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Support Tickets</h1>
            <p className="text-slate-500 text-sm mt-1">Track your help requests</p>
          </div>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> New Ticket
          </PrimaryButton>
        </div>

        <GlassCard isDarkMode={isDarkMode} className="overflow-hidden">
          <table className="w-full text-left hidden md:table">
            <thead className={`border-b text-[9px] font-black uppercase tracking-[0.15em] ${isDarkMode ? 'border-white/[0.06] bg-white/[0.02] text-slate-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/[0.04]' : 'divide-slate-50'}`}>
              {visibleTickets.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-500 italic text-sm">No tickets yet. Need help? Open a new ticket.</td></tr>
              ) : visibleTickets.map(t => (
                <tr key={t.id} className={`group transition-all duration-200 ${isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.subject}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[220px] mt-0.5">{t.message}</div>
                  </td>
                  <td className="px-6 py-4"><Badge variant={t.priority === 'high' ? 'rose' : 'blue'}>{t.priority}</Badge></td>
                  <td className="px-6 py-4"><Badge variant={statusVariant(t.status)}>{t.status?.replace('_', ' ') || 'open'}</Badge></td>
                  <td className={`px-6 py-4 text-xs font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.timestamp?.seconds ? new Date(t.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setTicketToDelete(t.id); setIsDeleteModalOpen(true); }} className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/15' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile */}
          <div className={`md:hidden divide-y ${isDarkMode ? 'divide-white/[0.05]' : 'divide-slate-100'}`}>
            {visibleTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 italic text-sm">No tickets yet.</div>
            ) : visibleTickets.map(t => (
              <div key={t.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t.subject}</div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.message}</p>
                  </div>
                  <button onClick={() => { setTicketToDelete(t.id); setIsDeleteModalOpen(true); }} className={`p-2 rounded-xl ml-2 ${isDarkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/15' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant={t.priority === 'high' ? 'rose' : 'blue'}>{t.priority}</Badge>
                  <Badge variant={statusVariant(t.status)}>{t.status?.replace('_', ' ') || 'open'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
          <div className={`modal-card rounded-3xl p-8 w-full max-w-md shadow-2xl border ${isDarkMode ? 'bg-[#0d1220]/95 border-white/[0.09]' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>New Support Ticket</h3>
                <p className="text-xs text-slate-500">Describe your issue in detail</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Subject" isDarkMode={isDarkMode}>
                <input required className={inputClass(isDarkMode, false)} placeholder="Brief summary of the issue" value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })} />
              </Field>
              <div>
                <label className={`block text-[9px] font-black uppercase tracking-[0.15em] mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Message</label>
                <textarea required rows="4" className={`${inputClass(isDarkMode, false)} resize-none`} placeholder="Describe the issue in detail..." value={newTicket.message} onChange={e => setNewTicket({ ...newTicket, message: e.target.value })} />
              </div>
              <div>
                <label className={`block text-[9px] font-black uppercase tracking-[0.15em] mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Priority</label>
                <select className={inputClass(isDarkMode, false)} value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}>
                  <option value="low" className={isDarkMode ? "bg-slate-800 text-white" : ""}>Low — General Question</option>
                  <option value="normal" className={isDarkMode ? "bg-slate-800 text-white" : ""}>Normal — Standard Issue</option>
                  <option value="high" className={isDarkMode ? "bg-slate-800 text-white" : ""}>High — Urgent / Blocker</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.09] border border-white/[0.07]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                <PrimaryButton type="submit" className="flex-1 justify-center py-3">Submit Ticket</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [user, setUser] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [personalMedicines, setPersonalMedicines] = useState(DEFAULT_MEDICINES);
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [hiddenMasterIds, setHiddenMasterIds] = useState([]);
  const [hiddenHistoryIds, setHiddenHistoryIds] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [patient, setPatient] = useState({ name: '', age: '', sex: 'Male' });
  const [items, setItems] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, () => {});
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'medicines'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMasterMedicines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isMaster: true })));
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = async (userData) => {
    setUser(userData);
    if (userData.savedInventory?.length > 0) {
      const valid = userData.savedInventory.filter(i => i?.name && i?.price);
      setPersonalMedicines(valid.length > 0 ? valid : DEFAULT_MEDICINES);
    } else { setPersonalMedicines(DEFAULT_MEDICINES); }
    if (userData.hiddenMasterItems) setHiddenMasterIds(userData.hiddenMasterItems);
    if (userData.hiddenHistory) setHiddenHistoryIds(userData.hiddenHistory);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', userData.id || userData.email);
      updateDoc(doctorRef, { lastLogin: serverTimestamp() }).catch(() => {});
    } catch { }
    if (userData.status === 'active' && !userData.clinicDetails) setCurrentView('onboarding');
    else if (userData.status === 'active') setCurrentView('dashboard');
    else setCurrentView('auth');
  };

  const handleOnboardingComplete = async (details) => {
    const updatedUser = { ...user, clinicDetails: details };
    setUser(updatedUser);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
      await setDoc(doctorRef, { clinicDetails: details }, { merge: true });
    } catch { }
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (u) => setUser(u);

  const handleAddMedicine = async (newMed) => {
    const medObject = { id: newMed.id || Date.now(), name: newMed.name, dosage: newMed.dosage, price: parseFloat(newMed.price) };
    const newList = [...personalMedicines, medObject];
    setPersonalMedicines(newList);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
      await updateDoc(doctorRef, { savedInventory: newList });
    } catch { }
  };

  const handleDeleteMedicine = async (id) => {
    const isMasterItem = masterMedicines.some(m => m.id === id);
    if (isMasterItem) {
      const newHidden = [...hiddenMasterIds, id];
      setHiddenMasterIds(newHidden);
      try {
        const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
        await updateDoc(doctorRef, { hiddenMasterItems: newHidden });
      } catch { }
    } else {
      const newList = personalMedicines.filter(m => m.id !== id);
      setPersonalMedicines(newList);
      try {
        const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
        await updateDoc(doctorRef, { savedInventory: newList });
      } catch { }
    }
  };

  const handleHideHistory = async (idsToHide) => {
    const newHidden = [...new Set([...hiddenHistoryIds, ...idsToHide])];
    setHiddenHistoryIds(newHidden);
    try {
      const doctorRef = doc(db, 'artifacts', appId, 'public', 'data', 'doctors', user.id || user.email);
      await updateDoc(doctorRef, { hiddenHistory: newHidden });
    } catch { }
  };

  const handleGenerate = (data) => { setCurrentPrescription(data); setCurrentView('prescription'); };

  const executeSaveAndNew = async () => {
    if (!currentPrescription || !user) { setIsSaveModalOpen(false); return; }
    setIsSaving(true);
    try {
      const rxRef = doc(db, 'artifacts', appId, 'public', 'data', 'prescriptions', currentPrescription.id);
      const cleanClinicDetails = user.clinicDetails ? { name: user.clinicDetails.name || '', address: user.clinicDetails.address || '', contactNumber: user.clinicDetails.contactNumber || '', ptr: user.clinicDetails.ptr || '', s2: user.clinicDetails.s2 || '' } : null;
      await setDoc(rxRef, { id: currentPrescription.id || '', date: currentPrescription.date || new Date().toLocaleDateString(), status: 'issued', patient: currentPrescription.patient || {}, items: currentPrescription.items || [], grandTotal: currentPrescription.grandTotal || 0, doctorName: user.name || '', doctorLicense: user.license || '', doctorEmail: user.email || '', clinicDetails: cleanClinicDetails, createdAt: serverTimestamp(), isHidden: false });
      setPatient({ name: '', age: '', sex: 'Male' }); setItems([]); setCurrentPrescription(null); setCurrentView('dashboard'); setIsSaveModalOpen(false);
    } catch (e) { alert(`Error: ${e.message}`); setIsSaveModalOpen(false); }
    finally { setIsSaving(false); }
  };

  const executeDiscard = () => {
    setPatient({ name: '', age: '', sex: 'Male' }); setItems([]); setCurrentPrescription(null); setCurrentView('dashboard'); setIsDiscardModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null); setCurrentPrescription(null); setPatient({ name: '', age: '', sex: 'Male' }); setItems([]); setHiddenMasterIds([]); setHiddenHistoryIds([]); setCurrentView('auth');
  };

  const displayedMedicines = [...personalMedicines, ...masterMedicines.filter(m => !hiddenMasterIds.includes(m.id))];

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: 'Writer', section: 'clinical' },
    { id: 'history', icon: <History />, label: 'History', section: 'clinical' },
    { id: 'medicines', icon: <Pill />, label: 'Medicines', section: 'management' },
    { id: 'settings', icon: <Settings />, label: 'Settings', section: 'system' },
    { id: 'support', icon: <LifeBuoy />, label: 'Support', section: 'system' },
  ];

  const viewTitle = {
    dashboard: { label: 'Prescription Writer', icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" /> },
    medicines: { label: 'Medicine Inventory', icon: <Pill className="w-4 h-4 text-emerald-400" /> },
    history: { label: 'Patient History', icon: <History className="w-4 h-4 text-indigo-400" /> },
    prescription: { label: 'Prescription Preview', icon: <Printer className="w-4 h-4 text-indigo-400" /> },
    support: { label: 'Support & Help', icon: <LifeBuoy className="w-4 h-4 text-amber-400" /> },
    settings: { label: 'Account Settings', icon: <Settings className="w-4 h-4 text-slate-400" /> },
  };

  return (
    <div className={`h-[100dvh] overflow-hidden flex flex-col transition-colors duration-500 ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .dark-theme { background: #060b18; color: #e2e8f0; font-family: 'DM Sans', system-ui, sans-serif; }
        .light-theme { background: #f8fafc; color: #1e293b; font-family: 'DM Sans', system-ui, sans-serif; }

        /* ── Ripple ── */
        .ripple-el {
          position: absolute;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.4);
          transform: scale(0);
          animation: ripple-anim 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
          pointer-events: none;
          z-index: 20;
        }
        @keyframes ripple-anim {
          to { transform: scale(60); opacity: 0; }
        }

        /* ── Nav button ── */
        .nav-btn { font-family: 'Space Grotesk', sans-serif; }
        .nav-btn-active { background: linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(59,130,246,0.10) 100%); }
        .nav-active-glow {
          position: absolute; inset: 0; border-radius: 16px;
          background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Mobile nav ── */
        .mobile-nav-active-bg {
          position: absolute; inset: 0; border-radius: 16px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.12));
          pointer-events: none;
        }

        /* ── Primary buttons ── */
        .primary-btn { font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.02em; }
        .btn-shine {
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
          pointer-events: none;
        }
        .primary-btn:hover:not(:disabled) .btn-shine { left: 150%; }

        .btn-indigo { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); box-shadow: 0 4px 20px rgba(79,70,229,0.35); }
        .btn-indigo:hover:not(:disabled) { box-shadow: 0 6px 30px rgba(79,70,229,0.5); transform: translateY(-1px); }
        .btn-emerald { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); box-shadow: 0 4px 20px rgba(5,150,105,0.3); }
        .btn-emerald:hover:not(:disabled) { transform: translateY(-1px); }
        .btn-danger { background: linear-gradient(135deg, #e11d48 0%, #db2777 100%); box-shadow: 0 4px 20px rgba(225,29,72,0.3); }
        .btn-danger:hover:not(:disabled) { transform: translateY(-1px); }
        .btn-dark { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); box-shadow: 0 4px 20px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06); }
        .btn-dark:hover:not(:disabled) { background: linear-gradient(135deg, #334155 0%, #1e293b 100%); transform: translateY(-1px); }
        .btn-ghost { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); box-shadow: none; }
        .btn-cyan { background: linear-gradient(135deg, #0891b2 0%, #0284c7 100%); box-shadow: 0 4px 20px rgba(8,145,178,0.3); }

        .generate-btn-ready {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(79,70,229,0.35); }
          50% { box-shadow: 0 6px 36px rgba(79,70,229,0.6), 0 0 0 4px rgba(79,70,229,0.12); }
        }

        /* ── Badge ── */
        .badge { font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.08em; }

        /* ── Glass card ── */
        .glass-card { backdrop-filter: blur(12px); }

        .auth-panel-left { border-right: 1px solid rgba(255,255,255,0.05); }
        .auth-card {
          background: rgba(255,255,255,0.025);
          backdrop-filter: blur(24px);
          position: relative;
        }
        .auth-card-glow {
          position: absolute; inset: 0; border-radius: 24px;
          background: linear-gradient(135deg, rgba(99,102,241,0.07) 0%, transparent 60%);
          pointer-events: none;
        }
        .auth-info-chip { background: rgba(255,255,255,0.02); backdrop-filter: blur(8px); }
        .auth-gradient-text {
          background: linear-gradient(90deg, #818cf8 0%, #60a5fa 50%, #38bdf8 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .feature-card { background: rgba(255,255,255,0.02); }
        .logo-icon { animation: logo-float 4s ease-in-out infinite; }
        @keyframes logo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .form-slide-in { animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Dropdown ── */
        .dropdown { animation: dropIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* ── Modal ── */
        .modal-card { animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        /* ── Rx item ── */
        .rx-item { animation: itemSlide 0.3s ease-out; }
        @keyframes itemSlide { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

        /* ── Sidebar ── */
        .sidebar-section-label { font-family: 'Space Grotesk', sans-serif; }

        /* ── Scrollbar ── */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.5); }

        /* ── Autofill ── */
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-text-fill-color: inherit;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* ── Print ── */
        @media print {
          @page { size: auto; margin: 0.5in; }
          .no-print, nav, .mobile-nav-bar { display: none !important; }
          body, html, #root { background: white !important; margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
          .printable-wrapper { display: flex !important; flex-direction: column !important; min-height: 90vh !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
          .printable-content { flex: 1 0 auto !important; }
          .printable-footer { flex-shrink: 0 !important; margin-top: auto !important; width: 100% !important; page-break-inside: avoid !important; padding-top: 10px !important; border-top: 1px solid #e2e8f0 !important; }
          .rx-watermark { font-size: 8rem !important; color: #94a3b8 !important; opacity: 0.3 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-min-h-reset { min-height: auto !important; }
        }
      `}</style>

      <ConfirmationModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onConfirm={executeSaveAndNew} title="Confirm Prescription" message="Save this prescription to the database and start a new one?" confirmText="Save & New" type="info" isLoading={isSaving} />
      <ConfirmationModal isOpen={isDiscardModalOpen} onClose={() => setIsDiscardModalOpen(false)} onConfirm={executeDiscard} title="Discard Changes?" message="This will permanently discard the current prescription without saving." confirmText="Discard" type="danger" />

      {currentView === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} db={db} appId={appId} />}
      {currentView === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} user={user} />}

      {['dashboard', 'prescription', 'history', 'settings', 'medicines', 'support'].includes(currentView) && (
        <div className="flex h-full overflow-hidden print:block print:bg-white">
          {/* ── DESKTOP SIDEBAR ── */}
          <aside className={`no-print w-60 flex-col hidden md:flex border-r z-30 relative transition-colors duration-300 ${isDarkMode ? 'bg-[#080e1c] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
            {/* Logo */}
            <div className={`p-5 flex items-center gap-3 border-b ${isDarkMode ? 'border-white/[0.05]' : 'border-slate-100'}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-[0_6px_24px_rgba(99,102,241,0.4)]">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 shadow-[0_0_8px_rgba(52,211,153,0.5)] ${isDarkMode ? 'border-[#080e1c]' : 'border-white'}`} />
              </div>
              <div>
                <h1 className={`font-black text-base tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>MediVend</h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">Doctor Portal</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
              {[
                { section: 'clinical', label: 'Clinical', items: navItems.filter(n => n.section === 'clinical') },
                { section: 'management', label: 'Management', items: navItems.filter(n => n.section === 'management') },
                { section: 'system', label: 'System', items: navItems.filter(n => n.section === 'system') },
              ].map(({ label, items: sItems }) => (
                <div key={label} className="mb-4">
                  <div className={`sidebar-section-label px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>{label}</div>
                  {sItems.map(n => (
                    <NavButton key={n.id} active={currentView === n.id} onClick={() => setCurrentView(n.id)} icon={n.icon} label={n.label} isDarkMode={isDarkMode} />
                  ))}
                </div>
              ))}
            </nav>

            {/* User panel */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-white/[0.05]' : 'border-slate-100'}`}>
              <div className={`flex items-center gap-3 p-3 rounded-2xl mb-3 border transition-all ${isDarkMode ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06]' : 'bg-slate-50 border-slate-200 hover:border-indigo-200'}`}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: 'Space Grotesk' }}>{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className={`flex w-full items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group ${isDarkMode ? 'text-slate-600 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}>
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Sign Out
              </button>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-colors duration-300 ${isDarkMode ? 'bg-[#060b18]' : 'bg-slate-50'}`}>
            {/* Header */}
            <header className={`no-print border-b flex items-center justify-between px-4 md:px-7 py-0 z-20 shrink-0 sticky top-0 transition-colors duration-300 ${isDarkMode ? 'bg-[#080e1c]/90 border-white/[0.06] backdrop-blur-xl' : 'bg-white/90 border-slate-200 backdrop-blur-xl'}`}>
              <div className="py-4 flex items-center gap-2.5">
                {viewTitle[currentView]?.icon}
                <h2 className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: 'Space Grotesk' }}>
                  {viewTitle[currentView]?.label}
                </h2>
              </div>
              <div className="flex items-center gap-2.5 py-3">
                {/* Dark mode toggle */}
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`relative w-12 h-6 rounded-full border transition-all duration-300 ${isDarkMode ? 'bg-indigo-600/25 border-indigo-500/40 shadow-[inset_0_0_12px_rgba(99,102,241,0.2)]' : 'bg-amber-100 border-amber-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${isDarkMode ? 'translate-x-6 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'translate-x-0 bg-white shadow-amber-200'}`}>
                    {isDarkMode ? <Moon className="w-2.5 h-2.5 text-indigo-900" /> : <Sun className="w-2.5 h-2.5 text-amber-500" />}
                  </span>
                </button>
                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs ${isDarkMode ? 'bg-white/[0.03] border-white/[0.07] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-bold text-[11px]" style={{ fontFamily: 'Space Grotesk' }}>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </header>

            {/* Views */}
            <main className="flex-1 overflow-hidden relative print:bg-white print:overflow-visible pb-[68px] md:pb-0 print:pb-0">
              {currentView === 'dashboard' && <Dashboard user={user} onGenerate={handleGenerate} medicineList={displayedMedicines} onAddCustomMedicine={handleAddMedicine} isDarkMode={isDarkMode} patient={patient} setPatient={setPatient} items={items} setItems={setItems} db={db} appId={appId} />}
              {currentView === 'history' && <HistoryView user={user} isDarkMode={isDarkMode} hiddenIds={hiddenHistoryIds} onHide={handleHideHistory} />}
              {currentView === 'medicines' && <MedicineManager medicines={displayedMedicines} onAdd={handleAddMedicine} onDelete={handleDeleteMedicine} isDarkMode={isDarkMode} />}
              {currentView === 'settings' && <SettingsView user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} isDarkMode={isDarkMode} />}
              {currentView === 'support' && <SupportView user={user} isDarkMode={isDarkMode} db={db} appId={appId} />}
              {currentView === 'prescription' && <PrescriptionView data={currentPrescription} doctor={user} onBack={() => setCurrentView('dashboard')} onCancel={() => setIsDiscardModalOpen(true)} onNew={() => setIsSaveModalOpen(true)} />}
            </main>

            {/* Mobile Nav */}
            <nav className={`mobile-nav-bar md:hidden no-print fixed bottom-0 left-0 right-0 border-t flex justify-around px-2 py-1.5 z-50 ${isDarkMode ? 'bg-[#080e1c]/95 border-white/[0.07] backdrop-blur-xl' : 'bg-white/95 border-slate-200 backdrop-blur-xl'}`} style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
              {navItems.map(n => (
                <NavButtonMobile key={n.id} active={currentView === n.id} onClick={() => setCurrentView(n.id)} icon={n.icon} label={n.label} isDarkMode={isDarkMode} />
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}