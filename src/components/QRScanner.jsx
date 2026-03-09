import React, { useEffect, useRef, useState } from 'react'

export default function QRScanner({ onResult }) {
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  const startScanner = async () => {
    setError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      html5QrCodeRef.current = new Html5Qrcode('qr-scanner-region')
      setScanning(true)

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanResult(decodedText)
        },
        () => {} // ignored error per-frame
      )
    } catch (err) {
      setError('Camera access denied or not available. ' + err?.message)
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch {}
    }
    setScanning(false)
  }

  const handleScanResult = (text) => {
    stopScanner()
    // Parse solana: URI or plain address
    let address = text.trim()
    if (address.startsWith('solana:')) {
      const [, rest] = address.split('solana:')
      const [addr] = rest.split('?')
      address = addr
    }
    onResult(address)
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scanner region */}
      <div
        id="qr-scanner-region"
        ref={scannerRef}
        className={`w-full max-w-xs rounded-xl overflow-hidden border-2 ${
          scanning ? 'border-purple-500' : 'border-gray-700'
        } bg-gray-800 min-h-[200px] flex items-center justify-center`}
      >
        {!scanning && (
          <p className="text-gray-500 text-sm p-4 text-center">
            Camera preview will appear here
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700/60 rounded-lg p-3 text-red-400 text-sm w-full">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {!scanning ? (
          <button onClick={startScanner} className="btn-primary flex items-center gap-2">
            <span>📷</span> Start Scanner
          </button>
        ) : (
          <button onClick={stopScanner} className="btn-danger flex items-center gap-2">
            <span>⏹</span> Stop Scanner
          </button>
        )}
      </div>

      {scanning && (
        <p className="text-purple-400 text-sm animate-pulse">Scanning for QR code…</p>
      )}
    </div>
  )
}
