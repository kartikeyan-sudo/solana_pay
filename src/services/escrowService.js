import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { connection } from '../config/solanaConfig'
import escrowIdl from '../idl/escrow.json'

const PROGRAM_ID = new PublicKey(
  escrowIdl.metadata?.address || 'ESCRoWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
)

/**
 * Create an Anchor provider from wallet adapter
 */
const getProvider = (wallet) => {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet not properly connected')
  }
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  })
  return provider
}

/**
 * Get Anchor program instance
 */
const getProgram = (wallet) => {
  const provider = getProvider(wallet)
  return new Program(escrowIdl, PROGRAM_ID, provider)
}

/**
 * Derive the PDA for an escrow account
 */
export const deriveEscrowPDA = async (senderPubkey, escrowId) => {
  const [pda, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from('escrow'),
      senderPubkey.toBuffer(),
      new BN(escrowId).toArrayLike(Buffer, 'le', 8),
    ],
    PROGRAM_ID
  )
  return { pda, bump }
}

/**
 * Create an escrow — locks SOL for a receiver
 */
export const createEscrow = async (wallet, receiverAddress, amountSOL, escrowId) => {
  const program = getProgram(wallet)
  const receiver = new PublicKey(receiverAddress)
  const lamports = new BN(Math.round(amountSOL * LAMPORTS_PER_SOL))
  const id = new BN(escrowId)

  const { pda } = await deriveEscrowPDA(wallet.publicKey, escrowId)

  const tx = await program.methods
    .createEscrow(lamports, receiver, id)
    .accounts({
      escrowAccount: pda,
      sender: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc()

  return { signature: tx, escrowPDA: pda.toString() }
}

/**
 * Release an escrow — transfers locked SOL to receiver
 */
export const releaseEscrow = async (wallet, escrowPDA, receiverAddress) => {
  const program = getProgram(wallet)
  const escrowAccount = new PublicKey(escrowPDA)
  const receiver = new PublicKey(receiverAddress)

  const tx = await program.methods
    .release()
    .accounts({
      escrowAccount,
      sender: wallet.publicKey,
      receiver,
    })
    .rpc()

  return tx
}

/**
 * Fetch escrow account data from chain
 */
export const fetchEscrowAccount = async (wallet, escrowPDA) => {
  try {
    const program = getProgram(wallet)
    const data = await program.account.escrowAccount.fetch(new PublicKey(escrowPDA))
    return data
  } catch {
    return null
  }
}
