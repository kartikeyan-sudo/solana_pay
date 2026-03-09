import { clusterApiUrl, Connection } from '@solana/web3.js'

export const NETWORK = 'devnet'
export const ENDPOINT = clusterApiUrl('devnet')
export const connection = new Connection(ENDPOINT, 'confirmed')

export const SOLANA_EXPLORER_BASE = 'https://explorer.solana.com'
export const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'

export const getExplorerUrl = (signature) =>
  `${SOLANA_EXPLORER_BASE}/tx/${signature}?cluster=${NETWORK}`

export const getAddressExplorerUrl = (address) =>
  `${SOLANA_EXPLORER_BASE}/address/${address}?cluster=${NETWORK}`
