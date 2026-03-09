import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import QRScanner from '../components/QRScanner'
import { sendSOL } from '../services/solanaService'
import { getExplorerUrl } from '../config/solanaConfig'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import GradientButton from '../components/GradientButton'
import { ensureCameraPermission, sendLocalNotification } from '../utils/nativeIntegrations'

export default function ScanPay() {
  const wallet = useWallet()
  const [scannedAddress, setScannedAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [txSig, setTxSig] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('scan')

  const handleScanResult = (address) => {
    setScannedAddress(address)
    setMode('manual')
    setError('')
  }

  const handlePay = async (e) => {
    e.preventDefault()
    setError('')
    setTxSig('')
    if (!wallet.connected) return setError('Wallet not connected')
    if (!scannedAddress) return setError('No address provided')
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
      return setError('Enter a valid SOL amount')
    setLoading(true)
    try {
      const sig = await sendSOL(wallet, scannedAddress, parseFloat(amount))
      setTxSig(sig)
      sendLocalNotification({ title: 'Payment sent', body: `${amount} SOL → ${scannedAddress.slice(0, 4)}...${scannedAddress.slice(-4)}` })
      setScannedAddress('')
      setAmount('')
      setMode('scan')
    } catch (err) {
      setError(err.message || 'Transaction failed')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (mode === 'scan') {
      ensureCameraPermission()
    }
  }, [mode])

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'rgba(153,69,255,0.15)', border: '1px solid rgba(153,69,255,0.3)' }}
        >
          📷
        </div>
        <p className="text-gray-400 text-center">Connect your wallet to scan & pay</p>
        <div className="wallet-btn-wrapper"><WalletMultiButton /></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(153,69,255,0.2), rgba(20,241,149,0.1))' }}
        >
          <span className="text-xl">📷</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Scan & Pay</h1>
          <p className="text-xs text-gray-500">Scan a Solana QR code to pay</p>
        </div>
      </div>

      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {[
          { id: 'scan', label: '📷 Scanner' },
          { id: 'manual', label: '✏️ Manual' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-all active:scale-95"
            style={{
              background: mode === m.id ? 'linear-gradient(135deg, #9945FF, #14F195)' : 'transparent',
              color: mode === m.id ? '#fff' : '#9ca3af',
              boxShadow: mode === m.id ? '0 2px 12px rgba(153,69,255,0.3)' : 'none',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'scan' ? (
        <div className="card" style={{ padding: '16px' }}>
          <QRScanner onResult={handleScanResult} />
          <p className="text-xs text-gray-600 text-center mt-3">Point camera at a Solana QR code</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '18px' }}>
          <label className="label">Receiver Address</label>
          <textarea
            className="input-field font-mono text-sm resize-none"
            placeholder="Paste wallet address..."
            rows={2}
            value={scannedAddress}
            onChange={(e) => setScannedAddress(e.target.value)}
            style={{ minHeight: '64px' }}
          />
        </div>
      )}

      {scannedAddress && (
        <form onSubmit={handlePay} className="space-y-4">
          <div className="card" style={{ padding: '18px' }}>
            <label className="label">Amount</label>
            <div className="relative">
              <input
                type="number" step="0.0001" min="0"
                className="input-field"
                placeholder="0.0000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ paddingRight: '60px' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: '#9945FF' }}>SOL</span>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}
          {txSig && (
            <div className="rounded-2xl p-4 space-y-2"
              style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.25)' }}>
              <p className="text-green-400 font-semibold">✅ Payment Sent!</p>
              <a href={getExplorerUrl(txSig)} target="_blank" rel="noopener noreferrer"
                className="text-sm" style={{ color: '#a78bfa' }}>🔗 View on Explorer</a>
            </div>
          )}
          <GradientButton type="submit" fullWidth size="lg" loading={loading}>💸 Pay Now</GradientButton>
        </form>
      )}
    </div>
  )
}


