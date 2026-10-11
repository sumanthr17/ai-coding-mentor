import React, { useState } from 'react';
import { 
  Terminal, 
  Trophy, 
  LayoutDashboard, 
  User, 
  Home, 
  Code2, 
  Sparkles, 
  PanelLeftClose, 
  PanelLeft, 
  BookOpen
} from 'lucide-react';
import { BackendStatusBadge } from '../common/BackendStatusBadge';
import { storageService } from '../../services/storage';

export type PageId = 'home' | 'playground' | 'challenges' | 'dashboard' | 'profile';

interface AppLayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId, extraData?: any) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const progress = storageService.getProgress();

  const navItems = [
    { id: 'home' as PageId, label: 'Home', icon: Home, badge: null },
    { id: 'playground' as PageId, label: 'Playground', icon: Terminal, badge: 'C' },
    { id: 'challenges' as PageId, label: 'Challenges', icon: Trophy, badge: `${progress.solvedPuzzleIds.length} Solved` },
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'profile' as PageId, label: 'Profile', icon: User, badge: null },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside
        className={`flex flex-col border-r border-slate-800/80 bg-slate-900/90 backdrop-blur transition-all duration-300 z-30 shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-14 px-3.5 border-b border-slate-800/80">
          {!collapsed && (
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1">
                  AI Mentor <Sparkles className="w-3 h-3 text-amber-400" />
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-medium">C Learner Edition</span>
              </div>
            </div>
          )}

          {collapsed && (
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="AI Coding Mentor"
            >
              <Code2 className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive 
                          ? 'bg-indigo-500/30 text-indigo-200' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Backend Status & Info */}
        <div className="p-3 border-t border-slate-800/80 flex flex-col gap-2.5">
          {!collapsed && (
            <>
              <BackendStatusBadge showDetails={false} />
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                <span>Progress: Local</span>
                <span className="font-mono text-slate-400">{progress.solvedPuzzleIds.length} Puzzles</span>
              </div>
            </>
          )}

          {collapsed && (
            <div className="flex justify-center" title="Backend Status">
              <span className="relative flex h-2.5 w-2.5">
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-950">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
              AI Coding Mentor
            </span>
            <span className="text-slate-600">/</span>
            <h1 className="text-sm font-medium text-slate-200 capitalize my-0">
              {currentPage}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Language: <strong className="text-white font-mono">C (C99 / GCC)</strong></span>
            </div>

            <button
              onClick={() => onNavigate('playground')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Open Editor</span>
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
