import React from 'react';
import { 
  Terminal, 
  Trophy, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Zap, 
  ChevronRight,
  BookMarked
} from 'lucide-react';
import { storageService } from '../services/storage';
import { STAGES } from '../types/progress';
import { BackendStatusBadge } from '../components/common/BackendStatusBadge';
import type { PageId } from '../components/layout/AppLayout';

interface HomeProps {
  onNavigate: (page: PageId, extraData?: any) => void;
}

export const HomePage: React.FC<HomeProps> = ({ onNavigate }) => {
  const progress = storageService.getProgress();
  const solvedCount = progress.solvedPuzzleIds.length;

  // Determine current active stage based on solved count
  const currentStageIndex = Math.min(Math.floor(solvedCount / 3), STAGES.length - 1);
  const currentStage = STAGES[currentStageIndex];
  const puzzlesInCurrentStage = solvedCount % 3;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Backend Status Alert at Top if offline */}
      <BackendStatusBadge showDetails={true} />

      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive C Programming Learning Experience</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Learn C Programming by{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              Debugging Real Code
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            AI Coding Mentor pairs you with an intelligent guide that doesn't just write answers for you—it teaches you how to think, analyze compiler errors, and solve problems like a seasoned developer.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('playground')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Terminal className="w-4 h-4" />
              <span>Start Coding</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('challenges')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all hover:scale-[1.02]"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Solve Challenges</span>
            </button>
          </div>
        </div>
      </section>

      {/* Continue Learning Section */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white my-0">Continue Learning</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pick up where you left off in your structured C progression curriculum.
            </p>
          </div>

          <button
            onClick={() => onNavigate('challenges')}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Stages</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Current Stage Card */}
          <div className="md:col-span-2 p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider">
                  Current Stage
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  {puzzlesInCurrentStage}/3 to unlock next
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">{currentStage.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {currentStage.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="w-1/2">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(puzzlesInCurrentStage / 3) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => onNavigate('challenges')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Jump to Puzzles</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
              Quick Stats
            </span>
            <div className="space-y-2 my-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Puzzles Solved:</span>
                <span className="font-mono font-semibold text-emerald-400">{solvedCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Code Runs:</span>
                <span className="font-mono font-semibold text-indigo-300">{progress.totalCodeRuns}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">AI Hints Consulted:</span>
                <span className="font-mono font-semibold text-purple-300">{progress.totalAiHintsRequested}</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs text-slate-400 hover:text-slate-200 text-left pt-2 border-t border-slate-800/80"
            >
              Open Full Dashboard &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Feature Overview */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight my-0">Why AI Coding Mentor?</h2>
          <p className="text-xs text-slate-400 mt-1">
            Engineered specifically to help students bridge the gap between confusion and mastery in C.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Isolated Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every C program runs inside a secure, containerized environment with execution limits and real GCC compiler outputs.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Progressive AI Hints</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              3-level progressive hints nurture your problem-solving skills instead of spoiling the solution immediately.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Stage-by-Stage Unlocks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Progress through structured topics: Variables, Conditionals, Loops, and Mixed Logic as you solve challenges.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Local & Frictionless</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No mandatory cloud sign-ups. Your solved puzzles, draft code, and dashboard analytics are saved locally.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
