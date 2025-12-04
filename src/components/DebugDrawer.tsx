export default function DebugDrawer() {
  if (!import.meta.env.DEV) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        padding: '8px 10px',
        border: '1px dashed #999',
        background: '#fff',
        borderRadius: 8,
        fontSize: 12,
        zIndex: 50,
      }}
    >
      <strong>Debug</strong> (DEV only)
    </div>
  )
}
