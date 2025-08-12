import { ToolRegistry } from './tools/tools.js';
import { CanvasEngine } from './canvas/canvasEngine.js';
import { Layers } from './core/layers.js';
import { History } from './core/history.js';
import { FileIO } from './core/fileIO.js';
import { Filters } from './core/filters.js';
import { AI } from './core/ai.js';

const state = {
  width: 1920,
  height: 1080,
  zoom: 1,
  panX: 0,
  panY: 0,
  activeToolId: 'move',
  primaryColor: '#ff5722',
  secondaryColor: '#222222',
};

const elements = {
  displayCanvas: document.getElementById('display-canvas'),
  canvasWrapper: document.getElementById('canvas-wrapper'),
  overlay: document.getElementById('overlay'),
  toolsList: document.getElementById('tools-list'),
  zoomLevel: document.getElementById('zoom-level'),
  brushSize: document.getElementById('brush-size'),
  brushHardness: document.getElementById('brush-hardness'),
  brushOpacity: document.getElementById('brush-opacity'),
  primaryColor: document.getElementById('primary-color'),
  secondaryColor: document.getElementById('secondary-color'),
  layersList: document.getElementById('layers-list'),
  blendMode: document.getElementById('blend-mode'),
  historyList: document.getElementById('history-list'),
  openFile: document.getElementById('open-file'),
  saveFile: document.getElementById('save-file'),
  fileInput: document.getElementById('file-input'),
  fileDropHelper: document.getElementById('file-drop-helper'),
  frames: document.getElementById('frames'),
  swatches: document.getElementById('swatches'),
};

// Core modules
const layers = new Layers(state.width, state.height);
const history = new History();
const canvas = new CanvasEngine(elements.displayCanvas, layers, state);
const filters = new Filters();
const ai = new AI();
const fileIO = new FileIO(layers, history, canvas, state);

// Workers
filters.init();
ai.init();

// UI Init
function renderTools() {
  ToolRegistry.list().forEach((tool) => {
    const btn = document.createElement('button');
    btn.className = 'tool';
    btn.title = tool.name;
    btn.dataset.tool = tool.id;
    btn.innerHTML = tool.icon;
    btn.addEventListener('click', async () => setActiveTool(tool.id));
    elements.toolsList.appendChild(btn);
  });
}

async function setActiveTool(id) {
  state.activeToolId = id;
  for (const el of elements.toolsList.children) {
    el.classList.toggle('active', el.dataset.tool === id);
  }
  const toolDef = ToolRegistry.get(id);
  const module = await toolDef.loader();
  const ToolClass = module.default;
  canvas.setTool(new ToolClass({ state, layers, history, canvas, filters, ai }));
}

function updateZoomLabel() {
  elements.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
}

function wireTopBar() {
  document.querySelector('[data-zoom="in"]').addEventListener('click', () => {
    canvas.zoomAt(1.1);
    updateZoomLabel();
  });
  document.querySelector('[data-zoom="out"]').addEventListener('click', () => {
    canvas.zoomAt(1/1.1);
    updateZoomLabel();
  });
  elements.primaryColor.addEventListener('input', (e) => {
    state.primaryColor = e.target.value;
  });
  elements.secondaryColor.addEventListener('input', (e) => {
    state.secondaryColor = e.target.value;
  });
  elements.brushSize.addEventListener('input', (e) => canvas.setBrushSize(parseInt(e.target.value,10)));
  elements.brushHardness.addEventListener('input', (e) => canvas.setBrushHardness(parseFloat(e.target.value)));
  elements.brushOpacity.addEventListener('input', (e) => canvas.setBrushOpacity(parseFloat(e.target.value)));
}

function wireLayers() {
  function render() {
    elements.layersList.innerHTML = '';
    layers.list.forEach((layer, index) => {
      const li = document.createElement('li');
      li.className = index === layers.activeIndex ? 'active' : '';
      li.innerHTML = `<span>${layer.name}</span><div><input type="checkbox" ${layer.visible?'checked':''} data-index="${index}" data-act="vis"/><input type="range" min="0" max="1" step="0.01" value="${layer.opacity}" data-index="${index}" data-act="opa" style="width:80px"/></div>`;
      li.addEventListener('click', () => { layers.setActive(index); render(); canvas.requestRender(); });
      elements.layersList.appendChild(li);
    });
  }
  elements.blendMode.addEventListener('change', (e) => { layers.setBlendMode(e.target.value); canvas.requestRender(); });
  elements.layersList.addEventListener('input', (e) => {
    const i = parseInt(e.target.dataset.index,10);
    if (e.target.dataset.act === 'vis') { layers.list[i].visible = e.target.checked; }
    if (e.target.dataset.act === 'opa') { layers.list[i].opacity = parseFloat(e.target.value); }
    canvas.requestRender();
  });
  document.querySelector('[data-action="new-layer"]').addEventListener('click', () => { layers.add(); render(); canvas.requestRender(); history.push(layers.serialize(), 'New Layer'); });
  document.querySelector('[data-action="delete-layer"]').addEventListener('click', () => { layers.removeActive(); render(); canvas.requestRender(); history.push(layers.serialize(), 'Delete Layer'); });
  document.querySelector('[data-action="duplicate-layer"]').addEventListener('click', () => { layers.duplicateActive(); render(); canvas.requestRender(); history.push(layers.serialize(), 'Duplicate Layer'); });
  render();
}

