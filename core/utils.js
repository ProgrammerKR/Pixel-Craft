export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function dataURLToBlob(dataURL) {
  const [meta, data] = dataURL.split(',');
  const mime = meta.match(/:(.*?);/)[1];
  const bin = atob(data);
  const len = bin.length; const u8 = new Uint8Array(len);
  for (let i=0;i<len;i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}