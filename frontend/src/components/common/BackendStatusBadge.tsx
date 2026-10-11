import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  showDetails?: boolean;
}

export const BackendStatusBadge: React.FC<Props> = ({ showDetails = false }) => {
  const [online, setOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  const checkStatus = async () => {
    setChecking(true);
    const res = await apiClient.checkHealth();
    setOnline(res.online);
    setChecking(false);
  };

  useEffect(() => {
    let ignore = false;
    apiClient.checkHealth().then((res) => {
      if (!ignore) {
        setOnline(res.online);
      }
    });

    const interval = setInterval(checkStatus, 20000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {online === true && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                online === true
                  ? 'bg-emerald-500'
                  : online === false
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="font-medium text-slate-200">
            {online === true
              ? 'Backend API Connected'
              : online === false
              ? 'Backend Offline'
              : 'Checking API...'}
          </span>
        </div>

        <button
          onClick={checkStatus}
          disabled={checking}
          title="Re-check backend status"
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {showDetails && online === false && (
        <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Backend is not reachable</p>
            <p className="mt-0.5 text-rose-300/90 leading-relaxed">
              Target: <code className="text-rose-200 bg-rose-950 px-1 py-0.5 rounded font-mono text-[11px]">{apiClient.getBaseUrl()}</code>
            </p>
            <p className="mt-1 text-slate-400 text-[11px]">
              Run <code className="text-slate-300 font-mono">npm run dev</code> inside <code className="text-slate-300 font-mono">backend/</code> to enable C compilation and AI mentoring.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
