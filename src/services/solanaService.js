import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { connection, MEMO_PROGRAM_ID } from '../config/solanaConfig'

/**
 * Get SOL balance for a public key
 */
export const getBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey))
    return balance / LAMPORTS_PER_SOL
  } catch (err) {
    console.error('getBalance error:', err)
    return 0
  }
}

/**
 * Send SOL from sender to receiver
 */
export const sendSOL = async (wallet, receiverAddress, amountSOL) => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected')
  }

  const receiver = new PublicKey(receiverAddress)
  const lamports = Math.round(amountSOL * LAMPORTS_PER_SOL)

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: wallet.publicKey,
  }).add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: receiver,
      lamports,
    })
  )

  const signed = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
  return signature
}

/**
 * Send SOL with a memo instruction (for bill split payments)
 */
export const sendSOLWithMemo = async (wallet, receiverAddress, amountSOL, memo) => {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected')
  }

  const receiver = new PublicKey(receiverAddress)
  const lamports = Math.round(amountSOL * LAMPORTS_PER_SOL)
  const memoPublicKey = new PublicKey(MEMO_PROGRAM_ID)

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: false }],
    programId: memoPublicKey,
    data: Buffer.from(memo, 'utf-8'),
  })

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: wallet.publicKey,
  }).add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: receiver,
      lamports,
    }),
    memoInstruction
  )

  const signed = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
  return signature
}

/**
 * Fetch recent transaction signatures for an address
 */
export const getTransactionHistory = async (publicKey, limit = 20) => {
  try {
    const signatures = await connection.getSignaturesForAddress(new PublicKey(publicKey), {
      limit,
    })
    return signatures
  } catch (err) {
    console.error('getTransactionHistory error:', err)
    return []
  }
}

/**
 * Fetch and parse a single transaction
 */
export const getParsedTransaction = async (signature) => {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    })
    return tx
  } catch (err) {
    console.error('getParsedTransaction error:', err)
    return null
  }
}

/**
 * Parse transaction details for display
 */
export const parseTransactionDetails = (tx, myAddress) => {
  if (!tx || !tx.meta) return null

  const accountKeys = tx.transaction.message.accountKeys
  const preBalances = tx.meta.preBalances
  const postBalances = tx.meta.postBalances
  const blockTime = tx.blockTime
  const signature = tx.transaction.signatures[0]

  let amount = 0
  let type = 'Unknown'
  let counterparty = ''

  const myIndex = accountKeys.findIndex(
    (k) => (k.pubkey ? k.pubkey.toString() : k.toString()) === myAddress
  )

  if (myIndex !== -1) {
    const diff = (postBalances[myIndex] - preBalances[myIndex]) / LAMPORTS_PER_SOL
    amount = Math.abs(diff)
    type = diff < 0 ? 'Sent' : 'Received'

    if (type === 'Sent' && accountKeys.length > 1) {
      counterparty = accountKeys[1]?.pubkey?.toString() || accountKeys[1]?.toString() || ''
    } else if (type === 'Received' && accountKeys.length > 0) {
      counterparty = accountKeys[0]?.pubkey?.toString() || accountKeys[0]?.toString() || ''
    }
  }

  return {
    signature,
    amount,
    type,
    counterparty,
    date: blockTime ? new Date(blockTime * 1000) : null,
    fee: tx.meta.fee / LAMPORTS_PER_SOL,
    err: tx.meta.err,
  }
}
