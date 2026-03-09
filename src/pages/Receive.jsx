import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import QRGenerator from '../components/QRGenerator'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Receive() {
  const { publicKey, connected } = useWallet()
  const [requestAmount, setRequestAmount] = useState('')
  const [copied, setCopied] = useState(false)

  const walletAddr = publicKey?.toString() ?? ''

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'rgba(153,69,255,0.15)', border: '1px solid rgba(153,69,255,0.3)' }}
        >
          📥
        </div>
        <p className="text-gray-400 text-center">Connect your wallet to receive SOL</p>
        <div className="wallet-btn-wrapper"><WalletMultiButton /></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(153,69,255,0.2), rgba(20,241,149,0.1))' }}
        >
          <span className="text-xl">📥</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Receive SOL</h1>
          <p className="text-xs text-gray-500">Share your QR code to receive payments</p>
        </div>
      </div>

      {/* QR Card */}
      <div
        className="card flex flex-col items-center gap-5"
        style={{ padding: '24px' }}
      >
        <QRGenerator
          walletAddress={walletAddr}
          amount={requestAmount ? parseFloat(requestAmount) : undefined}
        />

        {/* Address */}
        <div className="w-full">
          <p className="label text-center mb-2">Your Wallet Address</p>
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="font-mono text-xs text-gray-300 flex-1 break-all leading-relaxed">{walletAddr}</span>
            <button
              onClick={copyAddress}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all"
              style={{
                background: copied
                  ? 'rgba(20,241,149,0.15)'
                  : 'rgba(153,69,255,0.15)',
                border: `1px solid ${copied ? 'rgba(20,241,149,0.3)' : 'rgba(153,69,255,0.3)'}`,
                color: copied ? '#14F195' : '#a78bfa',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Request Amount */}
      <div className="card" style={{ padding: '18px' }}>
        <label className="label">Request Amount (optional)</label>
        <div className="relative">
          <input
            type="number"
            step="0.0001"
            min="0"
            className="input-field"
            placeholder="0.0000"
            value={requestAmount}
            onChange={(e) => setRequestAmount(e.target.value)}
            style={{ paddingRight: '60px' }}
          />
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
            style={{ color: '#9945FF' }}
          >
            SOL
          </span>
        </div>
        {requestAmount && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            QR code updated with {requestAmount} SOL request
          </p>
        )}
      </div>

      {/* Hint */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: 'rgba(153,69,255,0.07)', border: '1px solid rgba(153,69,255,0.15)' }}
      >
        <p className="text-purple-300 text-sm">
          💡 Share this QR to receive SOL on Devnet
        </p>
      </div>
    </div>
  )
}

