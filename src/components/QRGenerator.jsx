import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRGenerator({ walletAddress, amount }) {
  const [copied, setCopied] = useState(false)

  const solanaPayUrl = amount
    ? `solana:${walletAddress}?amount=${amount}`
    : `solana:${walletAddress}`

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 border border-dashed border-gray-700 rounded-xl">
        <p className="text-gray-500 text-sm">Connect your wallet to generate QR code</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div className="p-4 bg-white rounded-2xl shadow-lg">
        <QRCodeSVG
          value={solanaPayUrl}
          size={220}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={false}
          imageSettings={{
            src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzOSA0NCI+PHBhdGggZD0iTTE5LjUgMEMxMS43IDAgNSA2LjcgNSAxNC41UzExLjcgMjkgMTkuNSAyOU0xOS41IDQ0QzI3LjMgNDQgMzQgMzcuMyAzNCAyOS41UzI3LjMgMTUgMTkuNSAxNSIgZmlsbD0iIzk5NDVGRiIvPjwvc3ZnPg==',
            height: 30,
            width: 30,
            excavate: true,
          }}
        />
      </div>

      {/* Solana Pay URL */}
      <div className="w-full">
        <p className="label text-center">Solana Pay URL</p>
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-gray-400 truncate flex-1 font-mono">{solanaPayUrl}</p>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="w-full">
        <p className="label text-center">Wallet Address</p>
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-xs text-purple-400 truncate flex-1 font-mono">{walletAddress}</p>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0 text-sm"
          >
            {copied ? '✅' : '📋'}
          </button>
        </div>
        {copied && (
          <p className="text-green-400 text-xs text-center mt-1">Copied to clipboard!</p>
        )}
      </div>

      {amount && (
        <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg px-4 py-2">
          <p className="text-purple-300 text-sm text-center">
            Amount: <span className="font-bold">{amount} SOL</span>
          </p>
        </div>
      )}
    </div>
  )
}
