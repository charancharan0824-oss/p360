import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  BarChart3,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { api } from '../services/api';
import { PrimaryButton } from '../components/common';
import { User } from '../types';

export function AuthScreen({
  onAuthSuccess,
  isDark,
  onToggleDark,
}: {
  onAuthSuccess: (user: User) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}) {
  const [isSplash, setIsSplash] = useState(true);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('vs2513@srmist.edu.in');
  const [password, setPassword] = useState('student123');
  const [confirmPassword, setConfirmPassword] = useState('student123');

  // Initial verification transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.login('vs2513@srmist.edu.in', 'student123');
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Full Name cannot be empty.');
        if (!email.trim() || !email.includes('@')) throw new Error('A valid email address is required.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
        if (password !== confirmPassword) throw new Error('Password confirmation does not match.');

        const res = await api.auth.register(name, email, password, confirmPassword);
        onAuthSuccess(res.user);
      } else {
        if (!email.trim()) throw new Error('Please enter your email.');
        if (!password) throw new Error('Please enter your password.');

        const res = await api.auth.login(email, password);
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (isSplash) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white select-none">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center shadow-xl backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg animate-pulse">
              DG
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shadow">
            <Sparkles className="w-3 h-3 text-slate-900" />
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          DeadlineGuard AI
        </h1>
        <p className="text-xs font-medium text-indigo-200 tracking-widest uppercase mb-8">
          Never Miss a Deadline.
        </p>

        <div className="flex items-center gap-2 text-xs text-indigo-300/80 font-mono">
          <div className="w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <span>Verifying student workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Web Bar */}
      <header className="w-full h-16 px-6 lg:px-12 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            DG
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            DeadlineGuard AI
          </span>
        </div>

        {onToggleDark && (
          <button
            type="button"
            onClick={onToggleDark}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        )}
      </header>

      {/* Main Split Web Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12 items-center gap-8 lg:gap-12">
        {/* Left Column: Desktop SaaS Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Deadline & Priority Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Never miss a college deadline again.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            DeadlineGuard AI automatically ranks your assignments, labs, and exams using a 5-factor priority engine—combining urgency, course credit weight, cognitive difficulty, and real-time workload.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">5-Factor Priority</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Explainable 0–100 priority scoring for every academic task.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">AI Study Architect</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Generates personalized daily time blocks based on your deadlines.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Focus & Telemetry</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Pomodoro study sessions logged directly to your course analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Login / Register Form Card */}
        <div className="lg:col-span-5 w-full max-w-[460px] mx-auto">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Sign in to your account' : 'Create Student Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login' 
                  ? 'Access your intelligent deadline dashboard and study planner' 
                  : 'Join DeadlineGuard AI and manage your coursework effectively'}
              </p>
            </div>

            {/* Demo Credential Banner with 1-Click Login */}
            <div className="p-3.5 mb-5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Academic Demo Account</span>
                  <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Email: <code className="bg-white/80 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">vs2513@srmist.edu.in</code> · Password: <code className="bg-white/80 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono">student123</code>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Demo Sign In</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vignesh Sundar"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <PrimaryButton
                  type="submit"
                  loading={loading}
                >
                  {mode === 'login' ? 'Login to Dashboard' : 'Create Account'}
                </PrimaryButton>
              </div>
            </form>

            {/* Toggle Mode */}
            <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode(mode === 'login' ? 'register' : 'login');
                }}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {mode === 'login' 
                  ? "Don't have an account? Create Account" 
                  : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
