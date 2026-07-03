import { useCallback } from 'react';

interface FloatingControlsProps {
  visible: boolean;
  paused: boolean;
  speed: number;
  voiceFollow: boolean;
  voiceListening: boolean;
  onTogglePause: () => void;
  onChangeSpeed: (delta: number) => void;
  onChangeFontSize: (delta: number) => void;
  onExit: () => void;
}

export default function FloatingControls({
  visible,
  paused,
  speed,
  voiceFollow,
  voiceListening,
  onTogglePause,
  onChangeSpeed,
  onChangeFontSize,
  onExit,
}: FloatingControlsProps) {
  const speedRatio = (speed / 1.2).toFixed(1);

  const buttonStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  };

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      (e.currentTarget as HTMLElement).style.backgroundColor =
        'rgba(240, 240, 242, 0.08)';
    },
    []
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
    },
    []
  );

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 floating-controls flex items-center"
      style={{
        bottom: 40,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        gap: 4,
        zIndex: 100,
      }}
    >
      {/* Voice follow indicator - shown when voice mode is active */}
      {voiceFollow && (
        <>
          <div
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={voiceListening ? '#4ADE80' : 'var(--accent)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
              {voiceListening && (
                <>
                  <line x1="8" y1="22" x2="16" y2="22" />
                  <circle
                    cx="12"
                    cy="11"
                    r="1"
                    fill={voiceListening ? '#4ADE80' : 'var(--accent)'}
                    stroke="none"
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.3;1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </svg>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 1,
              height: 24,
              backgroundColor: 'var(--border-color)',
              margin: '0 4px',
              flexShrink: 0,
            }}
          />
        </>
      )}

      {/* Play/Pause - disabled when voice follow is active */}
      <button
        onClick={onTogglePause}
        disabled={voiceFollow}
        style={{
          ...buttonStyle,
          opacity: voiceFollow ? 0.3 : 1,
          cursor: voiceFollow ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={voiceFollow ? undefined : handleMouseEnter}
        onMouseLeave={voiceFollow ? undefined : handleMouseLeave}
        title={paused ? '播放 (空格键)' : '暂停 (空格键)'}
      >
        {paused ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="3" width="6" height="18" rx="1" />
            <rect x="14" y="3" width="6" height="18" rx="1" />
          </svg>
        )}
      </button>

      {/* Speed display */}
      <span
        style={{
          fontSize: 14,
          color: voiceFollow ? 'rgba(142,142,150,0.4)' : 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          minWidth: 40,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {speedRatio}x
      </span>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          backgroundColor: 'var(--border-color)',
          margin: '0 8px',
          flexShrink: 0,
        }}
      />

      {/* Decrease speed */}
      <button
        onClick={() => onChangeSpeed(-0.3)}
        disabled={voiceFollow}
        style={{
          ...buttonStyle,
          opacity: voiceFollow ? 0.3 : 1,
          cursor: voiceFollow ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={voiceFollow ? undefined : handleMouseEnter}
        onMouseLeave={voiceFollow ? undefined : handleMouseLeave}
        title="减速 (↓)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      </button>

      {/* Increase speed */}
      <button
        onClick={() => onChangeSpeed(0.3)}
        disabled={voiceFollow}
        style={{
          ...buttonStyle,
          opacity: voiceFollow ? 0.3 : 1,
          cursor: voiceFollow ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={voiceFollow ? undefined : handleMouseEnter}
        onMouseLeave={voiceFollow ? undefined : handleMouseLeave}
        title="加速 (↑)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      </button>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          backgroundColor: 'var(--border-color)',
          margin: '0 8px',
          flexShrink: 0,
        }}
      />

      {/* Decrease font size */}
      <button
        onClick={() => onChangeFontSize(-4)}
        style={{
          ...buttonStyle,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="缩小字号"
      >
        A
        <span style={{ fontSize: 8, marginLeft: 1 }}>-</span>
      </button>

      {/* Increase font size */}
      <button
        onClick={() => onChangeFontSize(4)}
        style={{
          ...buttonStyle,
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="放大字号"
      >
        A
        <span style={{ fontSize: 10, marginLeft: 1 }}>+</span>
      </button>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          backgroundColor: 'var(--border-color)',
          margin: '0 8px',
          flexShrink: 0,
        }}
      />

      {/* Exit */}
      <button
        onClick={onExit}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="退出 (ESC)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
