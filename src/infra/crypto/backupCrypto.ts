/**
 * Backup cifrado 100% local.
 * - KDF: PBKDF2 (SHA-256)
 * - Cifrado: AES-GCM 256
 * - Formato JSON portable (base64)
 *
 * Compatible con TS estricto + noUncheckedIndexedAccess.
 */

export type EncryptedBackupV1 = {
  v: 1;
  kdf: "PBKDF2-SHA256";
  iter: number;
  salt: string; // base64
  alg: "AES-256-GCM";
  iv: string;   // base64
  ct: string;   // base64
};

const ITER = 210_000;

function toB64(u8: Uint8Array): string {
  let s = "";
  for (let i = 0; i < u8.length; i++) {
    const n = u8[i] ?? 0;
    s += String.fromCharCode(n);
  }
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return u8;
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  // Asegura ArrayBuffer "real" (evita ArrayBufferLike / SharedArrayBuffer typings)
  const copy = new Uint8Array(u8.byteLength);
  copy.set(u8);
  return copy.buffer;
}

async function deriveKey(passphrase: string, salt: Uint8Array, iter: number): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations: iter,
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function isEncryptedBackup(x: unknown): x is EncryptedBackupV1 {
  if (!x || typeof x !== "object") return false;
  const o = x as any;
  return (
    o.v === 1 &&
    o.kdf === "PBKDF2-SHA256" &&
    o.alg === "AES-256-GCM" &&
    typeof o.iter === "number" &&
    typeof o.salt === "string" &&
    typeof o.iv === "string" &&
    typeof o.ct === "string"
  );
}

export async function encryptBackup(passphrase: string, plain: unknown): Promise<EncryptedBackupV1> {
  if (!passphrase || passphrase.trim().length < 6) {
    throw new Error("Contraseña demasiado corta (mínimo 6 caracteres).");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ITER);

  const enc = new TextEncoder();
  const bytes = enc.encode(JSON.stringify(plain));
  const ctBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(bytes));
  const ct = new Uint8Array(ctBuf);

  return {
    v: 1,
    kdf: "PBKDF2-SHA256",
    iter: ITER,
    salt: toB64(salt),
    alg: "AES-256-GCM",
    iv: toB64(iv),
    ct: toB64(ct),
  };
}

export async function decryptBackup(passphrase: string, data: EncryptedBackupV1): Promise<unknown> {
  if (!passphrase) throw new Error("Contraseña requerida.");

  const salt = fromB64(data.salt);
  const iv = fromB64(data.iv);
  const ct = fromB64(data.ct);

  const key = await deriveKey(passphrase, salt, data.iter);

  let plainBuf: ArrayBuffer;
  try {
    plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(ct)
    );
  } catch {
    throw new Error("Contraseña incorrecta o backup corrupto.");
  }

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plainBuf));
}
