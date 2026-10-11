import { AlertTriangle, CheckCircle2, MapPin, Navigation } from 'lucide-react';
import type { ClassificationResult } from '@/types/emergency';
import { getCategoryConfig, getSeverityConfig, getDialectLabel } from '@/lib/categories';

interface ResultDisplayProps {
  result: ClassificationResult;
  originalText: string;
}

export function ResultDisplay({ result, originalText }: ResultDisplayProps) {
  const catConfig = getCategoryConfig(result.category);
  const sevConfig = getSeverityConfig(result.severity);
  const Icon = result.is_emergency ? AlertTriangle : CheckCircle2;
  const confidencePercent = Math.round(result.confidence * 100);
  const hasLocation = result.latitude != null && result.longitude != null;

  return (
    <div className="animate-[fadeInUp_0.4s_ease-out] space-y-5">
      {/* Emergency / Normal banner */}
      <div
        className={[
          'flex items-center gap-4 rounded-2xl border-2 p-5',
          result.is_emergency
            ? 'border-red-300 bg-red-50'
            : 'border-green-300 bg-green-50',
        ].join(' ')}
      >
        <div
          className={[
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl',
            result.is_emergency ? 'bg-red-100' : 'bg-green-100',
          ].join(' ')}
        >
          <Icon
            className={[
              'h-8 w-8',
              result.is_emergency ? 'text-red-600' : 'text-green-600',
            ].join(' ')}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">
            Emergency Status
          </p>
          <p
            className={[
              'text-2xl font-bold',
              result.is_emergency ? 'text-red-700' : 'text-green-700',
            ].join(' ')}
          >
            {result.is_emergency ? 'EMERGENCY DETECTED' : 'NO EMERGENCY'}
          </p>
        </div>
      </div>

      {/* Category & Severity grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Category */}
        <div className={`rounded-2xl border-2 ${catConfig.borderColor} ${catConfig.bgColor} p-5`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </p>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ${catConfig.color}`}>
              <catConfig.icon className="h-7 w-7" />
            </div>
            <span className={`text-xl font-bold ${catConfig.color}`}>
              {catConfig.label}
            </span>
          </div>
        </div>

        {/* Severity */}
        <div className={`rounded-2xl border-2 ${sevConfig.borderColor} ${sevConfig.bgColor} p-5`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Severity
          </p>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ${sevConfig.color}`}>
              <span className={`h-3 w-3 rounded-full ${sevConfig.dotColor}`} />
            </div>
            <span className={`text-xl font-bold ${sevConfig.color}`}>
              {sevConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Details row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2">
          <span className="text-sm text-slate-500">Dialect:</span>
          <span className="text-sm font-semibold text-slate-700">
            {getDialectLabel(result.dialect)}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2">
          <span className="text-sm text-slate-500">Confidence:</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {confidencePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Location info */}
      {hasLocation && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <Navigation className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
              Location Captured
            </p>
            {result.location_name ? (
              <p className="mt-0.5 flex items-start gap-1.5 text-sm font-medium text-blue-800">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                {result.location_name}
              </p>
            ) : (
              <p className="mt-0.5 text-sm font-medium text-blue-800">
                Lat: {result.latitude?.toFixed(4)}, Lng: {result.longitude?.toFixed(4)}
              </p>
            )}
            <a
              href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=16/${result.latitude}/${result.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs font-medium text-blue-600 underline hover:text-blue-700"
            >
              View on map
            </a>
          </div>
        </div>
      )}

      {/* Original text */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Detected Text
        </p>
        <p className="text-base leading-relaxed text-slate-700">
          {originalText}
        </p>
      </div>
    </div>
  );
}
