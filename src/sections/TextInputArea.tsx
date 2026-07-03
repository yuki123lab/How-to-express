import { useCallback } from 'react';
import { useApp } from '../AppContext';

export default function TextInputArea() {
  const { text, setText } = useApp();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    [setText]
  );

  const charCount = text.replace(/\s/g, '').length;

  return (
    <div
      className="flex-1 relative"
      style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '48px',
      }}
    >
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="输入或粘贴你的文本..."
        className="w-full h-full resize-none outline-none"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: 1.8,
          border: 'none',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 24,
          right: 48,
          fontSize: 12,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {charCount.toLocaleString()} 字
      </div>
    </div>
  );
}
