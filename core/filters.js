export class Filters {
  init() {
    this.worker = new Worker('/workers/filterWorker.js', { type: 'module' });
  }

  async applyFilter(type, layers, canvas) {
    const layer = layers.getActive();
    if (!layer) return;
    const imageData = layer.ctx.getImageData(0, 0, layers.width, layers.height);
    const transferred = await this._post({ type, width: layers.width, height: layers.height, imageData }, [imageData.data.buffer]);
    const out = new ImageData(new Uint8ClampedArray(transferred.data), layers.width, layers.height);
    layer.ctx.putImageData(out, 0, 0);
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