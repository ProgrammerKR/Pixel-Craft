export class Layers {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.list = [];
    this.activeIndex = -1;
    this.add('Background');
  }

  add(name = `Layer ${this.list.length+1}`) {
    const canvas = document.createElement('canvas');
    canvas.width = this.width; canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,this.width,this.height);
    const layer = { name, canvas, ctx, opacity: 1, blend: 'source-over', visible: true };
    this.list.push(layer);
    this.activeIndex = this.list.length - 1;
    return layer;
  }

  removeActive() {
    if (this.activeIndex < 0) return;
    this.list.splice(this.activeIndex, 1);
    this.activeIndex = Math.min(this.list.length - 1, this.activeIndex);
  }

  duplicateActive() {
    const src = this.getActive();
    if (!src) return;
    const layer = this.add(src.name + ' Copy');
    layer.ctx.drawImage(src.canvas, 0, 0);
  }

  getActive() {
    if (this.activeIndex < 0) return null;
    return this.list[this.activeIndex];
  }

  setActive(index) { this.activeIndex = index; }

  resize(width, height) {
    this.width = width; this.height = height;
    this.list.forEach((layer) => {
      const tmp = document.createElement('canvas');
      tmp.width = width; tmp.height = height;
      const tctx = tmp.getContext('2d');
      tctx.drawImage(layer.canvas, 0, 0, width, height);
      layer.canvas.width = width; layer.canvas.height = height;
      layer.ctx = layer.canvas.getContext('2d');
      layer.ctx.drawImage(tmp, 0, 0);
    });
  }

  setBlendMode(mode) {
    const act = this.getActive();
    if (act) act.blend = mode;
  }

  serialize() {
    return {
      width: this.width,
      height: this.height,
      activeIndex: this.activeIndex,
      layers: this.list.map((l) => ({
        name: l.name,
        opacity: l.opacity,
        blend: l.blend,
        visible: l.visible,
        dataURL: l.canvas.toDataURL('image/png'),
      })),
    };
  }

  async deserialize(state) {
    this.width = state.width; this.height = state.height;
    this.list = [];
    for (const l of state.layers) {
      const layer = this.add(l.name);
      layer.opacity = l.opacity; layer.blend = l.blend; layer.visible = l.visible;
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { layer.ctx.clearRect(0,0,this.width,this.height); layer.ctx.drawImage(img, 0, 0); resolve(); };
        img.src = l.dataURL;
      });
    }
    this.activeIndex = state.activeIndex;
  }
}