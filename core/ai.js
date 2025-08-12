export class AI {
  init() {
    this.worker = new Worker('/workers/aiWorker.js');
  }

  async removeBackground(layers, canvas) {
    const active = layers.getActive(); if (!active) return;
    const imageData = active.ctx.getImageData(0,0,layers.width,layers.height);
    const res = await this._post({ type: 'bg-remove', width: layers.width, height: layers.height, imageData }, [imageData.data.buffer]);
    const out = new ImageData(new Uint8ClampedArray(res.data), layers.width, layers.height);
    active.ctx.putImageData(out, 0, 0);
    canvas.requestRender();
  }

  async inpaintSelection(layers, canvas) {
    const active = layers.getActive(); if (!active) return;
    const imageData = active.ctx.getImageData(0,0,layers.width,layers.height);
    const res = await this._post({ type: 'inpaint', width: layers.width, height: layers.height, imageData }, [imageData.data.buffer]);
    const out = new ImageData(new Uint8ClampedArray(res.data), layers.width, layers.height);
    active.ctx.putImageData(out, 0, 0);
    canvas.requestRender();
  }

  async textToImage(prompt, layers, canvas) {
    // Demo: generate a seeded gradient tile with prompt watermark. Real integrations can be plugged in.
    const active = layers.getActive() || layers.add('Generated');
    const res = await this._post({ type: 'text2img', prompt, width: layers.width, height: layers.height });
    const img = new Image();
    await new Promise((resolve) => { img.onload = resolve; img.src = res.url; });
    active.ctx.drawImage(img, 0, 0, layers.width, layers.height);
    canvas.requestRender();
  }

  _post(message, transfer = []) {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).slice(2);
      const handler = (e) => {
        if (e.data?.id !== id) return;
        this.worker.removeEventListener('message', handler);
        resolve(e.data);
      };
      this.worker.addEventListener('message', handler);
      this.worker.postMessage({ id, ...message }, transfer);
    });
  }
}