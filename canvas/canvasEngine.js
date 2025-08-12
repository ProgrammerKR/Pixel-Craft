export class CanvasEngine {
  constructor(canvas, layers, state) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.layers = layers;
    this.state = state;
    this.tool = null;
    this.isPanning = false;

    this.pointer = { x: 0, y: 0, down: false };

    this._bind();
    this._schedule = null;
  }

  resize(w, h) {
    this.layers.resize(w, h);
    this.requestRender();
  }

  setTool(toolInstance) {
    if (this.tool?.onDetach) this.tool.onDetach();
    this.tool = toolInstance;
    if (this.tool?.onAttach) this.tool.onAttach();
  }

  setBrushSize(size) { this.tool?.setSize?.(size); }
  setBrushHardness(h) { this.tool?.setHardness?.(h); }
  setBrushOpacity(o) { this.tool?.setOpacity?.(o); }

  viewToCanvas(x, y) {
    const { zoom, panX, panY } = this.state;
    return { x: (x / zoom) + panX, y: (y / zoom) + panY };
  }

  canvasToView(x, y) {
    const { zoom, panX, panY } = this.state;
    return { x: (x - panX) * zoom, y: (y - panY) * zoom };
  }

  zoomAt(factor) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2; const cy = rect.height / 2;
    const before = this.viewToCanvas(cx, cy);
    this.state.zoom = Math.max(0.05, Math.min(16, this.state.zoom * factor));
    const after = this.viewToCanvas(cx, cy);
    this.state.panX += before.x - after.x;
    this.state.panY += before.y - after.y;
    this.requestRender();
  }

  requestRender() {
    if (this._schedule) cancelAnimationFrame(this._schedule);
    this._schedule = requestAnimationFrame(() => this.render());
  }

  render() {
    const ctx = this.ctx;
    const { width, height } = this.layers;
    const { zoom, panX, panY } = this.state;
    const viewW = Math.floor(width * zoom);
    const viewH = Math.floor(height * zoom);
    this.canvas.width = Math.max(64, viewW);
    this.canvas.height = Math.max(64, viewH);

    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.scale(zoom, zoom);
    ctx.translate(-panX, -panY);

    // Composite visible layers with blend, opacity
    this.layers.list.forEach((layer) => {
      if (!layer.visible) return;
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blend;
      ctx.drawImage(layer.canvas, 0, 0);
    });

    ctx.restore();

    this.tool?.drawOverlay?.(ctx, this);
  }

  _bind() {
    const wrap = this.canvas.parentElement;
    const onPointerEvent = (type) => (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cv = this.viewToCanvas(x, y);
      this.pointer.x = cv.x; this.pointer.y = cv.y;

      if (type === 'down') {
        this.pointer.down = true;
        this.tool?.onPointerDown?.(cv.x, cv.y, e);
      } else if (type === 'move') {
        this.tool?.onPointerMove?.(cv.x, cv.y, e);
      } else if (type === 'up' || type === 'leave') {
        this.pointer.down = false;
        this.tool?.onPointerUp?.(cv.x, cv.y, e);
      } else if (type === 'wheel') {
        if (e.ctrlKey) {
          this.zoomAt(e.deltaY < 0 ? 1.1 : 1/1.1);
        } else {
          this.state.panX += e.deltaX / this.state.zoom;
          this.state.panY += e.deltaY / this.state.zoom;
          this.requestRender();
        }
      }
      e.preventDefault();
    };

    wrap.addEventListener('pointerdown', onPointerEvent('down'));
    wrap.addEventListener('pointermove', onPointerEvent('move'));
    wrap.addEventListener('pointerup', onPointerEvent('up'));
    wrap.addEventListener('pointerleave', onPointerEvent('leave'));
    wrap.addEventListener('wheel', onPointerEvent('wheel'), { passive: false});
  }
}