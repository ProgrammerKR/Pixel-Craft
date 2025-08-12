export default class PanTool {
  constructor(ctx){ this.canvas = ctx.canvas; this.state = ctx.canvas.state; this.dragging=false; this.start=null; }
  onPointerDown(x,y){ this.dragging=true; this.start={x,y, panX:this.state.panX, panY:this.state.panY}; }
  onPointerMove(x,y){ if(!this.dragging) return; const dx=x-this.start.x, dy=y-this.start.y; this.state.panX=this.start.panX-dx; this.state.panY=this.start.panY-dy; this.canvas.requestRender(); }
  onPointerUp(){ this.dragging=false; }
}