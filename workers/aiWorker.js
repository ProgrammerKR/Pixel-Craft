let bodypixLoaded = false;

async function ensureBodyPix() {
  if (bodypixLoaded) return;
  importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
  importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.2.0/dist/body-pix.min.js');
  bodypixLoaded = true;
}

self.onmessage = async (e) => {
  const { id, type, width, height, imageData, prompt } = e.data;

  if (type === 'bg-remove') {
    try {
      await ensureBodyPix();
      const off = new OffscreenCanvas(width, height);
      const octx = off.getContext('2d');
      const src = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
      octx.putImageData(src, 0, 0);
      const imgBitmap = off.transferToImageBitmap();
      const net = await bodyPix.load({ architecture: 'MobileNetV1', outputStride: 16, multiplier: 0.75, quantBytes: 2 });
      const seg = await net.segmentPerson(imgBitmap, { internalResolution: 'medium', segmentationThreshold: 0.7 });
      const mask = seg.data; // 1 for person, 0 bg
      const data = new Uint8ClampedArray(imageData.data);
      for (let i=0, p=0; i<data.length; i+=4, p++) {
        if (mask[p] === 0) { data[i+3] = 0; }
      }
      self.postMessage({ id, data: data.buffer }, [data.buffer]);
      return;
    } catch (err) {
      // Fallback: simple chroma-like removal (none)
      self.postMessage({ id, data: imageData.data }, []);
      return;
    }
  }

  if (type === 'inpaint') {
    // Very naive fill: feather masked transparent pixels with neighboring blur
    const data = new Uint8ClampedArray(imageData.data);
    const a = 0.25;
    for (let pass=0; pass<16; pass++){
      for (let y=1; y<height-1; y++){
        for (let x=1; x<width-1; x++){
          const idx = (y*width + x)*4;
          if (data[idx+3] < 8) {
            // average neighbors
            let r=0,g=0,b=0,c=0;
            const nb = [idx-4, idx+4, idx-4*width, idx+4*width];
            for (const n of nb) { if (data[n+3]>8) { r+=data[n]; g+=data[n+1]; b+=data[n+2]; c++; } }
            if (c){ data[idx]=r/c; data[idx+1]=g/c; data[idx+2]=b/c; data[idx+3]=Math.min(255, data[idx+3] + 32*a); }
          }
        }
      }
    }
    self.postMessage({ id, data: data.buffer }, [data.buffer]);
    return;
  }

  if (type === 'text2img') {
    // Demo generator: create a gradient tile with the prompt
    const off = new OffscreenCanvas(width, height);
    const ctx = off.getContext('2d');
    const g = ctx.createLinearGradient(0,0,width,height);
    const seed = hash(prompt);
    const c1 = `hsl(${seed%360} 80% 50%)`;
    const c2 = `hsl(${(seed*7)%360} 80% 60%)`;
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(0,0,width,height);
    ctx.font = '48px sans-serif'; ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillText(prompt.slice(0,50), 40, height-60);
    const blob = await off.convertToBlob({ type: 'image/png' });
    const url = URL.createObjectURL(blob);
    self.postMessage({ id, url });
    return;
  }
};

function hash(s){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h|=0;} return Math.abs(h); }