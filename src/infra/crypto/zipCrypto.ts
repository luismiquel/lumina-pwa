type EncV1 = {
  v: 1;
  alg: "AES-GCM";
  kdf: "PBKDF2-SHA256";
  iter: number;
  saltB64: string;
  ivB64: string;
  ctB64: string;
};

const ITER = 210_000; // razonable para 2026; ajustable

function b64(u8: Uint8Array): string {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]!);
  return btoa(s);
}

function u8FromB64(s: string): Uint8Array {
  const bin = atob(s);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

async function deriveKey(pass: string, salt: Uint8Array, iter = ITER): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt.buffer as ArrayBuffer, iterations: iter },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function encryptZipAndDownload(zipBytes: Uint8Array, pass: string, outName: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt, ITER);

  const zipBuf = zipBytes.buffer.slice(zipBytes.byteOffset, zipBytes.byteOffset + zipBytes.byteLength) as ArrayBuffer;
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv.buffer as ArrayBuffer }, key, zipBuf);

  const payload: EncV1 = {
    v: 1,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iter: ITER,
    saltB64: b64(salt),
    ivB64: b64(iv),
    ctB64: b64(new Uint8Array(ct)),
  };

  downloadBlob(outName, new Blob([JSON.stringify(payload)], { type: "application/json" }));
}

export async function decryptEncFile(encFile: File, pass: string): Promise<Uint8Array> {
  const txt = await encFile.text();
  const data = JSON.parse(txt) as EncV1;

  if (!data || data.v !== 1 || data.alg !== "AES-GCM" || data.kdf !== "PBKDF2-SHA256") {
    throw new Error("Formato cifrado no soportado.");
  }

  const salt = u8FromB64(data.saltB64);
  const iv = u8FromB64(data.ivB64);
  const ct = u8FromB64(data.ctB64);

  const key = await deriveKey(pass, salt, data.iter);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ct.buffer.slice(ct.byteOffset, ct.byteOffset + ct.byteLength) as ArrayBuffer
  );

  return new Uint8Array(plain);
}
