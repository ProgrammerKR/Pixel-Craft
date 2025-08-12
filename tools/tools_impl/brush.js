export default class BrushTool {
  constructor(ctx) {
    this.state = ctx.state; this.layers = ctx.layers; this.history = ctx.history; this.canvas = ctx.canvas;
    this.size = 20; this.hardness = 0.8; this.opacity = 1; this.spacing = 0.2; this.lastPoint = null;
  }
  onAttach(){ this.canvas.requestRender(); }
  setSize(v){ this.size = v; }
  setHardness(v){ this.hardness = v; }
  setOpacity(v){ this.opacity = v; }

  onPointerDown(x,y){ this._stamp(x,y); this.lastPoint = {x,y}; this.history.push(this.layers.serialize(), 'Brush Stroke'); }
  onPointerMove(x,y){ if (!this.canvas.pointer.down) return; const lp=this.lastPoint; const dx=x-lp.x, dy=y-lp.y; const dist=Math.hypot(dx,dy); const step=this.size*this.spacing; if (dist>step){ const n=Math.floor(dist/step); for(let i=1;i<=n;i++){ const t=i/n; this._stamp(lp.x+dx*t, lp.y+dy*t);} this.lastPoint={x,y}; } }
  onPointerUp(){ this.lastPoint=null; }

  _stamp(x,y){ const active=this.layers.getActive(); if(!active) return; const r=this.size/2; const g=active.ctx.createRadialGradient(x,y, r*this.hardness, x,y,r); g.addColorStop(0, hexToRgba(this.state.primaryColor,this.opacity)); g.addColorStop(1, hexToRgba(this.state.primaryColor,0)); active.ctx.globalCompositeOperation = 'source-over'; active.ctx.fillStyle=g; active.ctx.beginPath(); active.ctx.arc(x,y,r,0,Math.PI*2); active.ctx.fill(); this.canvas.requestRender(); }
}

function hexToRgba(hex, a){
  const v=hex.replace('#',''); const bigint=parseInt(v,16); const r=(bigint>>16)&255, g=(bigint>>8)&255, b=bigint&255; return `rgba(${r},${g},${b},${a})`;
}