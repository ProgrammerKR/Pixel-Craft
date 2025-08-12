import { dataURLToBlob } from './utils.js';

export class FileIO {
  constructor(layers, history, canvas, state) {
    this.layers = layers;
    this.history = history;
    this.canvas = canvas;
    this.state = state;
  }

  async importFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (['png','jpg','jpeg','webp','bmp'].includes(ext)) {
      await this._importImage(file);
      this.history.push(this.layers.serialize(), `Import ${file.name}`);
    } else if (ext === 'svg') {
      await this._importSVG(file);
      this.history.push(this.layers.serialize(), `Import ${file.name}`);
    } else if (ext === 'json') {
      const text = await file.text();
      const json = JSON.parse(text);
      await this.layers.deserialize(json);
    }
  }

  async _importImage(file) {
    const url = URL.createObjectURL(file);
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const layer = this.layers.add(file.name);
        layer.ctx.drawImage(img, 0, 0, this.layers.width, this.layers.height);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  }

  async _importSVG(file) {
    const text = await file.text();
    const svg = new Blob([text], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svg);
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const layer = this.layers.add(file.name);
        layer.ctx.drawImage(img, 0, 0, this.layers.width, this.layers.height);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  }

  async exportDialog() {
    const choice = window.prompt('Export as: png | jpg | json', 'png');
    if (!choice) return;
    if (choice === 'json') {
      const json = JSON.stringify(this.layers.serialize());
      const blob = new Blob([json], { type: 'application/json' });
      this._downloadBlob(blob, 'document.json');
      return;
    }
    const merged = document.createElement('canvas');
    merged.width = this.layers.width; merged.height = this.layers.height;
    const mctx = merged.getContext('2d');
    this.layers.list.forEach((l) => { if (l.visible){ mctx.globalAlpha = l.opacity; mctx.globalCompositeOperation = l.blend; mctx.drawImage(l.canvas, 0, 0); } });
    const mime = choice === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = choice === 'jpg' ? 0.92 : 1;
    const url = merged.toDataURL(mime, quality);
    const blob = dataURLToBlob(url);
    this._downloadBlob(blob, `export.${choice}`);
  }

  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}