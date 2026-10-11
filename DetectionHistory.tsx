import { useEffect, useState } from 'react';
import { History, Trash2, MapPin, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { EmergencyDetection } from '@/types/emergency';
import { getCategoryConfig, getSeverityConfig, getDialectLabel } from '@/lib/categories';

interface DetectionHistoryProps {
  refreshTrigger: number;
}

export function DetectionHistory({ refreshTrigger }: DetectionHistoryProps) {
  const [records, setRecords] = useState<EmergencyDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('emergency_detections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setRecords((data as EmergencyDetection[]) || []);
      }
      setLoading(false);
    }

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('emergency_detections')
      .delete()
      .eq('id', id);
    if (!error) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  }

  function formatTime(ts: string): string {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <History className="h-5 w-5 text-slate-500" />
        <h2 className="text-lg font-semibold text-slate-800">Detection History</h2>
        {records.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {records.length}
          </span>
        )}
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center text-sm text-red-600">
            Failed to load history: {error}
          </div>
        ) : records.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <History className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-400">No detections yet. Your history will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {records.map((record) => {
              const catConfig = getCategoryConfig(record.category);
              const sevConfig = getSeverityConfig(record.severity);
              const CatIcon = catConfig.icon;
              return (
                <li
                  key={record.id}
                  className="group flex items-start gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${catConfig.bgColor} ${catConfig.color}`}
                  >
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {record.original_text}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${catConfig.bgColor} ${catConfig.color}`}
                      >
                        {catConfig.label}
                      </span>
                      {record.is_emergency && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${sevConfig.bgColor} ${sevConfig.color}`}
                        >
                          {sevConfig.label}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {formatTime(record.created_at)}
                      </span>
                      {record.latitude != null && record.longitude != null && (
                        <span className="flex items-center gap-1 text-xs text-blue-500" title={record.location_name || undefined}>
                          <MapPin className="h-3 w-3" />
                          {record.location_name ? record.location_name.split(',')[0] : 'Location'}
                        </span>
                      )}
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {getDialectLabel(record.dialect)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    aria-label="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
