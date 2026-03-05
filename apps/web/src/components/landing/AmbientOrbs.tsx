export function AmbientOrbs() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute rounded-full animate-[orbFloat_20s_ease-in-out_infinite]"
        style={{
          width: 600,
          height: 600,
          top: '-10%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(42,143,157,0.15) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="absolute rounded-full animate-[orbFloat_25s_ease-in-out_infinite_-7s]"
        style={{
          width: 500,
          height: 500,
          top: '20%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(52,216,192,0.08) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="absolute rounded-full animate-[orbFloat_22s_ease-in-out_infinite_-14s]"
        style={{
          width: 400,
          height: 400,
          bottom: '10%',
          left: '20%',
          background: 'radial-gradient(circle, rgba(42,143,157,0.10) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
    </div>
  );
}
