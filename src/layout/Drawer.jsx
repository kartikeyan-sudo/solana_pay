import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const menuItems = [
  { path: '/', label: 'Dashboard',    emoji: '⊞' },
  { path: '/send', label: 'Send SOL',  emoji: '↗' },
  { path: '/receive', label: 'Receive', emoji: '↙' },
  { path: '/scan', label: 'Scan & Pay', emoji: '⊡' },
  { path: '/split', label: 'Bill Split', emoji: '⊟' },
  { path: '/history', label: 'Transactions', emoji: '≡' },
  { path: '/escrow', label: 'Escrow',   emoji: '⊕' },
]

export default function Drawer({ open, onClose, onOpenWalletConnect }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { connected, publicKey } = useWallet()
  const short = publicKey
    ? `${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}`
    : null

  useEffect(() => { onClose() }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const go = (path) => { navigate(path); onClose() }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Slide panel */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 51,
        width: '75%', maxWidth: 300,
        background: '#111118',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.32,0,0.15,1)',
        willChange: 'transform',
      }}>
        {/* Header */}
        <div style={{
          padding: '52px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #9945FF, #14F195)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#fff',
            }}>◎</div>
            <div>
              <p style={{
                fontWeight: 700, fontSize: 15,
                background: 'linear-gradient(90deg, #9945FF, #14F195)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Trivia Pay</p>
              <p style={{ fontSize: 10, color: '#4b5563', marginTop: 1 }}>Solana Devnet</p>
            </div>
          </div>

          {connected && short ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 10,
              background: 'rgba(153,69,255,0.08)',
              border: '1px solid rgba(153,69,255,0.2)',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{short}</span>
            </div>
          ) : (
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'left center' }}>
              <WalletMultiButton />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          {menuItems.map((item) => {
            const active = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 12, marginBottom: 4,
                  background: active ? 'rgba(153,69,255,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(153,69,255,0.25)' : '1px solid transparent',
                  color: active ? '#c084fc' : '#6b7280',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                }}
              >
                <span style={{ fontSize: 15, width: 20, textAlign: 'center', lineHeight: 1 }}>{item.emoji}</span>
                {item.label}
                {active && (
                  <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#9945FF' }} />
                )}
              </button>
            )
          })}

          <div style={{ marginTop: 12 }}>
            <button
              onClick={onOpenWalletConnect}
              style={{
                width: '100%', padding: '12px 14px',
                borderRadius: 12, border: '1px solid rgba(153,69,255,0.35)',
                background: 'linear-gradient(135deg, rgba(153,69,255,0.16), rgba(20,241,149,0.12))',
                color: '#e5e7eb', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              }}
            >
              WalletConnect QR
            </button>
          </div>
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ fontSize: 10, color: '#374151', textAlign: 'center' }}>Solana Devnet · v1.0</p>
        </div>
      </div>
    </>
  )
}
