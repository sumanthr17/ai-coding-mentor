import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Trophy, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft, 
  Send, 
  Lightbulb,
  FileCode2,
  AlertTriangle
} from 'lucide-react';
import { apiClient, ApiError } from '../services/api';
import { storageService } from '../services/storage';
import { STAGES } from '../types/progress';
import type { Puzzle, SubmitPuzzleResponse, ProgressiveHintResponse } from '../types/api';

export const ChallengesPage: React.FC = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isComingSoon, setIsComingSoon] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<number>(1);
  
  // Selected Puzzle for Debug-the-Code interface
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [solutionCode, setSolutionCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<SubmitPuzzleResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Progressive Hint in challenge mode
  const [hintLoading, setHintLoading] = useState<boolean>(false);
  const [currentHint, setCurrentHint] = useState<ProgressiveHintResponse | null>(null);
  const [hintError, setHintError] = useState<string | null>(null);

  const progress = storageService.getProgress();

  const fetchPuzzles = async () => {
    setLoading(true);
    setBackendError(null);
    setIsComingSoon(false);
    try {
      const data = await apiClient.getPuzzles();
      setPuzzles(data.puzzles || []);
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 501) {
        setIsComingSoon(true);
        setBackendError(null);
      } else if (err instanceof ApiError && err.isBackendUnavailable) {
        setIsComingSoon(false);
        setBackendError(`Backend is offline at ${apiClient.getBaseUrl()}. Could not load live puzzles from GET /puzzles.`);
      } else {
        setIsComingSoon(false);
        setBackendError(err.message || 'Failed to load puzzles from backend.');
      }
      setPuzzles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    apiClient.getPuzzles()
      .then((data) => {
        if (!ignore) {
          setPuzzles(data.puzzles || []);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          if (err instanceof ApiError && err.statusCode === 501) {
            setIsComingSoon(true);
            setBackendError(null);
          } else if (err instanceof ApiError && err.isBackendUnavailable) {
            setIsComingSoon(false);
            setBackendError(`Backend is offline at ${apiClient.getBaseUrl()}. Could not load live puzzles from GET /puzzles.`);
          } else {
            setIsComingSoon(false);
            setBackendError(err.message || 'Failed to load puzzles from backend.');
          }
          setPuzzles([]);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const openPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle);
    setSolutionCode(puzzle.starterCode || '');
    setSubmitResult(null);
    setSubmitError(null);
    setCurrentHint(null);
    setHintError(null);
  };

  const handleClosePuzzle = () => {
    setActivePuzzle(null);
    setSubmitResult(null);
    setSubmitError(null);
  };

  const handleSubmitSolution = async () => {
    if (!activePuzzle) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitResult(null);

    try {
      const res = await apiClient.submitPuzzle(activePuzzle.id, solutionCode);
      setSubmitResult(res);
      if (res.passed) {
        storageService.markPuzzleSolved(activePuzzle.id);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.isBackendUnavailable) {
        setSubmitError(`Backend is offline at ${apiClient.getBaseUrl()}. Challenge tests require the backend execution server.`);
      } else {
        setSubmitError(err.message || 'Submission failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestHint = async (level: number) => {
    if (!activePuzzle) return;
    setHintLoading(true);
    setHintError(null);

    try {
      const res = await apiClient.getHint(solutionCode, activePuzzle.id, level);
      setCurrentHint(res);
      storageService.incrementAiHints();
    } catch (err: any) {
      if (err instanceof ApiError && err.isBackendUnavailable) {
        setHintError(`Backend is offline at ${apiClient.getBaseUrl()}. Hints require the AI backend.`);
      } else {
        setHintError(err.message || 'Failed to get hint.');
      }
    } finally {
      setHintLoading(false);
    }
  };

  // If a puzzle is selected, show the Debug-the-Code puzzle interface!
  if (activePuzzle) {
    const isSolved = progress.solvedPuzzleIds.includes(activePuzzle.id);

    return (
      <div className="flex flex-col h-full bg-slate-950 overflow-hidden font-sans">
        {/* Top Challenge Header */}
        <div className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClosePuzzle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Back to all challenges"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">{activePuzzle.title}</span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                  activePuzzle.difficulty === 'easy'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : activePuzzle.difficulty === 'medium'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {activePuzzle.difficulty}
                </span>
                {isSolved && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRequestHint((currentHint?.hintLevel || 0) + 1 > 3 ? 1 : (currentHint?.hintLevel || 0) + 1)}
              disabled={hintLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/80 hover:bg-purple-900/60 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{hintLoading ? 'Loading Hint...' : 'Ask AI Hint'}</span>
            </button>

            <button
              onClick={handleSubmitSolution}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
              <span>{isSubmitting ? 'Evaluating...' : 'Submit Challenge'}</span>
            </button>
          </div>
        </div>

        {/* Puzzle Split View */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          {/* Left: Problem Details & Feedback Panel */}
          <div className="w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-slate-800 p-5 overflow-y-auto bg-slate-900/40 space-y-5 shrink-0">
            <div>
              <span className="text-[11px] font-mono font-medium text-indigo-400 uppercase tracking-wider block mb-1">
                Challenge Description
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {activePuzzle.description}
              </p>
            </div>

            {/* Hint Display */}
            {currentHint && (
              <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-900/70 text-purple-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <span>AI Hint (Level {currentHint.hintLevel}/3)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentHint.hint}
                </p>
              </div>
            )}

            {hintError && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300">
                {hintError}
              </div>
            )}

            {/* Submission Feedback */}
            {submitResult && (
              <div className={`p-4 rounded-lg border text-xs space-y-2 ${
                submitResult.passed 
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-200'
              }`}>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  {submitResult.passed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Challenge Passed!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Tests Not Passed</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                  {submitResult.feedback}
                </p>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-900 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Evaluation Unavailable</span>
                </div>
                <p>{submitError}</p>
              </div>
            )}
          </div>

          {/* Right: Monaco Editor for solving the puzzle */}
          <div className="flex-1 min-h-[350px] lg:min-h-0 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language="c"
              theme="vs-dark"
              value={solutionCode}
              onChange={(val) => setSolutionCode(val || '')}
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', Consolas, monospace",
                minimap: { enabled: false },
                automaticLayout: true,
                tabSize: 4,
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Stage Selection & Challenges Grid View
  const currentStageDefinition = STAGES.find((s) => s.id === selectedStage) || STAGES[0];
  const stagePuzzles = puzzles.filter(
    (p) => p.topic.toLowerCase() === currentStageDefinition.slug.toLowerCase()
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight my-0">
              Debug-the-Code Challenges
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Solve 3 distinct puzzles in each stage to unlock subsequent programming concepts.
          </p>
        </div>

        <button
          onClick={fetchPuzzles}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Puzzles</span>
        </button>
      </div>

      {/* Backend Unavailable Notice */}
      {backendError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/80 text-rose-300 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-rose-200 text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Backend Offline: Cannot Load Live Challenges</span>
          </div>
          <p className="text-xs text-rose-300/90 leading-relaxed">
            {backendError}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            The frontend connects to <code className="font-mono text-slate-300">{apiClient.getBaseUrl()}/puzzles</code>. Start the Express backend server to populate real challenge puzzles.
          </p>
        </div>
      )}

      {/* Challenges Coming Soon Notice (HTTP 501 Graceful Handling) */}
      {isComingSoon && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-900/60 text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-white text-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Challenges coming soon</span>
          </div>
          <p className="text-xs text-slate-300/90 leading-relaxed">
            The challenge catalog is currently under development on the backend. You can review the learning topics and stage progression below, or practice writing and debugging code in the Playground.
          </p>
        </div>
      )}

      {/* Stages Progression Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STAGES.map((stage) => {
          const isUnlocked = storageService.isStageUnlocked(stage.id, puzzles);
          const isSelected = selectedStage === stage.id;
          const stagePuzzlesList = puzzles.filter(
            (p) => p.topic.toLowerCase() === stage.slug.toLowerCase()
          );
          const solvedInStage = stagePuzzlesList.filter((p) =>
            progress.solvedPuzzleIds.includes(p.id)
          ).length;

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              } ${!isUnlocked ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
                  Stage {stage.id}
                </span>
                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-white leading-tight mb-1">
                {stage.title.split(': ')[1] || stage.title}
              </h3>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {stage.description}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Progress</span>
                <span className="font-mono text-slate-300 font-medium">
                  {solvedInStage} / {Math.max(stagePuzzlesList.length, 3)} Solved
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail & Puzzles List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-semibold text-white my-0">
              {currentStageDefinition.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentStageDefinition.description}
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {stagePuzzles.length} Available Puzzles
          </span>
        </div>

        {loading && (
          <div className="p-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            <span>Fetching challenges from backend...</span>
          </div>
        )}

        {!loading && stagePuzzles.length === 0 && !backendError && (
          <div className="p-10 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 space-y-2">
            <FileCode2 className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-medium text-slate-400">
              {isComingSoon ? "Challenges coming soon" : "No challenges found for this topic"}
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              {isComingSoon
                ? "The backend puzzle service has not been implemented yet. Challenges will appear here once the backend challenge service is completed."
                : `Check back once backend puzzle seeds for topic "${currentStageDefinition.slug}" are loaded.`}
            </p>
          </div>
        )}

        {/* Puzzles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stagePuzzles.map((puzzle) => {
            const isSolved = progress.solvedPuzzleIds.includes(puzzle.id);
            const isUnlocked = storageService.isStageUnlocked(selectedStage, puzzles);

            return (
              <div
                key={puzzle.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSolved
                    ? 'bg-emerald-950/10 border-emerald-900/60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                      puzzle.difficulty === 'easy'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : puzzle.difficulty === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {puzzle.difficulty}
                    </span>

                    {isSolved ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {puzzle.id}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1">
                    {puzzle.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {puzzle.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Topic: {puzzle.topic}
                  </span>

                  <button
                    onClick={() => openPuzzle(puzzle)}
                    disabled={!isUnlocked}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isUnlocked
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (isSolved ? 'Review Puzzle' : 'Solve Puzzle') : 'Stage Locked'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
