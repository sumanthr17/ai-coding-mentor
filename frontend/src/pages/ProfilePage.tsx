import React, { useState } from 'react';
import { 
  User, 
  Trash2, 
  Save, 
  HardDrive, 
  Check, 
  AlertTriangle,
  Code2
} from 'lucide-react';
import { storageService } from '../services/storage';
import type { UserProfile } from '../types/progress';

export const ProfilePage: React.FC = () => {
  const [progress, setProgress] = useState(storageService.getProgress());
  const [profile, setProfile] = useState<UserProfile>(progress.profile);
  const [savedMessage, setSavedMessage] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateProfile(profile);
    setProgress(storageService.getProgress());
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const handleReset = () => {
    storageService.resetProgress();
    const fresh = storageService.getProgress();
    setProgress(fresh);
    setProfile(fresh.profile);
    setConfirmReset(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight my-0">
            Student Profile & Preferences
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage your local learning settings, Monaco editor font size, and stored progress.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-semibold text-white">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Profile Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Learning Title / Track
              </label>
              <select
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginning Programmer">Beginning Programmer</option>
                <option value="CS Undergraduate">CS Undergraduate</option>
                <option value="Self-Taught Coder">Self-Taught Coder</option>
                <option value="Systems Enthusiast">Systems Enthusiast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Editor Preferences */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-semibold text-white">
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>Monaco Editor Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Editor Font Size ({profile.fontSize}px)
              </label>
              <select
                value={profile.fontSize}
                onChange={(e) => setProfile({ ...profile, fontSize: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value={12}>12px (Compact)</option>
                <option value={14}>14px (Standard)</option>
                <option value={16}>16px (Medium)</option>
                <option value={18}>18px (Large)</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={profile.autoRunOnShortcut}
                  onChange={(e) => setProfile({ ...profile, autoRunOnShortcut: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Enable Ctrl+Enter shortcut for Run Code</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>

          {savedMessage && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 animate-fade-in font-medium">
              <Check className="w-4 h-4" />
              <span>Preferences saved to localStorage!</span>
            </div>
          )}
        </div>
      </form>

      {/* Local Storage & Reset Section */}
      <div className="p-6 rounded-xl border border-rose-950/40 bg-slate-900/40 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-sm font-semibold text-rose-300">
          <HardDrive className="w-4 h-4 text-rose-400" />
          <span>Local Data Management</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400 space-y-1">
            <p>
              Your completed puzzles ({progress.solvedPuzzleIds.length}) and compiler statistics ({progress.totalCodeRuns} runs) are stored directly inside your browser's <code className="font-mono text-slate-300">localStorage</code>.
            </p>
            <p className="text-[11px] text-slate-500">
              Resetting will clear all completed challenge records and restart curriculum stages from Stage 1.
            </p>
          </div>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/40 border border-rose-900/70 hover:bg-rose-900/50 text-rose-300 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
