export default class ZoomTool {
  constructor(ctx){ this.canvas = ctx.canvas; }
  onPointerDown(x,y,e){ if(e.altKey||e.button===2) this.canvas.zoomAt(1/1.25); else this.canvas.zoomAt(1.25); }
}