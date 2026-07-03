export default function Header() {
  return (
    <header
      className="flex items-center justify-between flex-shrink-0"
      style={{
        height: 64,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 48px',
      }}
    >
      <h1
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
        }}
      >
        提词器
      </h1>
    </header>
  );
}
