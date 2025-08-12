export default class MoveTool {
  constructor(ctx){ this.layers = ctx.layers; this.canvas = ctx.canvas; this.dragging=false; this.start=null; this.snapshot=null; this.history=ctx.history; }
  onPointerDown(x,y){ this.dragging=true; this.start={x,y}; const act=this.layers.getActive(); if(!act) return; this.snapshot=act.ctx.getImageData(0,0,this.layers.width,this.layers.height); this.history.push(this.layers.serialize(), 'Move Layer'); }
  onPointerMove(x,y){ if(!this.dragging) return; const dx=Math.round(x-this.start.x), dy=Math.round(y-this.start.y); const act=this.layers.getActive(); if(!act) return; act.ctx.clearRect(0,0,this.layers.width,this.layers.height); act.ctx.putImageData(this.snapshot, dx, dy); this.canvas.requestRender(); }
  onPointerUp(){ this.dragging=false; this.snapshot=null; }
}