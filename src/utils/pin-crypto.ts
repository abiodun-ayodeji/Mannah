/**
 * PIN hashing using PBKDF2 via the Web Crypto API.
 *
 * Stores a random 16-byte salt alongside the derived key so that
 * identical PINs produce different hashes across users/devices.
 */

const ITERATIONS = 100_000
const KEY_LENGTH = 256 // bits
const HASH_ALGO = 'SHA-256'

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes.buffer
}

async function deriveKey(pin: string, salt: ArrayBuffer): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH_ALGO },
    keyMaterial,
    KEY_LENGTH,
  )
}

/** Hash a plaintext PIN → { hash, salt } (both hex-encoded). */
export async function hashPin(pin: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16)).buffer
  const derived = await deriveKey(pin, salt)
  return { hash: bufToHex(derived), salt: bufToHex(salt) }
}

/** Verify a plaintext PIN against a stored hash + salt. */
export async function verifyPin(
  pin: string,
  storedHash: string,
  storedSalt: string,
): Promise<boolean> {
  const derived = await deriveKey(pin, hexToBuf(storedSalt))
  return bufToHex(derived) === storedHash
}
