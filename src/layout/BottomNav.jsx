import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/',        label: 'Home',    symbol: '⌂' },
  { path: '/send',    label: 'Send',    symbol: '↗' },
  { path: '/receive', label: 'Receive', symbol: '↙' },
  { path: '/split',   label: 'Bills',   symbol: '⊟' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav style={{
      display: 'flex',
      background: 'rgba(10,10,15,0.97)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 18px)',
      paddingTop: 6,
      flexShrink: 0,
      position: 'sticky',
      bottom: 0,
      zIndex: 20,
    }}>
      {tabs.map((tab) => {
        const active = pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1, position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3,
              padding: '10px 0 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            <span style={{
              fontSize: 18,
              color: active ? '#a78bfa' : '#4b5563',
              transition: 'color 0.15s',
            }}>{tab.symbol}</span>
            <span style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '0.03em',
              color: active ? '#a78bfa' : '#4b5563',
              transition: 'color 0.15s',
            }}>{tab.label}</span>
            {active && (
              <span style={{
                position: 'absolute',
                top: 0,
                width: 24, height: 2, borderRadius: 1,
                background: 'linear-gradient(90deg, #9945FF, #14F195)',
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
