import React, { useMemo, useState, lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile'
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect'
import { Capacitor } from '@capacitor/core'
import { IonApp, setupIonicReact } from '@ionic/react'
import '@solana/wallet-adapter-react-ui/styles.css'

import { ENDPOINT } from './config/solanaConfig'
import MobileLayout from './layout/MobileLayout'

setupIonicReact({ mode: 'ios' })

// Lazy load pages for performance
const Dashboard  = lazy(() => import('./pages/Dashboard'))
const Send       = lazy(() => import('./pages/Send'))
const Receive    = lazy(() => import('./pages/Receive'))
const ScanPay    = lazy(() => import('./pages/ScanPay'))
const BillSplit  = lazy(() => import('./pages/BillSplit'))
const EscrowPage = lazy(() => import('./pages/Escrow'))
const Transactions = lazy(() => import('./pages/Transactions'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div
        className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(153,69,255,0.3)', borderTopColor: '#9945FF' }}
      />
    </div>
  )
}

function WalletPicker({ open, selected, onSelect, onClose }) {
  if (!open) return null
  const choices = [
    { key: 'solflare', label: 'Solflare', desc: 'Deep link to Solflare app', accent: '#ff8c00' },
    { key: 'walletconnect', label: 'WalletConnect', desc: 'Pick any WC-enabled wallet', accent: '#3b82f6' },
    { key: 'phantom', label: 'Phantom', desc: 'Fallback to Phantom deep link', accent: '#9b87ff' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)',
          width: '92%', maxWidth: 420,
          background: '#0e0e14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
          boxShadow: '0 16px 50px rgba(0,0,0,0.5)', padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <p style={{ color: '#e5e7eb', fontWeight: 700, fontSize: 15 }}>Choose wallet</p>
            <p style={{ color: '#6b7280', fontSize: 12 }}>Applies only on this device</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {choices.map((c) => {
            const active = selected === c.key
            return (
              <button
                key={c.key}
                onClick={() => onSelect(c.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 12px', borderRadius: 12,
                  background: active ? 'rgba(153,69,255,0.12)' : 'rgba(255,255,255,0.03)',
                  border: active ? '1px solid rgba(153,69,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  color: '#e5e7eb', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.accent, display: 'inline-block' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{c.label}</p>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>{c.desc}</p>
                </div>
                {active && <span style={{ fontSize: 12, color: '#c084fc' }}>Selected</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <Suspense fallback={<PageLoader />}>
      <div key={location.pathname} className="page-enter">
        <Routes location={location}>
          <Route path="/"       element={<Dashboard />} />
          <Route path="/send"   element={<Send />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/scan"   element={<ScanPay />} />
          <Route path="/split" element={<BillSplit />} />
          <Route path="/escrow" element={<EscrowPage />} />
          <Route path="/history" element={<Transactions />} />
        </Routes>
      </div>
    </Suspense>
  )
}

export default function App() {
  const wcProjectId = import.meta.env.VITE_WC_PROJECT_ID || '20fef953daf8a5c9b15af50bb00447a7'
  const isNative = typeof window !== 'undefined' && Capacitor?.isNativePlatform?.()
  const [selectedMobileWallet, setSelectedMobileWallet] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(isNative)

  // Re-open picker if native and no selection
  const shouldShowPicker = isNative && (!selectedMobileWallet || pickerOpen)

  const autoConnect = !isNative

  const wallets = useMemo(() => {
    if (isNative) {
      if (!selectedMobileWallet) return [new PhantomWalletAdapter()]
      try {
        const solflare = new SolflareWalletAdapter({ network: 'devnet', provider: 'https://solflare.com/provider' })
        const wc = new WalletConnectWalletAdapter({
          network: 'devnet',
          options: { relayUrl: 'wss://relay.walletconnect.com', projectId: wcProjectId },
          metadata: {
            name: 'Trivia Pay',
            description: 'Solana pay mobile',
            url: 'https://triviapay.app',
            icons: [],
          },
        })
        const phantom = new PhantomWalletAdapter()
        const solanaMobile = new SolanaMobileWalletAdapter({ appIdentity: { name: 'Trivia Pay' } })

        if (selectedMobileWallet === 'solflare') return [solflare, wc, phantom]
        if (selectedMobileWallet === 'walletconnect') return [wc, solflare, phantom]
        if (selectedMobileWallet === 'phantom') return [phantom, solanaMobile, wc]
        return [solflare, wc, phantom]
      } catch (err) {
        console.warn('Falling back to Phantom: mobile adapter init failed', err)
        return [new PhantomWalletAdapter()]
      }
    }
    return [
      new SolflareWalletAdapter({ network: 'devnet' }),
      new PhantomWalletAdapter(),
    ]
  }, [isNative, wcProjectId, selectedMobileWallet])

  return (
    <IonApp>
      {shouldShowPicker && (
        <WalletPicker
          open={shouldShowPicker}
          selected={selectedMobileWallet}
          onSelect={(key) => { setSelectedMobileWallet(key); setPickerOpen(false) }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {isNative && selectedMobileWallet && (
        <button
          onClick={() => setPickerOpen(true)}
          style={{
            position: 'fixed', right: 14, bottom: 92, zIndex: 65,
            padding: '10px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e5e7eb', fontSize: 12, cursor: 'pointer',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
          }}
        >
          Switch wallet
        </button>
      )}

      <ConnectionProvider endpoint={ENDPOINT}>
        <WalletProvider wallets={wallets} autoConnect={autoConnect}>
          <WalletModalProvider>
            {isNative ? (
              <HashRouter>
                <MobileLayout>
                  <AnimatedRoutes />
                </MobileLayout>
              </HashRouter>
            ) : (
              <BrowserRouter>
                <MobileLayout>
                  <AnimatedRoutes />
                </MobileLayout>
              </BrowserRouter>
            )}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </IonApp>
  )
}
