import { useCallback, useEffect, useRef, useState } from 'react';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export type VoiceRecognitionStatus =
  | 'idle'
  | 'requesting'
  | 'listening'
  | 'error'
  | 'unsupported';

export interface VoiceRecognitionError {
  type: string;
  message: string;
}

interface UseVoiceRecognitionOptions {
  /** 是否启用语音识别 */
  enabled: boolean;
  /** 语言代码，默认 zh-CN */
  language?: string;
  /** 识别到文本时的回调 */
  onResult: (text: string, isFinal: boolean) => void;
  /** 错误回调 */
  onError?: (error: VoiceRecognitionError) => void;
}

export function useVoiceRecognition({
  enabled,
  language = 'zh-CN',
  onResult,
  onError,
}: UseVoiceRecognitionOptions) {
  const [status, setStatus] = useState<VoiceRecognitionStatus>('idle');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const enabledRef = useRef(enabled);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Keep refs in sync
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Check support
  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setStatus('unsupported');
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    try {
      setStatus('requesting');

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onResultRef.current?.(finalTranscript, true);
        }
        if (interimTranscript) {
          onResultRef.current?.(interimTranscript, false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMap: Record<string, string> = {
          'no-speech': '未检测到语音，请尝试大声朗读',
          'audio-capture': '无法访问麦克风',
          'not-allowed': '麦克风权限被拒绝，请在浏览器设置中允许访问',
          'network': '网络错误，语音识别服务不可用',
          'aborted': '语音识别已中止',
          'language-not-supported': '不支持该语言',
        };

        const message = errorMap[event.error] || `语音识别错误: ${event.error}`;

        onErrorRef.current?.({ type: event.error, message });

        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          setStatus('error');
        } else if (event.error === 'no-speech') {
          // no-speech is recoverable, restart
          setStatus('listening');
        } else {
          setStatus('error');
        }
      };

      recognition.onend = () => {
        // Auto-restart if still enabled
        if (enabledRef.current && status !== 'error') {
          try {
            recognition.start();
          } catch {
            setStatus('idle');
          }
        } else {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '无法访问麦克风';
      onErrorRef.current?.({ type: 'microphone-denied', message: errorMsg });
      setStatus('error');
    }
  }, [isSupported, language, status]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setStatus('idle');
  }, []);

  // Handle enabled changes
  useEffect(() => {
    if (!isSupported) return;

    if (enabled) {
      startListening();
    } else {
      stopListening();
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [enabled, isSupported, startListening, stopListening]);

  return {
    status,
    isSupported,
    startListening,
    stopListening,
  };
}
