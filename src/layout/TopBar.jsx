import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function TopBar({ onMenuClick, onOpenWalletConnect }) {
  const { connected, publicKey } = useWallet()
  const short = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : null

  return (
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 56,
        flexShrink: 0,
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10,
      }}>
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{
            width: 40, height: 40,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span style={{ width: 18, height: 2, background: '#e5e7eb', borderRadius: 2, display: 'block' }} />
          <span style={{ width: 14, height: 2, background: '#e5e7eb', borderRadius: 2, display: 'block', marginLeft: -4 }} />
          <span style={{ width: 18, height: 2, background: '#e5e7eb', borderRadius: 2, display: 'block' }} />
        </button>

        {/* Logo */}
        <span style={{
          fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
          background: 'linear-gradient(90deg, #9945FF, #14F195)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          ◎ Trivia Pay
        </span>

        {/* Wallet badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {connected && short ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 999,
              background: 'rgba(153,69,255,0.12)',
              border: '1px solid rgba(153,69,255,0.35)',
              color: '#c084fc', fontSize: 11, fontWeight: 500, fontFamily: 'monospace',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              {short}
            </div>
          ) : (
            <button onClick={onOpenWalletConnect} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#e5e7eb', cursor: 'pointer' }}>Connect</button>
          )}
        </div>
      </header>
  )
}
