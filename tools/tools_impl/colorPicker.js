export default class ColorPickerTool {
  constructor(ctx){ this.layers=ctx.layers; this.canvas=ctx.canvas; this.state=ctx.state; }
  onPointerDown(x,y){ const img=this._mergedImage(); const ix=(Math.floor(y)*this.layers.width+Math.floor(x))*4; const r=img.data[ix], g=img.data[ix+1], b=img.data[ix+2]; this.state.primaryColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`; document.getElementById('primary-color').value=this.state.primaryColor; }
  _mergedImage(){ const c=document.createElement('canvas'); c.width=this.layers.width; c.height=this.layers.height; const g=c.getContext('2d'); this.layers.list.forEach(l=>{ if(!l.visible) return; g.globalAlpha=l.opacity; g.globalCompositeOperation=l.blend; g.drawImage(l.canvas,0,0); }); return g.getImageData(0,0,this.layers.width,this.layers.height); }
}
function toHex(v){ const s=v.toString(16).padStart(2,'0'); return s; }