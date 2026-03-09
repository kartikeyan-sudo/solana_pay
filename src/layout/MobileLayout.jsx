import React, { useState, createContext, useContext } from 'react'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import Drawer from './Drawer'
import WalletConnectModal from '../components/WalletConnectModal'

export const DrawerContext = createContext(null)
export const useDrawer = () => useContext(DrawerContext)

export default function MobileLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [wcOpen, setWcOpen] = useState(false)

  return (
    <DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100%',
        maxWidth: 480,
        margin: '0 auto',
        background: '#0a0a0f',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Drawer overlay */}
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onOpenWalletConnect={() => setWcOpen(true)} />

        {/* Top bar */}
        <TopBar onMenuClick={() => setDrawerOpen(true)} onOpenWalletConnect={() => setWcOpen(true)} />

        {/* Scrollable content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '140px',
        }}>
          {children}
        </main>

        {/* Bottom nav */}
        <BottomNav />

        {/* WalletConnect QR modal (works on web; on device opens for manual scan) */}
        <WalletConnectModal open={wcOpen} onClose={() => setWcOpen(false)} />
      </div>
    </DrawerContext.Provider>
  )
}
