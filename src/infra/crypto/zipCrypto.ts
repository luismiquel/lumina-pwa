type EncV2 = {
  v: 2;
  alg: "AES-GCM";
  kdf: "PBKDF2-SHA256";
  iter: number;
  saltB64: string;
  ivB64: string;
  ctB64: string;
  macAlg: "HMAC-SHA256";
  macB64: string;
};

const ITER = 210_000;

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
function abFromU8(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

async function deriveBits(pass: string, salt: Uint8Array, iter: number): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: abFromU8(salt), iterations: iter },
    baseKey,
    512 // 64 bytes
  );
  return new Uint8Array(bits);
}

async function keysFromPass(pass: string, salt: Uint8Array, iter: number) {
  const bits = await deriveBits(pass, salt, iter);
  const aesRaw = bits.slice(0, 32);
  const macRaw = bits.slice(32, 64);

  const aesKey = await crypto.subtle.importKey("raw", abFromU8(aesRaw), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  const macKey = await crypto.subtle.importKey("raw", abFromU8(macRaw), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

  return { aesKey, macKey };
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

function packForMac(data: Omit<EncV2, "macB64">): Uint8Array {
  // Firmamos un string estable (evita problemas de orden JSON)
  const s = [
    `v=${data.v}`,
    `alg=${data.alg}`,
    `kdf=${data.kdf}`,
    `iter=${data.iter}`,
    `salt=${data.saltB64}`,
    `iv=${data.ivB64}`,
    `ct=${data.ctB64}`,
    `macAlg=${data.macAlg}`,
  ].join("|");
  return new TextEncoder().encode(s);
}

export async function encryptZipAndDownload(zipBytes: Uint8Array, pass: string, outName: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const { aesKey, macKey } = await keysFromPass(pass, salt, ITER);

  const zipBuf = abFromU8(zipBytes);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: abFromU8(iv) }, aesKey, zipBuf);
  const ctU8 = new Uint8Array(ct);

  const pre: Omit<EncV2, "macB64"> = {
    v: 2,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iter: ITER,
    saltB64: b64(salt),
    ivB64: b64(iv),
    ctB64: b64(ctU8),
    macAlg: "HMAC-SHA256",
  };

  const mac = await crypto.subtle.sign({ name: "HMAC" }, macKey, abFromU8(packForMac(pre)));
  const payload: EncV2 = { ...pre, macB64: b64(new Uint8Array(mac)) };

  downloadBlob(outName, new Blob([JSON.stringify(payload)], { type: "application/json" }));
}

export async function decryptEncFile(encFile: File, pass: string): Promise<Uint8Array> {
  const txt = await encFile.text();
  const data = JSON.parse(txt) as Partial<EncV2>;

  if (!data || data.v !== 2 || data.alg !== "AES-GCM" || data.kdf !== "PBKDF2-SHA256" || data.macAlg !== "HMAC-SHA256") {
    throw new Error("Formato cifrado no soportado.");
  }
  if (!data.saltB64 || !data.ivB64 || !data.ctB64 || !data.macB64 || !data.iter) {
    throw new Error("Archivo cifrado incompleto.");
  }

  const salt = u8FromB64(data.saltB64);
  const iv = u8FromB64(data.ivB64);
  const ct = u8FromB64(data.ctB64);
  const mac = u8FromB64(data.macB64);

  const { aesKey, macKey } = await keysFromPass(pass, salt, data.iter);

  const pre: Omit<EncV2, "macB64"> = {
    v: 2,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iter: data.iter,
    saltB64: data.saltB64,
    ivB64: data.ivB64,
    ctB64: data.ctB64,
    macAlg: "HMAC-SHA256",
  };

  const ok = await crypto.subtle.verify({ name: "HMAC" }, macKey, abFromU8(mac), abFromU8(packForMac(pre)));
  if (!ok) throw new Error("Contraseña incorrecta o archivo manipulado.");

  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: abFromU8(iv) }, aesKey, abFromU8(ct));
  return new Uint8Array(plain);
}
