self.onmessage = (e) => {
  const { id, type, width, height, imageData } = e.data;
  if (!type) return;
  const data = imageData?.data ? new Uint8ClampedArray(imageData.data) : null;

  function clamp(v){ return v<0?0:v>255?255:v; }

  if (type === 'blur') {
    // Box blur 3x3
    const kernel = [1,1,1,1,1,1,1,1,1];
    const out = convolve(data, width, height, kernel, 1/9);
    self.postMessage({ id, data: out.buffer }, [out.buffer]); return;
  }
  if (type === 'sharpen') {
    const kernel = [0,-1,0,-1,5,-1,0,-1,0];
    const out = convolve(data, width, height, kernel, 1);
    self.postMessage({ id, data: out.buffer }, [out.buffer]); return;
  }
  if (type === 'brightness-contrast') {
    const b = 10; // demo value
    const c = 1.1; // demo value
    for (let i=0;i<data.length;i+=4){
      data[i]=clamp(data[i]*c+b); data[i+1]=clamp(data[i+1]*c+b); data[i+2]=clamp(data[i+2]*c+b);
    }
    self.postMessage({ id, data: data.buffer }, [data.buffer]); return;
  }
  if (type === 'hue-saturation') {
    const hShift = 10 * Math.PI/180; const sMul = 1.1;
    for (let i=0;i<data.length;i+=4){
      let r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255;
      const max=Math.max(r,g,b), min=Math.min(r,g,b); let h,s,l=(max+min)/2;
      if(max===min){ h=0; s=0; } else { const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min); switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;} h/=6; }
      h=(h+hShift/(2*Math.PI))%1; s=Math.min(1, s*sMul);
      function hue2rgb(p,q,t){ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; }
      let q=l<0.5?l*(1+s):l+s-l*s; let p=2*l-q;
      r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3);
      data[i]=clamp(Math.round(r*255)); data[i+1]=clamp(Math.round(g*255)); data[i+2]=clamp(Math.round(b*255));
    }
    self.postMessage({ id, data: data.buffer }, [data.buffer]); return;
  }

  function convolve(src, w, h, kernel, divisor){
    const out = new Uint8ClampedArray(src.length);
    const k = kernel; const div = divisor||1;
    for (let y=1;y<h-1;y++){
      for (let x=1;x<w-1;x++){
        let r=0,g=0,b=0;
        let idx = (y*w + x)*4;
        let p=[-w-1,-w,-w+1,-1,0,1,w-1,w,w+1];
        for(let i=0;i<9;i++){
          const o = (idx + p[i]*4);
          r+=src[o]*k[i]; g+=src[o+1]*k[i]; b+=src[o+2]*k[i];
        }
        out[idx]=clamp(r/div); out[idx+1]=clamp(g/div); out[idx+2]=clamp(b/div); out[idx+3]=src[idx+3];
      }
    }
    return out;
  }
};