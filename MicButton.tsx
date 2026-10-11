import { Mic, MicOff, Square, Loader2 } from 'lucide-react';

interface MicButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({ isListening, isProcessing, isSupported, onStart, onStop }: MicButtonProps) {
  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <MicOff className="h-10 w-10" />
        </div>
        <p className="text-sm text-slate-500">Voice input not supported in this browser</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-100">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
        <p className="text-sm font-medium text-blue-700">Analyzing your message...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isListening ? onStop : onStart}
        className={[
          'relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2',
          isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 focus-visible:ring-red-400'
            : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 focus-visible:ring-blue-400',
        ].join(' ')}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
      >
        {isListening && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-60" />
            <span className="absolute -inset-2 animate-pulse rounded-full border-2 border-red-300 opacity-50" />
          </>
        )}
        <span className="relative">
          {isListening ? <Square className="h-8 w-8 fill-current" /> : <Mic className="h-10 w-10" />}
        </span>
      </button>
      <p className={`text-sm font-medium ${isListening ? 'text-red-600' : 'text-slate-600'}`}>
        {isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
      </p>
    </div>
  );
}