function wireHistory() {
  function render() {
    elements.historyList.innerHTML = '';
    history.stack.forEach((h, idx) => {
      const li = document.createElement('li');
      li.textContent = h.label;
      li.className = idx === history.index ? 'active' : '';
      li.addEventListener('click', () => {
        history.goTo(idx, (state) => {
          layers.deserialize(state);
          canvas.requestRender();
        });
      });
      elements.historyList.appendChild(li);
    });
  }
  history.onChange(render);
  render();
}

function wireFile() {
  elements.openFile.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', async (e) => {
    for (const file of e.target.files) {
      await fileIO.importFile(file);
    }
    canvas.requestRender();
  });
  elements.saveFile.addEventListener('click', async () => {
    await fileIO.exportDialog();
  });

  // Drag and drop
  document.addEventListener('dragover', (e) => { e.preventDefault(); });
  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      for (const file of e.dataTransfer.files) {
        await fileIO.importFile(file);
      }
      canvas.requestRender();
    }
  });
}

function wireAdjustments() {
  document.getElementById('adjustments-panel').addEventListener('click', async (e) => {
    const filter = e.target.dataset.filter;
    if (!filter) return;
    await filters.applyFilter(filter, layers, canvas);
    history.push(layers.serialize(), `Filter: ${filter}`);
    canvas.requestRender();
  });
}

function wireAI() {
  document.getElementById('ai-panel').addEventListener('click', async (e) => {
    const aiAction = e.target.dataset.ai;
    if (!aiAction) return;
    if (aiAction === 'bg-remove') {
      await ai.removeBackground(layers, canvas);
    }
    if (aiAction === 'inpaint') {
      await ai.inpaintSelection(layers, canvas);
    }
    if (aiAction === 'text2img') {
      const prompt = document.getElementById('prompt').value || 'abstract gradient';
      await ai.textToImage(prompt, layers, canvas);
    }
    history.push(layers.serialize(), `AI: ${aiAction}`);
    canvas.requestRender();
  });
}

function wireTimeline() {
  const frames = [];
  let active = 0;
  const framesEl = elements.frames;
  function render() {
    framesEl.innerHTML = '';
    frames.forEach((f, i) => {
      const el = document.createElement('div');
      el.className = 'frame' + (i===active?' active':'');
      el.textContent = `${i+1}`;
      el.addEventListener('click', () => { active = i; layers.deserialize(f); canvas.requestRender(); render(); });
      framesEl.appendChild(el);
    });
  }
  function snapshot() { return layers.serialize(); }
  document.querySelector('[data-timeline="add-frame"]').addEventListener('click', () => { frames.push(snapshot()); active = frames.length-1; render(); });
  document.querySelector('[data-timeline="duplicate-frame"]').addEventListener('click', () => { frames.splice(active+1,0,snapshot()); active++; render(); });
  document.querySelector('[data-timeline="delete-frame"]').addEventListener('click', () => { if(frames.length){ frames.splice(active,1); active = Math.max(0, active-1); render(); } });
  document.querySelector('[data-timeline="play"]').addEventListener('click', async () => {
    if (!frames.length) return;
    for (let i=0; i<frames.length; i++) {
      layers.deserialize(frames[i]);
      canvas.requestRender();
      render();
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r=>setTimeout(r, 150));
    }
  });
  render();
}

function initRulers() {
  const top = document.getElementById('ruler-top');
  const left = document.getElementById('ruler-left');
  const draw = () => {
    const tctx = top.getContext('2d');
    const lctx = left.getContext('2d');
    top.width = top.clientWidth; top.height = 24;
    left.width = 24; left.height = left.clientHeight;
    tctx.clearRect(0,0,top.width,top.height);
    lctx.clearRect(0,0,left.width,left.height);
    tctx.fillStyle = lctx.fillStyle = '#8b94a7';
    const step = 50 * state.zoom;
    for (let x = 0; x < top.width; x += step) {
      tctx.fillRect(x, 12, 1, 12);
      tctx.fillText(Math.round((x/state.zoom)+state.panX), x+2, 10);
    }
    for (let y = 0; y < left.height; y += step) {
      lctx.fillRect(12, y, 12, 1);
      lctx.save();
      lctx.translate(0,y+10); lctx.rotate(-Math.PI/2); lctx.fillText(Math.round((y/state.zoom)+state.panY), 0, 10); lctx.restore();
    }
  };
  new ResizeObserver(draw).observe(document.getElementById('canvas-area'));
  draw();
}

function initSwatches() {
  const palette = ['#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#f97316','#84cc16','#22c55e','#14b8a6','#3b82f6','#8b5cf6','#ec4899','#f43f5e'];
  elements.swatches.innerHTML = '';
  palette.forEach((hex) => {
    const el = document.createElement('button');
    el.style.background = hex;
    el.style.border = '1px solid var(--border)';
    el.style.borderRadius = '6px';
    el.style.aspectRatio = '1';
    el.title = hex;
    el.addEventListener('click', () => {
      state.primaryColor = hex;
      elements.primaryColor.value = hex;
    });
    elements.swatches.appendChild(el);
  });
}

(async function bootstrap(){
  renderTools();
  wireTopBar();
  wireLayers();
  wireHistory();
  wireFile();
  wireAdjustments();
  wireAI();
  wireTimeline();
  initRulers();
  initSwatches();
  canvas.resize(state.width, state.height);
  await setActiveTool(state.activeToolId);
  history.push(layers.serialize(), 'Initial State');
})();