export default class RectSelectTool {
  constructor(ctx){ this.canvas=ctx.canvas; this.layers=ctx.layers; this.start=null; this.end=null; }
  onPointerDown(x,y){ this.start={x,y}; this.end={x,y}; }
  onPointerMove(x,y){ if(!this.canvas.pointer.down) return; this.end={x,y}; this.canvas.requestRender(); }
  onPointerUp(){ }
  drawOverlay(ctx){ if(!this.start||!this.end) return; const {x:sx,y:sy}=this.canvas.canvasToView(this.start.x,this.start.y); const {x:ex,y:ey}=this.canvas.canvasToView(this.end.x,this.end.y); const x=Math.min(sx,ex), y=Math.min(sy,ey), w=Math.abs(ex-sx), h=Math.abs(ey-sy); const dc=this.canvas.canvas; const g=dc.getContext('2d'); g.save(); g.strokeStyle='#4cc9f0'; g.setLineDash([6,4]); g.strokeRect(x,y,w,h); g.restore(); }
}