import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { useScrollEngine } from '../hooks/useScrollEngine';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import {
  buildParagraphMap,
  findParagraphIndex,
  matchRecognizedText,
  getParagraphScrollPosition,
} from '../utils/textMatcher';
import FloatingControls from './FloatingControls';

const MIN_FONT_SIZE = 32;
const MAX_FONT_SIZE = 120;

export default function PlayView() {
  const { text, fontSize: initialFontSize, voiceFollow } = useApp();
  const navigate = useNavigate();
  const [playFontSize, setPlayFontSize] = useState(initialFontSize);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Scroll engine - disable when voice follow is active
  const { paused, speed, togglePause, changeSpeed, reset } = useScrollEngine(
    !voiceFollow
  );
  const controlsVisible = useControlsVisibility(true);

  // Current reading position tracking
  const currentOffsetRef = useRef(0);
  const paragraphOffsetsRef = useRef<number[]>([]);
  const fullTextRef = useRef('');

  const paragraphs = useMemo(() => {
    if (!text.trim()) return [];
    return text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [text]);

  // Build paragraph map for text matching
  useMemo(() => {
    const { fullText, paragraphOffsets } = buildParagraphMap(paragraphs);
    fullTextRef.current = fullText;
    paragraphOffsetsRef.current = paragraphOffsets;
  }, [paragraphs]);

  // Handle voice recognition results
  const handleVoiceResult = useCallback(
    (recognizedText: string, _isFinal: boolean) => {
      const fullText = fullTextRef.current;
      const paragraphOffsets = paragraphOffsetsRef.current;
      if (!fullText || paragraphOffsets.length === 0) return;

      const matchedOffset = matchRecognizedText(
        recognizedText,
        fullText,
        currentOffsetRef.current
      );

      if (matchedOffset >= 0) {
        currentOffsetRef.current = matchedOffset;

        // Find which paragraph this offset belongs to
        const paragraphIndex = findParagraphIndex(
          matchedOffset,
          paragraphOffsets
        );

        // Smooth scroll to that paragraph
        const scrollPos = getParagraphScrollPosition(
          paragraphIndex,
          paragraphOffsets.length
        );

        window.scrollTo({
          top: scrollPos,
          behavior: 'smooth',
        });

        // Clear any previous error
        setVoiceError(null);
      }
    },
    []
  );

  const handleVoiceError = useCallback(
    (error: { type: string; message: string }) => {
      setVoiceError(error.message);
      // Auto-clear error after 5 seconds
      setTimeout(() => setVoiceError(null), 5000);
    },
    []
  );

  // Voice recognition hook
  const { status: voiceStatus, isSupported: voiceSupported } =
    useVoiceRecognition({
      enabled: voiceFollow,
      language: 'zh-CN',
      onResult: handleVoiceResult,
      onError: handleVoiceError,
    });

  const handleChangeFontSize = useCallback((delta: number) => {
    setPlayFontSize((prev) => {
      const next = prev + delta;
      return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, next));
    });
  }, []);

  const handleExit = useCallback(() => {
    reset();
    window.scrollTo(0, 0);
    navigate('/edit');
  }, [navigate, reset]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  if (!text.trim()) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: 16,
        }}
      >
        没有文本内容，请返回编辑页面输入文本
      </div>
    );
  }

  return (
    <div
      className="teleprompter-container relative"
      style={{ cursor: controlsVisible ? 'default' : 'none' }}
    >
      {/* Top spacer */}
      <div style={{ height: '100vh' }} />

      {/* Text content */}
      <div
        className="teleprompter-text"
        style={{
          fontSize: playFontSize,
        }}
      >
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '100vh' }} />

      {/* Voice status indicator - top right */}
      {voiceFollow && (
        <div
          className="fixed flex items-center"
          style={{
            top: 24,
            right: 24,
            gap: 8,
            padding: '8px 14px',
            backgroundColor: 'rgba(20, 20, 24, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 20,
            zIndex: 100,
            opacity: controlsVisible ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        >
          {/* Status dot */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor:
                voiceStatus === 'listening'
                  ? '#4ADE80'
                  : voiceStatus === 'requesting'
                    ? 'var(--accent)'
                    : voiceStatus === 'error'
                      ? '#EF4444'
                      : '#8E8E96',
              animation:
                voiceStatus === 'listening'
                  ? 'pulse 1.5s ease-in-out infinite'
                  : 'none',
            }}
          />
          <span
            style={{
              fontSize: 12,
              color:
                voiceStatus === 'error'
                  ? '#EF4444'
                  : 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
            }}
          >
            {voiceStatus === 'listening' && '聆听中'}
            {voiceStatus === 'requesting' && '请求麦克风...'}
            {voiceStatus === 'idle' && '语音跟随'}
            {voiceStatus === 'error' && '错误'}
          </span>
        </div>
      )}

      {/* Voice error toast */}
      {voiceError && (
        <div
          className="fixed left-1/2 -translate-x-1/2"
          style={{
            top: 24,
            padding: '10px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 8,
            color: '#FCA5A5',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            zIndex: 200,
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          {voiceError}
        </div>
      )}

      {/* Voice unsupported warning */}
      {voiceFollow && !voiceSupported && (
        <div
          className="fixed left-1/2 -translate-x-1/2"
          style={{
            top: 24,
            padding: '10px 20px',
            backgroundColor: 'rgba(212, 168, 83, 0.15)',
            border: '1px solid rgba(212, 168, 83, 0.3)',
            borderRadius: 8,
            color: 'var(--accent)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            zIndex: 200,
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          当前浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器
        </div>
      )}

      {/* Floating controls */}
      <FloatingControls
        visible={controlsVisible}
        paused={paused}
        speed={speed}
        voiceFollow={voiceFollow}
        voiceListening={voiceStatus === 'listening'}
        onTogglePause={togglePause}
        onChangeSpeed={changeSpeed}
        onChangeFontSize={handleChangeFontSize}
        onExit={handleExit}
      />

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
