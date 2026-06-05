export default function BackgroundShader() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', background: '#ffffff', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -2,
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px),
            radial-gradient(circle, rgba(51,65,85,0.35) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 24px 24px, 24px 24px',
          filter: 'blur(3px)',
        }}
      />
    </div>
  );
}
