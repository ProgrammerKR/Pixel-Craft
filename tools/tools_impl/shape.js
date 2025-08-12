export default class ShapeTool {
  constructor(ctx){ this.layers=ctx.layers; this.canvas=ctx.canvas; this.state=ctx.state; this.start=null; this.end=null; this.mode='rect'; this.history=ctx.history; }
  onPointerDown(x,y){ this.start={x,y}; this.end={x,y}; }
  onPointerMove(x,y){ if(!this.canvas.pointer.down) return; this.end={x,y}; this.canvas.requestRender(); }
  onPointerUp(x,y){ this.end={x,y}; this._apply(); this.history.push(this.layers.serialize(), 'Shape'); }
  _apply(){ const act=this.layers.getActive(); if(!act) return; const x=Math.min(this.start.x,this.end.x), y=Math.min(this.start.y,this.end.y), w=Math.abs(this.end.x-this.start.x), h=Math.abs(this.end.y-this.start.y); act.ctx.save(); act.ctx.fillStyle=this.state.primaryColor; if(this.mode==='rect'){ act.ctx.fillRect(x,y,w,h);} else { act.ctx.beginPath(); act.ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2); act.ctx.fill(); } act.ctx.restore(); this.canvas.requestRender(); }
  drawOverlay(){ if(!this.start||!this.end) return; const dc=this.canvas.canvas; const g=dc.getContext('2d'); const sv=this.canvas.canvasToView(this.start.x,this.start.y); const ev=this.canvas.canvasToView(this.end.x,this.end.y); const x=Math.min(sv.x,ev.x), y=Math.min(sv.y,ev.y), w=Math.abs(ev.x-sv.x), h=Math.abs(ev.y-sv.y); g.save(); g.strokeStyle='#94a3b8'; g.setLineDash([6,4]); g.strokeRect(x,y,w,h); g.restore(); }
}