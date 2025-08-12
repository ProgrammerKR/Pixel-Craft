export default class LassoTool {
  constructor(ctx){ this.canvas=ctx.canvas; this.points=[]; }
  onPointerDown(x,y){ this.points=[[x,y]]; }
  onPointerMove(x,y){ if(!this.canvas.pointer.down) return; this.points.push([x,y]); this.canvas.requestRender(); }
  onPointerUp(){ }
  drawOverlay(){ if(this.points.length<2) return; const dc=this.canvas.canvas; const g=dc.getContext('2d'); g.save(); g.strokeStyle='#a78bfa'; g.setLineDash([4,4]); g.beginPath(); for(let i=0;i<this.points.length;i++){ const {x,y}=this.canvas.canvasToView(this.points[i][0],this.points[i][1]); if(i===0) g.moveTo(x,y); else g.lineTo(x,y); } g.stroke(); g.restore(); }
}