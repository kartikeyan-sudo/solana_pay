import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  createEscrow,
  releaseEscrow,
  deriveEscrowPDA,
  fetchEscrowAccount,
} from '../services/escrowService'
import { getExplorerUrl } from '../config/solanaConfig'
import GradientButton from '../components/GradientButton'
import { sendLocalNotification } from '../utils/nativeIntegrations'

export default function EscrowPage() {
  const wallet = useWallet()

  // Create state
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('')
  const [escrowId, setEscrowId] = useState(Date.now().toString().slice(-6))
  const [creating, setCreating] = useState(false)
  const [createResult, setCreateResult] = useState(null)
  const [createError, setCreateError] = useState('')

  // Release state
  const [releasePDA, setReleasePDA] = useState('')
  const [releaseReceiver, setReleaseReceiver] = useState('')
  const [releasing, setReleasing] = useState(false)
  const [releaseResult, setReleaseResult] = useState('')
  const [releaseError, setReleaseError] = useState('')

  // Lookup state
  const [lookupPDA, setLookupPDA] = useState('')
  const [lookupData, setLookupData] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateResult(null)
    if (!wallet.connected) return setCreateError('Connect wallet first')
    if (!receiver.trim()) return setCreateError('Enter receiver address')
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
      return setCreateError('Enter valid amount')

    setCreating(true)
    try {
      const id = parseInt(escrowId, 10) || Date.now()
      const result = await createEscrow(wallet, receiver.trim(), parseFloat(amount), id)
      setCreateResult(result)
      sendLocalNotification({ title: 'Escrow created', body: `${amount} SOL locked for ${receiver.slice(0, 4)}...${receiver.slice(-4)}` })
    } catch (err) {
      setCreateError(err.message || 'Escrow creation failed')
    }
    setCreating(false)
  }

  const handleRelease = async (e) => {
    e.preventDefault()
    setReleaseError('')
    setReleaseResult('')
    if (!wallet.connected) return setReleaseError('Connect wallet first')
    if (!releasePDA.trim()) return setReleaseError('Enter escrow PDA address')
    if (!releaseReceiver.trim()) return setReleaseError('Enter receiver address')

    setReleasing(true)
    try {
      const sig = await releaseEscrow(wallet, releasePDA.trim(), releaseReceiver.trim())
      setReleaseResult(sig)
      sendLocalNotification({ title: 'Escrow released', body: `Released to ${releaseReceiver.slice(0, 4)}...${releaseReceiver.slice(-4)}` })
    } catch (err) {
      setReleaseError(err.message || 'Release failed')
    }
    setReleasing(false)
  }

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!wallet.connected || !lookupPDA.trim()) return
    setLookupLoading(true)
    setLookupData(null)
    try {
      const data = await fetchEscrowAccount(wallet, lookupPDA.trim())
      setLookupData(data)
    } catch (err) {
      setLookupData({ error: err.message })
    }
    setLookupLoading(false)
  }

  const handleDerivePDA = async () => {
    if (!wallet.publicKey || !escrowId) return
    try {
      const { pda } = await deriveEscrowPDA(wallet.publicKey, parseInt(escrowId, 10))
      setReleasePDA(pda.toString())
    } catch {}
  }

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 px-4">
        <div className="text-5xl">🔒</div>
        <p className="text-gray-400 text-center">Connect your wallet to use escrow</p>
        <div className="wallet-btn-wrapper"><WalletMultiButton /></div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-2 pb-6 space-y-4">
      {/* Header */}
      <div className="py-2">
        <h1 className="text-xl font-bold gradient-text">Escrow</h1>
        <p className="text-xs" style={{ color: '#6b7280' }}>Lock SOL in an Anchor smart contract</p>
      </div>

      {/* Demo Warning */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
        <p className="text-xs" style={{ color: '#fbbf24' }}>
          ⚠️ <strong>Demo Mode:</strong> Requires a deployed Anchor escrow program on Devnet.
          Replace the program ID in <code className="px-1 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>src/idl/escrow.json</code>.
        </p>
      </div>

      {/* Accordion sections */}
      {/* ── Create Escrow ── */}
      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <span className="text-xl">🔐</span>
          <h2 className="font-bold">Create Escrow</h2>
        </div>
        <div className="px-4 pb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Escrow ID</label>
              <input type="number" className="input-field" placeholder="Unique numeric ID"
                value={escrowId} onChange={(e) => setEscrowId(e.target.value)} />
            </div>
            <div>
              <label className="label">Receiver Wallet Address</label>
              <textarea rows={2} className="input-field font-mono text-xs resize-none" placeholder="Enter receiver public key..."
                value={receiver} onChange={(e) => setReceiver(e.target.value)} />
            </div>
            <div>
              <label className="label">Lock Amount (SOL)</label>
              <div className="relative">
                <input type="number" step="0.0001" min="0" className="input-field pr-16"
                  placeholder="0.0000" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold" style={{ color: '#9945FF' }}>SOL</span>
              </div>
            </div>
            {createError && (
              <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                ❌ {createError}
              </div>
            )}
            {createResult && (
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.25)' }}>
                <p className="font-semibold" style={{ color: '#14F195' }}>✅ Escrow Created!</p>
                <div>
                  <p className="label text-xs">Escrow PDA</p>
                  <p className="font-mono text-xs break-all" style={{ color: '#d1d5db' }}>{createResult.escrowPDA}</p>
                  <button type="button" className="text-xs mt-1" style={{ color: '#9945FF' }}
                    onClick={() => { setReleasePDA(createResult.escrowPDA); setReleaseReceiver(receiver) }}>
                    → Copy to Release
                  </button>
                </div>
                <a href={getExplorerUrl(createResult.signature)} target="_blank" rel="noopener noreferrer"
                  className="text-sm block" style={{ color: '#a78bfa' }}>🔗 View on Explorer</a>
              </div>
            )}
            <GradientButton type="submit" fullWidth size="lg" loading={creating}>🔐 Create Escrow</GradientButton>
          </form>
        </div>
      </div>

      {/* ── Release Escrow ── */}
      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <span className="text-xl">🔓</span>
          <h2 className="font-bold">Release Escrow</h2>
        </div>
        <div className="px-4 pb-4">
          <form onSubmit={handleRelease} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Escrow PDA Address</label>
                <button type="button" onClick={handleDerivePDA} className="text-xs" style={{ color: '#9945FF' }}>← Derive from ID</button>
              </div>
              <textarea rows={2} className="input-field font-mono text-xs resize-none" placeholder="Enter escrow PDA..."
                value={releasePDA} onChange={(e) => setReleasePDA(e.target.value)} />
            </div>
            <div>
              <label className="label">Receiver Address</label>
              <textarea rows={2} className="input-field font-mono text-xs resize-none" placeholder="Enter receiver public key..."
                value={releaseReceiver} onChange={(e) => setReleaseReceiver(e.target.value)} />
            </div>
            {releaseError && (
              <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                ❌ {releaseError}
              </div>
            )}
            {releaseResult && (
              <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.25)' }}>
                <p className="font-semibold" style={{ color: '#14F195' }}>✅ Escrow Released!</p>
                <a href={getExplorerUrl(releaseResult)} target="_blank" rel="noopener noreferrer"
                  className="text-sm block" style={{ color: '#a78bfa' }}>🔗 View on Explorer</a>
              </div>
            )}
            <GradientButton type="submit" fullWidth size="lg" variant="danger" loading={releasing}>🔓 Release Funds</GradientButton>
          </form>
        </div>
      </div>

      {/* ── Lookup Escrow ── */}
      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <span className="text-xl">🔍</span>
          <h2 className="font-bold">Lookup Escrow</h2>
        </div>
        <div className="px-4 pb-4">
          <form onSubmit={handleLookup} className="space-y-3">
            <div>
              <label className="label">Escrow PDA Address</label>
              <textarea rows={2} className="input-field font-mono text-xs resize-none" placeholder="Enter Escrow PDA..."
                value={lookupPDA} onChange={(e) => setLookupPDA(e.target.value)} />
            </div>
            <GradientButton type="submit" fullWidth variant="ghost" size="lg" loading={lookupLoading}>🔍 Fetch Account</GradientButton>
          </form>
          {lookupData && !lookupData.error && (
            <div className="mt-4 rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-sm font-semibold" style={{ color: '#d1d5db' }}>Escrow Data</p>
              {Object.entries(lookupData).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 text-xs">
                  <span style={{ color: '#9ca3af' }} className="capitalize">{k}</span>
                  <span className="font-mono break-all text-right" style={{ color: '#d1d5db' }}>{v?.toString()}</span>
                </div>
              ))}
            </div>
          )}
          {lookupData?.error && (
            <div className="mt-3 text-sm" style={{ color: '#f87171' }}>❌ {lookupData.error}</div>
          )}
        </div>
      </div>
    </div>
  )
}