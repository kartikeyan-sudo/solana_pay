import React, { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getBalance, getTransactionHistory, parseTransactionDetails, getParsedTransaction } from '../services/solanaService'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { getAddressExplorerUrl } from '../config/solanaConfig'
import { useNavigate } from 'react-router-dom'

function StatCard({ icon, label, value, color, loading }) {
  return (
    <div
      className="card flex flex-col gap-2"
      style={{ padding: '16px' }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="label" style={{ marginBottom: 0 }}>{label}</span>
      {loading
        ? <div className="h-5 w-20 skeleton" />
        : <span className={`text-base font-bold ${color}`}>{value}</span>
      }
    </div>
  )
}

export default function Dashboard() {
  const { publicKey, connected } = useWallet()
  const navigate = useNavigate()
  const [balance, setBalance] = useState(null)
  const [stats, setStats] = useState({ totalSent: 0, totalReceived: 0, txCount: 0 })
  const [loading, setLoading] = useState(false)
  const [billsCreated, setBillsCreated] = useState(0)

  const walletAddr = publicKey?.toString()

  useEffect(() => {
    const bills = JSON.parse(localStorage.getItem('bills') || '[]')
    setBillsCreated(bills.length)
  }, [])

  const loadDashboard = useCallback(async () => {
    if (!walletAddr) return
    setLoading(true)
    try {
      const [bal, signatures] = await Promise.all([
        getBalance(walletAddr),
        getTransactionHistory(walletAddr, 20),
      ])
      setBalance(bal)
      let totalSent = 0, totalReceived = 0
      for (const sig of signatures.slice(0, 10)) {
        const tx = await getParsedTransaction(sig.signature)
        if (!tx) continue
        const details = parseTransactionDetails(tx, walletAddr)
        if (!details) continue
        if (details.type === 'Sent') totalSent += details.amount
        else if (details.type === 'Received') totalReceived += details.amount
      }
      setStats({ totalSent, totalReceived, txCount: signatures.length })
    } catch (err) { console.error(err) }
    setLoading(false)
  }, [walletAddr])

  useEffect(() => { if (connected) loadDashboard() }, [connected, loadDashboard])

  const short = walletAddr
    ? `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`
    : null

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 gap-6">
        {/* Hero */}
        <div className="text-center mb-2">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5"
            style={{
              background: 'linear-gradient(135deg, #9945FF, #14F195)',
              boxShadow: '0 0 40px rgba(153,69,255,0.5)',
            }}
          >
            ◎
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Trivia Pay</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Decentralized UPI-style payments<br />on Solana Devnet
          </p>
        </div>

        <div className="wallet-btn-wrapper">
          <WalletMultiButton />
        </div>

        {/* Feature cards */}
        <div className="w-full grid grid-cols-1 gap-3 mt-2">
          {[
            { icon: '💸', title: 'Send & Receive', desc: 'Transfer SOL instantly' },
            { icon: '🧾', title: 'Bill Splitting', desc: 'Split bills with on-chain Memo' },
            { icon: '🔒', title: 'Escrow', desc: 'Lock funds with Anchor contracts' },
          ].map((f) => (
            <div
              key={f.title}
              className="card flex items-center gap-4"
              style={{ padding: '16px' }}
            >
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="font-semibold text-sm text-white">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Balance Hero Card */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(153,69,255,0.25) 0%, rgba(20,241,149,0.12) 100%)',
          border: '1px solid rgba(153,69,255,0.3)',
          boxShadow: '0 0 32px rgba(153,69,255,0.2)',
        }}
      >
        {/* Glow blobs */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
          style={{ background: '#9945FF', filter: 'blur(30px)' }} />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-15"
          style={{ background: '#14F195', filter: 'blur(25px)' }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="label" style={{ marginBottom: 4 }}>Wallet</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-purple-300">{short}</span>
                <a
                  href={getAddressExplorerUrl(walletAddr)}
                  target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 text-xs"
                >🔗</a>
              </div>
            </div>
            <button
              onClick={loadDashboard}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >🔄</button>
          </div>

          <div>
            <p className="label">Balance</p>
            {loading ? (
              <div className="h-10 w-36 skeleton" />
            ) : (
              <p className="text-4xl font-bold text-white">
                {balance !== null ? balance.toFixed(4) : '—'}
                <span className="text-xl text-purple-300 ml-2">SOL</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="📤" label="Total Sent"   value={`${stats.totalSent.toFixed(4)} SOL`}  color="text-red-400"    loading={loading} />
        <StatCard icon="📥" label="Received"     value={`${stats.totalReceived.toFixed(4)} SOL`} color="text-green-400"  loading={loading} />
        <StatCard icon="🔁" label="Transactions" value={stats.txCount.toString()}               color="text-blue-400"   loading={loading} />
        <StatCard icon="🧾" label="Bills"        value={billsCreated.toString()}                color="text-yellow-400" loading={false} />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-300 mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '💸 Send SOL',   path: '/send' },
            { label: '📥 Receive',    path: '/receive' },
            { label: '📷 Scan & Pay', path: '/scan' },
            { label: '🧾 Bill Split', path: '/split' },
            { label: '📜 History',    path: '/history' },
            { label: '🔒 Escrow',     path: '/escrow' },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="btn-secondary text-sm"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
