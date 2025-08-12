export default class PlaceholderTool {
  constructor(){ }
  onPointerDown(){ if (this.timer) clearTimeout(this.timer); const el=document.createElement('div'); el.textContent='This professional tool is coming soon (placeholder).'; Object.assign(el.style,{ position:'fixed', bottom:'16px', left:'50%', transform:'translateX(-50%)', background:'#1f2937', color:'#e5e7eb', padding:'8px 12px', border:'1px solid #374151', borderRadius:'8px', zIndex:9999 }); document.body.appendChild(el); this.timer=setTimeout(()=>el.remove(), 1500); }
}