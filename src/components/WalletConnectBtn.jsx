import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function WalletConnectBtn() {
  return (
    <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-xl !font-semibold !transition-all" />
  )
}
