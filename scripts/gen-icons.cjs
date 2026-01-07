const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

function writePng(filePath, size) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const png = new PNG({ width: size, height: size });

  // Fondo #020408
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) << 2;
      png.data[i + 0] = 2;
      png.data[i + 1] = 4;
      png.data[i + 2] = 8;
      png.data[i + 3] = 255;
    }
  }

  // Anillo cian simple
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const r = size * 0.35;
  const thickness = Math.max(4, Math.floor(size * 0.03));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (Math.abs(d - r) <= thickness) {
        const i = (size * y + x) << 2;
        png.data[i + 0] = 0;
        png.data[i + 1] = 242;
        png.data[i + 2] = 255;
        png.data[i + 3] = 255;
      }
    }
  }

  png.pack().pipe(fs.createWriteStream(filePath));
}

writePng("public/icons/icon-192.png", 192);
writePng("public/icons/icon-512.png", 512);

console.log("OK icons generated");
