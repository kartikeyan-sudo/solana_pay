import React, { useState, useEffect, useCallback, memo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  getTransactionHistory,
  getParsedTransaction,
  parseTransactionDetails,
} from '../services/solanaService'
import { getExplorerUrl } from '../config/solanaConfig'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const TxCard = memo(function TxCard({ tx }) {
  const isSent = tx.type === 'Sent'
  const isReceived = tx.type === 'Received'
  return (
    <div
      className="card"
      style={{
        padding: '16px',
        background: isSent
          ? 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(26,27,35,1))'
          : isReceived
          ? 'linear-gradient(135deg, rgba(20,241,149,0.08), rgba(26,27,35,1))'
          : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
            style={{
              background: isSent
                ? 'rgba(239,68,68,0.15)'
                : isReceived
                ? 'rgba(20,241,149,0.15)'
                : 'rgba(255,255,255,0.06)',
            }}
          >
            {isSent ? '📤' : isReceived ? '📥' : '⚙️'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="font-semibold text-sm"
                style={{ color: isSent ? '#f87171' : isReceived ? '#34d399' : '#9ca3af' }}
              >
                {tx.type}
              </span>
              {tx.err && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                >
                  Failed
                </span>
              )}
            </div>
            {tx.counterparty && (
              <p className="text-xs font-mono truncate" style={{ color: '#6b7280' }}>
                {isSent ? 'To: ' : 'From: '}{tx.counterparty.slice(0, 16)}...
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
              {tx.date ? tx.date.toLocaleDateString() : 'Unknown'}
            </p>
            <a
              href={getExplorerUrl(tx.signature)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs mt-1 inline-block"
              style={{ color: '#7c3aed' }}
            >
              🔗 {tx.signature.slice(0, 12)}...
            </a>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p
            className="text-base font-bold"
            style={{ color: isSent ? '#f87171' : '#34d399' }}
          >
            {isSent ? '-' : '+'}{tx.amount.toFixed(4)}
          </p>
          <p className="text-xs" style={{ color: '#6b7280' }}>SOL</p>
        </div>
      </div>
    </div>
  )
})

export default function Transactions() {
  const { publicKey, connected } = useWallet()
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const walletAddr = publicKey?.toString()

  const loadHistory = useCallback(async () => {
    if (!walletAddr) return
    setLoading(true)
    setError('')
    try {
      const signatures = await getTransactionHistory(walletAddr, 25)
      const parsed = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await getParsedTransaction(sig.signature)
          if (!tx) return null
          return parseTransactionDetails(tx, walletAddr)
        })
      )
      setTxs(parsed.filter(Boolean))
    } catch (err) {
      setError(err.message || 'Failed to load history')
    }
    setLoading(false)
  }, [walletAddr])

  useEffect(() => {
    if (connected && walletAddr) loadHistory()
  }, [connected, walletAddr, loadHistory])

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'rgba(153,69,255,0.15)', border: '1px solid rgba(153,69,255,0.3)' }}
        >
          📜
        </div>
        <p className="text-gray-400 text-center">Connect your wallet to view history</p>
        <div className="wallet-btn-wrapper"><WalletMultiButton /></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(153,69,255,0.2), rgba(20,241,149,0.1))' }}
          >
            <span className="text-xl">📜</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">History</h1>
            <p className="text-xs text-gray-500">On-chain activity</p>
          </div>
        </div>
        <button
          onClick={loadHistory}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
        >
          🔄
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
        >
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ padding: '16px' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 skeleton" />
                  <div className="h-3 w-3/4 skeleton" />
                </div>
                <div className="h-5 w-16 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : txs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-5xl opacity-40">📭</div>
          <p className="text-gray-500 text-sm">No transactions on Devnet yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {txs.map((tx) => (
            <TxCard key={tx.signature} tx={tx} />
          ))}
        </div>
      )}
    </div>
  )
}
