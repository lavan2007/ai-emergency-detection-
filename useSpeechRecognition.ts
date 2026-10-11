import { useState, useRef, useCallback, useEffect } from 'react';

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
    length: number;
  }>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  }
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
}

export function useSpeechRecognition({ lang = 'ta-IN', onResult }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  const transcriptRef = useRef('');
  const manualStopRef = useRef(false);
  const listeningRef = useRef(false);
  const shouldFireCallbackRef = useRef(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Recreate recognition when lang changes
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Clean up old recognition if exists
    if (recognitionRef.current) {
      manualStopRef.current = true;
      try {
        recognitionRef.current.abort();
      } catch {
        // already stopped
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listeningRef.current = true;
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        const newTranscript = (transcriptRef.current ? transcriptRef.current + ' ' : '') + final.trim();
        transcriptRef.current = newTranscript;
        setTranscript(newTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions in your browser settings.');
        manualStopRef.current = true;
        shouldFireCallbackRef.current = false;
      } else if (event.error === 'no-speech') {
        if (listeningRef.current && !manualStopRef.current) {
          setError('No speech detected. Please try speaking again.');
          manualStopRef.current = true;
          shouldFireCallbackRef.current = false;
        }
      } else if (event.error === 'audio-capture') {
        setError('No microphone found. Please connect a microphone and try again.');
        manualStopRef.current = true;
        shouldFireCallbackRef.current = false;
      } else if (event.error === 'network') {
        setError('Network error during speech recognition. Please check your connection.');
        manualStopRef.current = true;
        shouldFireCallbackRef.current = false;
      } else if (event.error === 'aborted') {
        // ignore — we triggered the stop
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      listeningRef.current = false;
      setIsListening(false);
      setInterimTranscript('');

      // Only fire the callback when the user manually stopped (not auto-end or error)
      if (shouldFireCallbackRef.current) {
        shouldFireCallbackRef.current = false;
        const finalTranscript = transcriptRef.current;
        if (finalTranscript && finalTranscript.trim() && onResultRef.current) {
          onResultRef.current(finalTranscript.trim());
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      manualStopRef.current = true;
      shouldFireCallbackRef.current = false;
      listeningRef.current = false;
      try {
        recognition.abort();
      } catch {
        // already stopped
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    if (listeningRef.current) return;

    setError(null);
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    manualStopRef.current = false;
    shouldFireCallbackRef.current = false;

    try {
      recognitionRef.current.start();
    } catch {
      // already started
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;

    // Mark that we should fire the callback when onend fires
    shouldFireCallbackRef.current = true;
    manualStopRef.current = true;

    if (!listeningRef.current) {
      // Already ended — fire callback directly
      const finalTranscript = transcriptRef.current;
      shouldFireCallbackRef.current = false;
      if (finalTranscript && finalTranscript.trim() && onResultRef.current) {
        onResultRef.current(finalTranscript.trim());
      }
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      // already stopped
    }
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    shouldFireCallbackRef.current = false;
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    start,
    stop,
    reset,
  };
}
