import React, { useState, useEffect, memo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { sendSOLWithMemo } from '../services/solanaService'
import { getExplorerUrl } from '../config/solanaConfig'
import GradientButton from '../components/GradientButton'
import { sendLocalNotification } from '../utils/nativeIntegrations'

const STORAGE_KEY = 'bills'

export default function BillSplit() {
  const wallet = useWallet()
  const [bills, setBills] = useState([])
  const [showCreate, setShowCreate] = useState(false)

  // Create form state
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [participants, setParticipants] = useState([''])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Pay state
  const [payingBillId, setPayingBillId] = useState(null)
  const [payError, setPayError] = useState({})
  const [paySigs, setPaySigs] = useState({})

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setBills(stored)
  }, [])

  const saveBills = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setBills(updated)
  }

  const addParticipant = () => setParticipants([...participants, ''])
  const removeParticipant = (i) => setParticipants(participants.filter((_, idx) => idx !== i))
  const updateParticipant = (i, val) => {
    const updated = [...participants]
    updated[i] = val
    setParticipants(updated)
  }

  const handleCreate = (e) => {
    e.preventDefault()
    setCreateError('')
    const validParticipants = participants.filter((p) => p.trim())
    if (!description.trim()) return setCreateError('Enter a description')
    if (!totalAmount || isNaN(totalAmount) || parseFloat(totalAmount) <= 0)
      return setCreateError('Enter a valid total amount')
    if (validParticipants.length === 0) return setCreateError('Add at least one participant')

    const share = parseFloat(totalAmount) / validParticipants.length
    const newBill = {
      id: Date.now().toString(),
      description: description.trim(),
      total: parseFloat(totalAmount),
      share: parseFloat(share.toFixed(6)),
      participants: validParticipants,
      paidBy: [],
      createdAt: new Date().toISOString(),
    }
    saveBills([...bills, newBill])
    setShowCreate(false)
    setDescription('')
    setTotalAmount('')
    setParticipants([''])
  }

  const handlePayShare = async (bill, participantAddress) => {
    if (!wallet.connected) return
    const key = `${bill.id}-${participantAddress}`
    setPayError((p) => ({ ...p, [key]: '' }))

    setPayingBillId(key)
    try {
      const memo = `BillSplit:${bill.description}`
      const sig = await sendSOLWithMemo(wallet, participantAddress, bill.share, memo)
      setPaySigs((p) => ({ ...p, [key]: sig }))
      sendLocalNotification({ title: 'Bill share paid', body: `${bill.share} SOL → ${participantAddress.slice(0, 4)}...${participantAddress.slice(-4)}` })

      // Mark as paid
      const updated = bills.map((b) =>
        b.id === bill.id ? { ...b, paidBy: [...b.paidBy, participantAddress] } : b
      )
      saveBills(updated)
    } catch (err) {
      setPayError((p) => ({ ...p, [key]: err.message || 'Payment failed' }))
    }
    setPayingBillId(null)
  }

  const deleteBill = (id) => {
    saveBills(bills.filter((b) => b.id !== id))
  }

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 px-4">
        <div className="text-5xl">🧾</div>
        <p className="text-gray-400 text-center">Connect your wallet to manage bill splits</p>
        <div className="wallet-btn-wrapper"><WalletMultiButton /></div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-2 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-xl font-bold gradient-text">Bill Split</h1>
          <p className="text-xs" style={{ color: '#6b7280' }}>Split expenses on-chain</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xl font-bold"
          style={{ background: 'linear-gradient(135deg,#9945FF,#14F195)', boxShadow: '0 0 16px rgba(153,69,255,0.5)' }}
        >+</button>
      </div>

      {/* Create Bill Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="w-full rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto"
            style={{ background: '#1a1b23', border: '1px solid rgba(153,69,255,0.2)' }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#333' }} />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Create New Bill</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white text-2xl leading-none">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Description</label>
                <input type="text" className="input-field" placeholder="e.g. Dinner at Restaurant"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="label">Total Amount (SOL)</label>
                <div className="relative">
                  <input type="number" step="0.0001" min="0" className="input-field pr-16"
                    placeholder="0.0000" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold" style={{ color: '#9945FF' }}>SOL</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Participants</label>
                  <button type="button" onClick={addParticipant}
                    className="text-sm font-medium" style={{ color: '#9945FF' }}>+ Add</button>
                </div>
                <div className="space-y-2">
                  {participants.map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" className="input-field font-mono text-xs flex-1"
                        placeholder={`Wallet address ${i + 1}`} value={p}
                        onChange={(e) => updateParticipant(i, e.target.value)} />
                      {participants.length > 1 && (
                        <button type="button" onClick={() => removeParticipant(i)}
                          className="text-red-400 px-2 text-lg">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {totalAmount && participants.filter(Boolean).length > 0 && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(153,69,255,0.1)', border: '1px solid rgba(153,69,255,0.3)' }}>
                  <p className="text-sm" style={{ color: '#c4b5fd' }}>
                    Each pays: <strong>{(parseFloat(totalAmount) / participants.filter(Boolean).length).toFixed(6)} SOL</strong>
                  </p>
                </div>
              )}
              {createError && (
                <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  ❌ {createError}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <GradientButton type="button" variant="ghost" fullWidth onClick={() => setShowCreate(false)}>Cancel</GradientButton>
                <GradientButton type="submit" fullWidth>Create Bill</GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🧾</p>
          <p className="text-gray-500 text-sm">No bills yet.<br />Tap + to split an expense.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.id} className="card-glass rounded-2xl p-4">
              {/* Bill header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-bold text-base truncate">{bill.description}</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    {new Date(bill.createdAt).toLocaleDateString()} · {bill.participants.length} participants
                  </p>
                </div>
                <button onClick={() => deleteBill(bill.id)} className="text-gray-600 hover:text-red-400 text-lg flex-shrink-0">🗑</button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Total', value: `${bill.total} SOL`, color: '#e5e7eb' },
                  { label: 'Per Person', value: `${bill.share} SOL`, color: '#c4b5fd' },
                  { label: 'Paid', value: `${bill.paidBy.length}/${bill.participants.length}`, color: '#4ade80' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="text-xs mb-1" style={{ color: '#6b7280' }}>{label}</p>
                    <p className="text-xs font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Participants */}
              <div className="space-y-2">
                {bill.participants.map((addr) => {
                  const key = `${bill.id}-${addr}`
                  const isPaid = bill.paidBy.includes(addr)
                  const isMyWallet = addr === wallet.publicKey?.toString()
                  return (
                    <div key={addr} className="flex items-center gap-3 rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs truncate" style={{ color: '#9ca3af' }}>{addr}</p>
                        {isMyWallet && <span className="text-xs" style={{ color: '#9945FF' }}>← Your wallet</span>}
                      </div>
                      {isPaid ? (
                        <span className="text-xs font-semibold rounded-full px-3 py-1 flex-shrink-0"
                          style={{ background: 'rgba(20,241,149,0.12)', color: '#14F195', border: '1px solid rgba(20,241,149,0.3)' }}>
                          ✓ Paid
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <GradientButton size="sm" loading={payingBillId === key}
                            onClick={() => handlePayShare(bill, addr)}>
                            💸 {bill.share} SOL
                          </GradientButton>
                          {payError[key] && <p className="text-xs text-red-400">{payError[key]}</p>}
                          {paySigs[key] && (
                            <a href={getExplorerUrl(paySigs[key])} target="_blank" rel="noopener noreferrer"
                              className="text-xs" style={{ color: '#9945FF' }}>🔗 Tx</a>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Memo tag */}
              <div className="mt-3 rounded-lg px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-xs font-mono" style={{ color: '#4b5563' }}>memo: BillSplit:{bill.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}