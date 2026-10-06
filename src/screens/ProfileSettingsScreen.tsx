import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  RotateCcw, 
  Check, 
  GraduationCap
} from 'lucide-react';
import { User as UserType } from '../types';
import { api } from '../services/api';
import { PrimaryButton, SecondaryButton } from '../components/common';

export function ProfileSettingsScreen({
  user,
  isDark,
  onToggleDark,
  onLogout,
  onResetSeedData,
  onUpdateUser,
}: {
  user: UserType | null;
  isDark: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
  onResetSeedData: () => void;
  onUpdateUser: (u: UserType) => void;
}) {
  const [name, setName] = useState(user?.name || '');
  const [reminderOffset, setReminderOffset] = useState<number>(user?.reminderOffsetHours || 24);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await api.auth.updateProfile({
        name,
        reminderOffsetHours: reminderOffset,
      });
      onUpdateUser(res.user);
      setSuccessMsg('Profile settings updated successfully.');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const reminderOptions = [
    { label: '1 Day Before (24h)', value: 24 },
    { label: '12 Hours Before', value: 12 },
    { label: '6 Hours Before', value: 6 },
    { label: '1 Hour Before', value: 1 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Desktop Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Student Profile & Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account preferences, notification threshold, and workspace appearance.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Desktop 12-Column Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Profile Card + Appearance + Dataset Reset */}
        <div className="lg:col-span-5 space-y-6">
          {/* Profile Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {user?.name || 'Student'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'student@university.edu'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span className="truncate">SRM Institute of Science and Technology</span>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Workspace Appearance
            </h4>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Dark Theme</div>
                  <div className="text-[11px] text-slate-500">Toggle between light and dark surface tokens</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleDark}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isDark ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isDark ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Workspace Reset */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Workspace Data Reset
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Clear current tasks, subjects, and study blocks to start a fresh semester workspace.
            </p>

            <SecondaryButton
              onClick={onResetSeedData}
              icon={RotateCcw}
              className="w-full text-xs font-semibold"
            >
              Reset Workspace Data
            </SecondaryButton>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of DeadlineGuard AI</span>
          </button>
        </div>

        {/* Right Column (7 cols): Account & Notification Preferences Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 text-xs max-w-xl">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Account & Notification Preferences
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure your display name and default deadline reminder threshold.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Student Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Deadline Alert Timing
              </label>
              <select
                value={reminderOffset}
                onChange={(e) => setReminderOffset(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {reminderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <PrimaryButton type="submit" loading={saving}>
                Save Preferences
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
