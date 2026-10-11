import React from 'react';
import { 
  Trophy, 
  Terminal, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { storageService } from '../services/storage';
import { STAGES } from '../types/progress';
import type { PageId } from '../components/layout/AppLayout';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const progress = storageService.getProgress();
  const solvedCount = progress.solvedPuzzleIds.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Dashboard Header */}
      <div>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight my-0">
            Student Learning Dashboard
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Track your progress, debug history, and topic progression saved locally in your browser.
        </p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-400 uppercase">
              Puzzles Solved
            </span>
            <div className="text-2xl font-bold text-white font-mono">{solvedCount}</div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Local verified
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-400 uppercase">
              Total Code Runs
            </span>
            <div className="text-2xl font-bold text-white font-mono">{progress.totalCodeRuns}</div>
            <span className="text-[10px] text-slate-400 mt-0.5">Sandbox executions</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-400 uppercase">
              AI Hints Consulted
            </span>
            <div className="text-2xl font-bold text-white font-mono">{progress.totalAiHintsRequested}</div>
            <span className="text-[10px] text-slate-400 mt-0.5">Progressive hints</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-400 uppercase">
              Errors Explained
            </span>
            <div className="text-2xl font-bold text-white font-mono">{progress.totalErrorsExplained}</div>
            <span className="text-[10px] text-slate-400 mt-0.5">Compiler breakdowns</span>
          </div>
        </div>
      </div>

      {/* Topic Progress Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white my-0">Curriculum Topic Progress</h2>
          <span className="text-xs text-slate-400">Rule: 3 puzzles solved per stage to advance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAGES.map((stage) => {
            // Calculate progress for this stage
            // Stage 1: solved 0-3, Stage 2: solved 3-6, etc.
            const previousThreshold = (stage.id - 1) * 3;
            const isUnlocked = solvedCount >= previousThreshold || stage.id === 1;
            const solvedInThisStage = Math.max(0, Math.min(3, solvedCount - previousThreshold));
            const progressPercent = (solvedInThisStage / 3) * 100;

            return (
              <div
                key={stage.id}
                className={`p-5 rounded-xl border bg-slate-900/50 space-y-3 ${
                  isUnlocked ? 'border-slate-800' : 'border-slate-800/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-indigo-400">
                      Stage {stage.id}
                    </span>
                    <h3 className="text-sm font-semibold text-white my-0">
                      {stage.title.split(': ')[1] || stage.title}
                    </h3>
                  </div>

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <Unlock className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {stage.description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Mastery Progress</span>
                    <span>{solvedInThisStage}/3 puzzles</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progressPercent === 100
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completed Challenges List */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white my-0">Completed Challenges</h2>
        {progress.solvedPuzzleIds.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 space-y-3">
            <Trophy className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-medium text-slate-400">No completed challenges yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Dive into Stage 1 challenges to start debugging C programs and unlocking your achievements.
            </p>
            <button
              onClick={() => onNavigate('challenges')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              <span>Explore Challenges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {progress.solvedPuzzleIds.map((puzzleId) => (
              <div
                key={puzzleId}
                className="p-3.5 rounded-lg border border-emerald-900/40 bg-emerald-950/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-emerald-300 font-medium">{puzzleId}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Passed
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
