export default class EraserTool {
  constructor(ctx){ this.layers = ctx.layers; this.canvas = ctx.canvas; this.size=30; this.hardness=1; this.opacity=1; this.spacing=0.25; this.lastPoint=null; this.history=ctx.history; }
  setSize(v){ this.size=v; } setHardness(v){ this.hardness=v; } setOpacity(v){ this.opacity=v; }
  onPointerDown(x,y){ this._stamp(x,y); this.lastPoint={x,y}; this.history.push(this.layers.serialize(), 'Erase'); }
  onPointerMove(x,y){ if(!this.canvas.pointer.down) return; const lp=this.lastPoint; const dx=x-lp.x,dy=y-lp.y; const dist=Math.hypot(dx,dy); const step=this.size*this.spacing; if(dist>step){ const n=Math.floor(dist/step); for(let i=1;i<=n;i++){ const t=i/n; this._stamp(lp.x+dx*t, lp.y+dy*t);} this.lastPoint={x,y}; } }
  onPointerUp(){ this.lastPoint=null; }
  _stamp(x,y){ const act=this.layers.getActive(); if(!act) return; const r=this.size/2; const g=act.ctx.createRadialGradient(x,y,r*this.hardness,x,y,r); g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(1,'rgba(0,0,0,0)'); act.ctx.globalCompositeOperation='destination-out'; act.ctx.fillStyle=g; act.ctx.beginPath(); act.ctx.arc(x,y,r,0,Math.PI*2); act.ctx.fill(); this.canvas.requestRender(); }
}