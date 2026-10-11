import { useState, useCallback } from 'react';
import { Loader2, Send, X, AlertCircle, MapPin, CheckCircle2, Navigation, Globe } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { MicButton } from './MicButton';
import { ResultDisplay } from './ResultDisplay';
import { classifyEmergency } from '@/lib/classify';
import type { ClassificationResult } from '@/types/emergency';

interface DetectionPanelProps {
  onDetectionComplete: () => void;
}

type LocationState = 'none' | 'granted' | 'denied' | 'loading';
type VoiceLang = 'ta-IN' | 'en-IN' | 'en-US';

const VOICE_LANG_OPTIONS: { value: VoiceLang; label: string; hint: string }[] = [
  { value: 'ta-IN', label: 'Tamil', hint: 'Speak in Tamil' },
  { value: 'en-IN', label: 'Tanglish', hint: 'Tamil mixed with English' },
  { value: 'en-US', label: 'English', hint: 'Speak in English' },
];

const EXAMPLE_MESSAGES = [
  'Road la accident aayiduchu, seekiram ambulance anuppunga',
  'Veetla neruppu erikkuthu, udhavi vaangunga',
  'என் பேரம்மாவுக்கு மார்பு வலி, விரைவில் ஆம்புலன்ஸ் அனுப்புங்க',
  'Current shock adikkuthu, udhavi vaa',
  'Maari peyyuthu, veetla thanneer pugundhuduchu',
  'My grandmother has chest pain, send ambulance immediately',
];

export function DetectionPanel({ onDetectionComplete }: DetectionPanelProps) {
  const [typedText, setTypedText] = useState('');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [resultText, setResultText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('none');
  const [activeInput, setActiveInput] = useState<'voice' | 'text'>('voice');
  const [voiceLang, setVoiceLang] = useState<VoiceLang>('ta-IN');

  // ── Voice recognition ──
  const handleVoiceComplete = useCallback((transcript: string) => {
    const trimmed = transcript.trim();
    if (trimmed) {
      runClassification(trimmed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported,
    start,
    stop,
    reset,
  } = useSpeechRecognition({ lang: voiceLang, onResult: handleVoiceComplete });

  // ── Classification ──
  async function runClassification(text: string) {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const loc = await tryGetLocation();
      const res = await classifyEmergency(text, loc?.lat, loc?.lng);
      setResult(res);
      setResultText(text);
      onDetectionComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classification failed');
    } finally {
      setProcessing(false);
    }
  }

  // ── Location ──
  async function tryGetLocation(): Promise<{ lat: number; lng: number } | null> {
    if (location) return location;
    if (!('geolocation' in navigator)) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          setLocationState('granted');
          resolve(loc);
        },
        () => {
          resolve(null);
        },
        { timeout: 5000, enableHighAccuracy: true },
      );
    });
  }

  async function handleEnableLocation() {
    if (!('geolocation' in navigator)) {
      setLocationState('denied');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationState('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setLocationState('granted');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationState('denied');
        } else {
          setLocationState('none');
          setError('Could not get your location. Please try again.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  function handleSubmitText() {
    const text = typedText.trim();
    if (!text) return;
    runClassification(text);
  }

  function handleExample(text: string) {
    setTypedText(text);
    setActiveInput('text');
  }

  function handleClear() {
    setResult(null);
    setResultText('');
    setTypedText('');
    setError(null);
    reset();
  }

  const displayTranscript = transcript || interimTranscript;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
      {/* Location access bar */}
      <div className="mb-6">
        {locationState === 'none' && (
          <button
            onClick={handleEnableLocation}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100"
          >
            <Navigation className="h-4 w-4" />
            Enable Location Access
          </button>
        )}
        {locationState === 'loading' && (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Getting your location...
          </div>
        )}
        {locationState === 'granted' && (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Location Enabled
            {location && (
              <span className="text-green-600">
                ({location.lat.toFixed(3)}, {location.lng.toFixed(3)})
              </span>
            )}
          </div>
        )}
        {locationState === 'denied' && (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
            <MapPin className="h-4 w-4" />
            Location access denied. Enable in browser settings to include location.
          </div>
        )}
      </div>

      {/* Input mode toggle */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveInput('voice')}
            className={[
              'rounded-lg px-5 py-2 text-sm font-medium transition-all',
              activeInput === 'voice'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            Voice Input
          </button>
          <button
            onClick={() => setActiveInput('text')}
            className={[
              'rounded-lg px-5 py-2 text-sm font-medium transition-all',
              activeInput === 'text'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            Text Input
          </button>
        </div>
      </div>

      {/* Voice input mode */}
      {activeInput === 'voice' && (
        <div className="space-y-6">
          {/* Language selector */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Globe className="h-3.5 w-3.5" />
              Speech Recognition Language
            </div>
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              {VOICE_LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVoiceLang(opt.value)}
                  disabled={isListening}
                  title={opt.hint}
                  className={[
                    'rounded-md px-4 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50',
                    voiceLang === opt.value
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              {VOICE_LANG_OPTIONS.find((o) => o.value === voiceLang)?.hint}
            </p>
          </div>

          <div className="flex flex-col items-center py-2">
            <MicButton
              isListening={isListening}
              isProcessing={processing}
              isSupported={isSupported}
              onStart={start}
              onStop={stop}
            />
          </div>

          {speechError && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {speechError}
            </div>
          )}

          {displayTranscript && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {isListening ? 'Listening...' : 'Transcribed Text'}
              </p>
              <p className="text-base leading-relaxed text-slate-700">
                {transcript}
                {isListening && interimTranscript && (
                  <span className="text-slate-400"> {interimTranscript}</span>
                )}
              </p>
              {!isListening && transcript && !processing && !result && (
                <button
                  onClick={() => runClassification(transcript)}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                  Analyze This Message
                </button>
              )}
            </div>
          )}

          {isListening && (
            <p className="text-center text-xs text-slate-400">
              Tap the stop button when you finish speaking. Your message will be analyzed automatically.
            </p>
          )}
        </div>
      )}

      {/* Text input mode */}
      {activeInput === 'text' && (
        <div className="space-y-4">
          <div>
            <textarea
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder="Type your emergency message here... (Tamil, Tanglish, or English)"
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex justify-end gap-3">
            {typedText && (
              <button
                onClick={() => setTypedText('')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
            <button
              onClick={handleSubmitText}
              disabled={!typedText.trim() || processing}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {processing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Detection Result</h3>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
          <ResultDisplay result={result} originalText={resultText} />
        </div>
      )}

      {/* Example messages */}
      {!result && !processing && !isListening && (
        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_MESSAGES.map((msg, i) => (
              <button
                key={i}
                onClick={() => handleExample(msg)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {msg.length > 50 ? msg.slice(0, 50) + '...' : msg}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
