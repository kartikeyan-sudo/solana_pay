import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const navLinks = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/send', label: 'Send', icon: '💸' },
  { to: '/receive', label: 'Receive', icon: '📥' },
  { to: '/scan', label: 'Scan & Pay', icon: '📷' },
  { to: '/split', label: 'Bill Split', icon: '🧾' },
  { to: '/escrow', label: 'Escrow', icon: '🔒' },
  { to: '/history', label: 'History', icon: '📜' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl">◎</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Trivia Pay
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Wallet */}
          <div className="flex items-center">
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !text-sm !py-2 !font-medium" />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden pb-3 flex flex-wrap gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                pathname === link.to
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
