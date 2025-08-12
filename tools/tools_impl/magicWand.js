export default class MagicWandTool {
  constructor(ctx){ this.canvas=ctx.canvas; this.layers=ctx.layers; this.seed=null; this.mask=null; }
  onPointerDown(x,y){ this.seed={x:Math.floor(x),y:Math.floor(y)}; this._computeMask(); this.canvas.requestRender(); }
  _computeMask(){ const act=this.layers.getActive(); if(!act) return; const img=act.ctx.getImageData(0,0,this.layers.width,this.layers.height); const data=img.data; const {x,y}=this.seed; const idx=(y*this.layers.width+x)*4; const sr=data[idx], sg=data[idx+1], sb=data[idx+2]; const tol=32; const visited=new Uint8Array(this.layers.width*this.layers.height); const queue=[[x,y]]; const mask=new Uint8Array(this.layers.width*this.layers.height); while(queue.length){ const [cx,cy]=queue.pop(); if(cx<0||cy<0||cx>=this.layers.width||cy>=this.layers.height) continue; const ci=(cy*this.layers.width+cx); if(visited[ci]) continue; visited[ci]=1; const di=ci*4; const dr=data[di], dg=data[di+1], db=data[di+2]; if(Math.abs(dr-sr)<=tol&&Math.abs(dg-sg)<=tol&&Math.abs(db-sb)<=tol){ mask[ci]=1; queue.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]); }
    }
    this.mask=mask;
  }
  drawOverlay(){ if(!this.mask) return; const dc=this.canvas.canvas; const g=dc.getContext('2d'); g.save(); g.fillStyle='rgba(76,201,240,.25)'; for(let y=0;y<this.layers.height;y+=4){ for(let x=0;x<this.layers.width;x+=4){ const i=(y*this.layers.width+x); if(this.mask[i]){ const v=this.canvas.canvasToView(x,y); g.fillRect(v.x,v.y,4*this.canvas.state.zoom,4*this.canvas.state.zoom); } } } g.restore(); }
}