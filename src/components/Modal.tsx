import type { ReactNode } from 'react'

interface Props {
  onClose: () => void
  children: ReactNode
}

export function Modal({ onClose, children }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          marginBottom: 0,
        }}
      >
        <button
          type="button"
          className="secondary"
          style={{ width: 'auto', float: 'right' }}
          onClick={onClose}
        >
          Fermer ✕
        </button>
        <div style={{ clear: 'both' }} />
        {children}
      </div>
    </div>
  )
}