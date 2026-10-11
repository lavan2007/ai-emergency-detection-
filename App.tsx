import { useState } from 'react';
import { Siren, ShieldCheck, Activity, Globe2 } from 'lucide-react';
import { DetectionPanel } from '@/components/DetectionPanel';
import { DetectionHistory } from '@/components/DetectionHistory';
import { DatasetInfo } from '@/components/DatasetInfo';

function App() {
  const [historyRefresh, setHistoryRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-md shadow-red-500/20">
              <Siren className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 sm:text-lg">
                AI Emergency Detection
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Tamil & Tanglish NLP Voice Recognition
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="text-xs font-medium text-green-700">System Active</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero section */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Powered by NLP & Machine Learning
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">
            Speak Your Emergency.
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              We'll Classify It Instantly.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            Our AI system understands Tamil, Tanglish, and colloquial regional dialects.
            Speak or type your emergency message, and we'll detect the category and severity
            in real time.
          </p>
        </div>

        {/* Feature badges */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Globe2, label: 'Multi-Dialect', sub: 'Tamil + Tanglish' },
            { icon: Activity, label: 'Real-Time', sub: 'Instant Analysis' },
            { icon: ShieldCheck, label: '8 Categories', sub: 'Accident to Crime' },
            { icon: Siren, label: 'Severity Levels', sub: 'High / Med / Low' },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 p-4 text-center"
            >
              <feature.icon className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">{feature.label}</span>
              <span className="text-xs text-slate-400">{feature.sub}</span>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DetectionPanel onDetectionComplete={() => setHistoryRefresh((n) => n + 1)} />
          </div>
          <div className="lg:col-span-2">
            <DetectionHistory refreshTrigger={historyRefresh} />
          </div>
        </div>

        {/* Dataset & training info */}
        <div className="mt-8">
          <DatasetInfo />
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 pt-8 text-center">
          <p className="text-sm text-slate-500">
            AI-Based Emergency Detection System for Regional Dialects
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Using NLP, TF-IDF-style keyword matching, and severity classification
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
