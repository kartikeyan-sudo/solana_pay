import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { sendSOL } from '../services/solanaService'
import { getExplorerUrl } from '../config/solanaConfig'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import GradientButton from '../components/GradientButton'
import { sendLocalNotification } from '../utils/nativeIntegrations'

export default function Send() {
  const wallet = useWallet()
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [txResult, setTxResult] = useState(null)
  const [error, setError] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    setTxResult(null)
    if (!wallet.connected) return setError('Wallet not connected')
    if (!receiver.trim()) return setError('Enter a receiver address')
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
      return setError('Enter a valid SOL amount')
    setLoading(true)
    try {
      const sig = await sendSOL(wallet, receiver.trim(), parseFloat(amount))
      setTxResult(sig)
      setReceiver('')
      setAmount('')
      sendLocalNotification({ title: 'SOL sent', body: `${amount} SOL → ${receiver.slice(0, 4)}...${receiver.slice(-4)}` })
    } catch (err) {
      setError(err.message || 'Transaction failed')
    }
    setLoading(false)
  }

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'rgba(153,69,255,0.15)', border: '1px solid rgba(153,69,255,0.3)' }}
        >
          💸
        </div>
        <p className="text-gray-400 text-center">Connect your wallet to send SOL</p>
        <div className="wallet-btn-wrapper"><WalletMultiButton /></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(153,69,255,0.2), rgba(20,241,149,0.1))' }}
        >
          <span className="text-xl">💸</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Send SOL</h1>
          <p className="text-xs text-gray-500">Transfer SOL to any Solana wallet</p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        {/* Receiver */}
        <div className="card" style={{ padding: '18px' }}>
          <label className="label">Receiver Address</label>
          <textarea
            className="input-field font-mono text-sm resize-none"
            placeholder="Enter Solana wallet address..."
            rows={2}
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            style={{ minHeight: '64px' }}
          />
        </div>

        {/* Amount */}
        <div className="card" style={{ padding: '18px' }}>
          <label className="label">Amount</label>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0"
              className="input-field"
              placeholder="0.0000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ paddingRight: '60px' }}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
              style={{ color: '#9945FF' }}
            >
              SOL
            </span>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {['0.01', '0.05', '0.1', '0.5'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className="py-2.5 text-sm font-medium rounded-xl active:scale-95 transition-transform"
                style={{
                  background: amount === v ? 'rgba(153,69,255,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${amount === v ? 'rgba(153,69,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: amount === v ? '#a78bfa' : '#9ca3af',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-2xl text-sm"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
          >
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Success */}
        {txResult && (
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.25)' }}
          >
            <p className="text-green-400 font-semibold flex items-center gap-2">✅ Transaction Sent!</p>
            <div>
              <p className="label">Signature</p>
              <p className="font-mono text-xs break-all" style={{ color: '#6ee7b7' }}>{txResult}</p>
            </div>
            <a
              href={getExplorerUrl(txResult)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium"
              style={{ color: '#a78bfa' }}
            >
              🔗 View on Explorer
            </a>
          </div>
        )}

        {/* Submit - sticky bottom feel */}
        <div className="pt-2">
          <GradientButton
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            disabled={loading}
          >
            💸 Send SOL
          </GradientButton>
        </div>
      </form>
    </div>
  )
}
