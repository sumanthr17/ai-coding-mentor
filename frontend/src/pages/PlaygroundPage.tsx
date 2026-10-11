import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Terminal as TerminalIcon, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ArrowRight,
  Lightbulb,
  FileCode2,
  Cpu
} from 'lucide-react';
import { apiClient, ApiError } from '../services/api';
import { storageService, DEFAULT_STARTER_CODE } from '../services/storage';
import type { RunCodeResponse, ExplainErrorResponse, ProgressiveHintResponse } from '../types/api';

interface PlaygroundProps {
  initialCode?: string;
  puzzleId?: string;
  puzzleTitle?: string;
}

export const PlaygroundPage: React.FC<PlaygroundProps> = ({
  initialCode,
  puzzleId,
  puzzleTitle,
}) => {
  const progress = storageService.getProgress();
  const [code, setCode] = useState<string>(
    initialCode || progress.currentCodeDraft || DEFAULT_STARTER_CODE
  );
  const [stdin, setStdin] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'output' | 'input' | 'mentor'>('output');

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<RunCodeResponse | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isBackendUnavailable, setIsBackendUnavailable] = useState<boolean>(false);

  // AI Mentor states
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<ExplainErrorResponse | null>(null);
  const [aiHint, setAiHint] = useState<ProgressiveHintResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedHintLevel, setSelectedHintLevel] = useState<number>(1);

  const [copied, setCopied] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  // Auto-save draft code in localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!puzzleId) {
        storageService.saveCodeDraft(code);
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [code, puzzleId]);

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Add Ctrl+Enter / Cmd+Enter shortcut to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset editor back to starter template?')) {
      const resetCode = initialCode || DEFAULT_STARTER_CODE;
      setCode(resetCode);
      setRunResult(null);
      setExecutionError(null);
      setAiExplanation(null);
      setAiHint(null);
      setAiError(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionError(null);
    setIsBackendUnavailable(false);
    setActiveTab('output');

    try {
      const result = await apiClient.runCode(code, stdin);
      setRunResult(result);
      storageService.incrementCodeRuns();

      // If compilation error occurred, suggest mentor tab
      if (!result.success && result.compileOutput) {
        // compiler error
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.isBackendUnavailable) {
        setIsBackendUnavailable(true);
        setExecutionError(err.message);
      } else {
        setExecutionError(err.message || 'Execution request failed.');
      }
      setRunResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExplainError = async () => {
    const compileOutput = runResult?.compileOutput || executionError || '';
    if (!compileOutput) {
      setActiveTab('mentor');
      setAiError('No compiler errors detected yet. Run your code first to generate compiler diagnostics.');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);
    setActiveTab('mentor');

    try {
      const response = await apiClient.explainError(code, compileOutput);
      setAiExplanation(response);
      storageService.incrementErrorsExplained();
    } catch (err: any) {
      if (err instanceof ApiError && err.isBackendUnavailable) {
        setAiError(`Backend is unavailable at ${apiClient.getBaseUrl()}. Please ensure the backend is running to receive AI explanations.`);
      } else {
        setAiError(err.message || 'Failed to obtain AI explanation.');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRequestHint = async (level: number) => {
    setSelectedHintLevel(level);
    setIsAiLoading(true);
    setAiError(null);
    setActiveTab('mentor');

    try {
      const response = await apiClient.getHint(code, puzzleId || 'general-playground', level);
      setAiHint(response);
      storageService.incrementAiHints();
    } catch (err: any) {
      if (err instanceof ApiError && err.isBackendUnavailable) {
        setAiError(`Backend is unavailable at ${apiClient.getBaseUrl()}. Please ensure the backend is running to receive AI hints.`);
      } else {
        setAiError(err.message || 'Failed to obtain AI hint.');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Editor Control Header */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700/60">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{puzzleTitle ? `puzzle: ${puzzleTitle}` : 'main.c'}</span>
          </div>

          <span className="text-xs text-slate-500 hidden md:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">Ctrl+Enter</kbd> to run
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('mentor');
              if (runResult && !runResult.success) {
                handleExplainError();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/80 hover:bg-purple-900/60 transition-all hover:scale-[1.02]"
            title="Open AI Mentor panel"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Mentor</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Compiling...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split: Code Editor (Left) & Panels (Right) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Left: Monaco Editor Container */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800 relative bg-[#1e1e1e]">
          <Editor
            height="100%"
            language="c"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            onMount={handleEditorMount}
            options={{
              fontSize: progress.profile.fontSize || 14,
              fontFamily: "'Fira Code', Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              lineNumbers: 'on',
              padding: { top: 12, bottom: 12 },
            }}
            loading={
              <div className="flex items-center justify-center h-full text-slate-500 text-sm gap-2">
                <Cpu className="w-5 h-5 animate-pulse text-indigo-400" />
                <span>Loading Monaco C Editor...</span>
              </div>
            }
          />
        </div>

        {/* Right: Tabbed Output / Input / AI Mentor Panels */}
        <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col h-full bg-slate-900/90 shrink-0">
          {/* Panel Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/80 px-2 shrink-0">
            <button
              onClick={() => setActiveTab('output')}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'output'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Output</span>
              {runResult && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    runResult.success ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'input'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Input (stdin)</span>
              {stdin.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('mentor')}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'mentor'
                  ? 'border-purple-500 text-purple-400 bg-slate-900/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Mentor</span>
              {(aiExplanation || aiHint) && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-slate-950 font-mono text-xs">
            {/* OUTPUT TAB */}
            {activeTab === 'output' && (
              <div className="space-y-4">
                {/* Offline Warning if execution failed due to backend unreachable */}
                {isBackendUnavailable && (
                  <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-900/80 text-rose-300">
                    <div className="flex items-center gap-2 font-semibold text-rose-200 mb-1">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Backend Unavailable</span>
                    </div>
                    <p className="text-xs text-rose-300/90 leading-relaxed font-sans">
                      {executionError}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-400 font-sans">
                      The frontend does not synthesize simulated compiler output. Run the backend server on port 3001 to compile and run real C programs.
                    </p>
                  </div>
                )}

                {!isBackendUnavailable && executionError && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300">
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Execution Error</span>
                    </div>
                    <pre className="text-xs text-rose-200 whitespace-pre-wrap font-mono">{executionError}</pre>
                  </div>
                )}

                {/* No execution yet */}
                {!runResult && !executionError && !isBackendUnavailable && !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16 font-sans text-center">
                    <TerminalIcon className="w-10 h-10 text-slate-700 mb-3" />
                    <p className="text-sm font-medium text-slate-400">Terminal ready</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs">
                      Click <strong className="text-slate-400">Run Code</strong> to compile and execute your C program.
                    </p>
                  </div>
                )}

                {/* Running spinner */}
                {isRunning && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-sans">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs font-medium">Sending to isolated sandbox compiler...</p>
                  </div>
                )}

                {/* Successful or failed run result */}
                {runResult && (
                  <div className="space-y-3">
                    {/* Status header */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2">
                        {runResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className={`font-semibold ${runResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {runResult.success ? 'Execution Successful' : 'Compilation / Runtime Failed'}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        Exit code: {runResult.exitCode}
                      </span>
                    </div>

                    {/* Standard Output */}
                    {runResult.stdout && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider">
                          Standard Output (stdout)
                        </div>
                        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 whitespace-pre-wrap font-mono leading-relaxed select-text">
                          {runResult.stdout}
                        </div>
                      </div>
                    )}

                    {/* Standard Error */}
                    {runResult.stderr && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-sans font-semibold text-amber-400 uppercase tracking-wider">
                          Standard Error (stderr)
                        </div>
                        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-300 whitespace-pre-wrap font-mono leading-relaxed select-text">
                          {runResult.stderr}
                        </div>
                      </div>
                    )}

                    {/* Compile Output */}
                    {runResult.compileOutput && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-sans font-semibold text-rose-400 uppercase tracking-wider">
                            Compiler Output (gcc)
                          </span>
                          <button
                            onClick={handleExplainError}
                            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-sans font-medium"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Explain this error with AI</span>
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/50 text-rose-300 whitespace-pre-wrap font-mono leading-relaxed select-text">
                          {runResult.compileOutput}
                        </div>
                      </div>
                    )}

                    {/* Empty output message */}
                    {!runResult.stdout && !runResult.stderr && !runResult.compileOutput && (
                      <p className="text-xs text-slate-500 font-sans italic">
                        Program executed with exit code {runResult.exitCode} and produced no output.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* INPUT TAB */}
            {activeTab === 'input' && (
              <div className="h-full flex flex-col font-sans">
                <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Standard Input (stdin)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Passed to your program's scanf/cin</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  If your C code reads input with <code className="text-indigo-400 font-mono">scanf("%d", &n)</code>, supply your inputs line by line here.
                </p>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="e.g.&#10;42&#10;Hello"
                  className="w-full flex-1 min-h-[160px] p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500/80 resize-none transition-colors"
                />
              </div>
            )}

            {/* AI MENTOR TAB */}
            {activeTab === 'mentor' && (
              <div className="space-y-4 font-sans">
                {/* Mentor Philosophy Header */}
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-xs text-indigo-300">
                  <div className="flex items-center gap-2 font-semibold text-indigo-200">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Teaching Philosophy</span>
                  </div>
                  <p className="mt-1 text-slate-400 leading-relaxed">
                    AI Mentor teaches you how to think through errors and fix bugs yourself with progressive hints, rather than directly giving away solutions.
                  </p>
                </div>

                {/* AI Actions */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Mentor Assistance</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleExplainError}
                      disabled={isAiLoading}
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-xs font-medium text-slate-200 transition-all disabled:opacity-50"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>Explain Compiler Error</span>
                    </button>

                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => handleRequestHint(lvl)}
                          disabled={isAiLoading}
                          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-lg border text-xs transition-all disabled:opacity-50 ${
                            selectedHintLevel === lvl && aiHint
                              ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                          title={`Request Hint Level ${lvl}`}
                        >
                          <span className="font-semibold text-[11px]">Hint {lvl}</span>
                          <span className="text-[9px] text-slate-500">
                            {lvl === 1 ? 'Concept' : lvl === 2 ? 'Guidance' : 'Logic'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loading Indicator */}
                {isAiLoading && (
                  <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-purple-300 font-medium">Consulting AI Mentor...</p>
                    <p className="text-[11px] text-slate-500 mt-1">Analyzing code syntax and logic</p>
                  </div>
                )}

                {/* AI Error / Backend Unavailable Warning */}
                {aiError && (
                  <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300">
                    <div className="flex items-center gap-2 font-semibold text-rose-200 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>AI Mentor Connection Issue</span>
                    </div>
                    <p className="mt-1 text-xs text-rose-300/90 leading-relaxed">
                      {aiError}
                    </p>
                  </div>
                )}

                {/* Explanation Card */}
                {aiExplanation && (
                  <div className="space-y-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                      <Lightbulb className="w-4 h-4 text-purple-400" />
                      <span>Compiler Explanation</span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed">
                      {aiExplanation.explanation}
                    </div>

                    {aiExplanation.suggestion && (
                      <div className="p-2.5 rounded bg-slate-950 border border-purple-900/40 text-xs text-purple-200">
                        <strong className="text-purple-400 block mb-0.5">Suggestion:</strong>
                        {aiExplanation.suggestion}
                      </div>
                    )}
                  </div>
                )}

                {/* Progressive Hint Card */}
                {aiHint && (
                  <div className="space-y-3 p-3.5 rounded-lg bg-slate-900 border border-purple-900/60 shadow-lg shadow-purple-950/20">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-purple-300">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Progressive Hint (Level {aiHint.hintLevel}/3)</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        {aiHint.hintLevel === 1 ? 'Conceptual Direction' : aiHint.hintLevel === 2 ? 'Targeted Clue' : 'Structural Logic'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {aiHint.hint}
                    </p>

                    {aiHint.hintLevel < 3 && (
                      <button
                        onClick={() => handleRequestHint(aiHint.hintLevel + 1)}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        <span>Need more guidance? Request Hint {aiHint.hintLevel + 1}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
