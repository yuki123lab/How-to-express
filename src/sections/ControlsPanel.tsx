import { useCallback } from 'react';
import { useApp } from '../AppContext';
import { useNavigate } from 'react-router-dom';

export default function ControlsPanel() {
  const { text, fontSize, setFontSize, voiceFollow, setVoiceFollow } = useApp();
  const navigate = useNavigate();

  const handleFontSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFontSize(Number(e.target.value));
    },
    [setFontSize]
  );

  const handlePlay = useCallback(() => {
    if (!text.trim()) return;
    navigate('/play');
  }, [text, navigate]);

  const previewText = '这是一段预览文字';

  return (
    <div
      className="flex-shrink-0"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      {/* Font size preview */}
      <div
        className="flex items-center justify-center"
        style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 48px',
          minHeight: 60,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: fontSize,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-teleprompter)',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {previewText}
        </span>
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '20px 48px' }}
      >
        {/* Font size slider */}
        <div className="flex items-center" style={{ gap: 16, flex: 1, maxWidth: 400 }}>
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
            }}
          >
            字号
          </span>
          <span
            style={{
              fontSize: 14,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              minWidth: 48,
            }}
          >
            {fontSize}px
          </span>
          <input
            type="range"
            min={32}
            max={120}
            step={4}
            value={fontSize}
            onChange={handleFontSizeChange}
            className="flex-1"
            style={{ maxWidth: 240 }}
          />
        </div>

        {/* Voice follow toggle */}
        <div className="flex items-center" style={{ gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              whiteSpace: 'nowrap',
            }}
          >
            语音跟随
          </span>
          <button
            onClick={() => setVoiceFollow(!voiceFollow)}
            className="relative"
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              border: 'none',
              backgroundColor: voiceFollow ? 'var(--accent)' : 'var(--bg-panel)',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              flexShrink: 0,
            }}
          >
            <div
              className="absolute"
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: 'var(--text-primary)',
                top: 3,
                left: voiceFollow ? 21 : 3,
                transition: 'left 0.3s ease',
              }}
            />
          </button>
        </div>

        {/* Play button */}
        <button
          onClick={handlePlay}
          disabled={!text.trim()}
          className="flex items-center justify-center"
          style={{
            width: 140,
            height: 44,
            backgroundColor: text.trim() ? 'var(--accent)' : 'rgba(212, 168, 83, 0.3)',
            color: 'var(--bg-primary)',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            borderRadius: 8,
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s ease',
            gap: 6,
          }}
          onMouseEnter={(e) => {
            if (text.trim()) {
              (e.target as HTMLElement).style.backgroundColor = '#E0B860';
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.backgroundColor = text.trim()
              ? 'var(--accent)'
              : 'rgba(212, 168, 83, 0.3)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          开始提词
        </button>
      </div>
    </div>
  );
}
