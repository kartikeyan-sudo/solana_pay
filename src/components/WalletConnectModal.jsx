import React, { useEffect, useState, useRef } from 'react'
import { QRCodeSVG as QRCode } from 'qrcode.react'

export default function WalletConnectModal({ open, onClose, onSession }) {
  const [uri, setUri] = useState('')
  const clientRef = useRef(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (!open) return
    let mounted = true
    async function init() {
      setConnecting(true)
      try {
        const { default: SignClient } = await import('@walletconnect/sign-client')
        const projectId = import.meta.env.VITE_WC_PROJECT_ID || '20fef953daf8a5c9b15af50bb00447a7'
        const client = await SignClient.init({ projectId })
        clientRef.current = client

        const requiredNamespaces = {
          solana: {
            methods: ['solana_signTransaction', 'solana_signMessage', 'solana_signAllTransactions'],
            chains: ['solana:devnet'],
            events: ['accountsChanged']
          }
        }

        const { uri, approval } = await client.connect({ requiredNamespaces })
        if (uri && mounted) setUri(uri)

        if (approval) {
          const session = await approval()
          onSession && onSession(session)
          // close when approved
          onClose && onClose()
        }
      } catch (err) {
        console.error('WC init err', err)
      } finally {
        setConnecting(false)
      }
    }
    init()
    return () => { mounted = false }
  }, [open])

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        try { clientRef.current?.disconnect(); } catch (e) {}
      }
    }
  }, [])

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 380, maxWidth: '92%', background: '#0b0b10', borderRadius: 12, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, color: '#e5e7eb', fontWeight: 700 }}>Connect with WalletConnect</p>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 12 }}>Scan QR with any WalletConnect-compatible wallet</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 18 }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: '0 0 auto' }}>
            {uri ? (
              <QRCode value={uri} size={220} bgColor="#0b0b10" fgColor="#e5e7eb" />
            ) : (
              <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                {connecting ? 'Initializing…' : 'No URI'}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Open your mobile wallet and scan the QR code. If you're on device, try the wallet's built-in "Scan" or "Connect to DApp" feature.</p>
            <div style={{ marginTop: 12 }}>
              <button onClick={onClose} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#e5e7eb', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
