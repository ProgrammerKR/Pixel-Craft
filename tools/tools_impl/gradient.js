export default class GradientTool {
  constructor(ctx){ this.canvas=ctx.canvas; this.layers=ctx.layers; this.state=ctx.state; this.start=null; this.end=null; this.history=ctx.history; }
  onPointerDown(x,y){ this.start={x,y}; this.end={x,y}; }
  onPointerMove(x,y){ if(!this.canvas.pointer.down) return; this.end={x,y}; this._preview(); }
  onPointerUp(x,y){ this.end={x,y}; this._apply(); this.history.push(this.layers.serialize(), 'Gradient'); }
  _preview(){ this.canvas.requestRender(); this.drawOverlay(); }
  _apply(){ const act=this.layers.getActive(); if(!act) return; const g=act.ctx.createLinearGradient(this.start.x,this.start.y,this.end.x,this.end.y); g.addColorStop(0,this.state.primaryColor); g.addColorStop(1,this.state.secondaryColor); act.ctx.globalCompositeOperation='source-over'; act.ctx.fillStyle=g; act.ctx.fillRect(0,0,this.layers.width,this.layers.height); this.canvas.requestRender(); }
  drawOverlay(){ if(!this.start||!this.end) return; const dc=this.canvas.canvas; const g=dc.getContext('2d'); const sv=this.canvas.canvasToView(this.start.x,this.start.y); const ev=this.canvas.canvasToView(this.end.x,this.end.y); g.save(); g.strokeStyle='#4cc9f0'; g.beginPath(); g.moveTo(sv.x,sv.y); g.lineTo(ev.x,ev.y); g.stroke(); g.restore(); }
}