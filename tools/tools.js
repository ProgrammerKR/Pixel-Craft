export const ToolRegistry = (() => {
  const implemented = {
    move: () => import('./tools_impl/move.js'),
    brush: () => import('./tools_impl/brush.js'),
    eraser: () => import('./tools_impl/eraser.js'),
    zoom: () => import('./tools_impl/zoom.js'),
    pan: () => import('./tools_impl/pan.js'),
    rectSelect: () => import('./tools_impl/selectionRect.js'),
    lasso: () => import('./tools_impl/lasso.js'),
    magicWand: () => import('./tools_impl/magicWand.js'),
    gradient: () => import('./tools_impl/gradient.js'),
    paintBucket: () => import('./tools_impl/paintBucket.js'),
    text: () => import('./tools_impl/text.js'),
    shape: () => import('./tools_impl/shape.js'),
    crop: () => import('./tools_impl/crop.js'),
    colorPicker: () => import('./tools_impl/colorPicker.js'),
  };

  const placeholder = () => import('./tools_impl/placeholder.js');

  const icon = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

  const defs = [
    { id: 'move', name: 'Move', icon: icon('M5 3h14v2H5V3zm14 6H5V7h14v2zm0 4H5v-2h14v2zm0 4H5v-2h14v2z'), loader: implemented.move },
    { id: 'brush', name: 'Brush', icon: icon('M7 16c.2 2.5-1.3 3.8-3.5 4 1.2-1.2 1.3-2.5 1-3.5C3.9 15.2 5 14 7 14l9-9 3 3-9 9c-2 2-3.2 3.1-3 3z'), loader: implemented.brush },
    { id: 'eraser', name: 'Eraser', icon: icon('M16.24 3.56L21 8.32l-9.19 9.19-4.76-4.76L16.24 3.56zm-5.9 14.96l2.12 2.12H3v-2.12h7.34z'), loader: implemented.eraser },
    { id: 'zoom', name: 'Zoom', icon: icon('M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16a6.471 6.471 0 004.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zM9.5 14A4.5 4.5 0 119.5 5a4.5 4.5 0 010 9z'), loader: implemented.zoom },
    { id: 'pan', name: 'Hand', icon: icon('M12 2a2 2 0 012 2v6h1V4a2 2 0 114 0v8h1V6a2 2 0 114 0v10a6 6 0 01-6 6H11a7 7 0 01-7-7v-2a3 3 0 016 0v1h2V4a2 2 0 012-2z'), loader: implemented.pan },
    { id: 'rectSelect', name: 'Marquee', icon: icon('M3 5h2v2H3V5zm4 0h2v2H7V5zm4 0h2v2h-2V5zm4 0h2v2h-2V5zM3 9h2v2H3V9zm16-4h2v2h-2V5z'), loader: implemented.rectSelect },
    { id: 'lasso', name: 'Lasso', icon: icon('M4 12c0-3.866 3.134-7 7-7 3.314 0 6 2.686 6 6 0 2.761-2.239 5-5 5H9c-2.761 0-5-2.239-5-5z'), loader: implemented.lasso },
    { id: 'magicWand', name: 'Magic Wand', icon: icon('M2 20l6-6 2 2-6 6H2v-2zM14 4l6 6-2 2-6-6 2-2zM7 13l9-9 3 3-9 9-3-3z'), loader: implemented.magicWand },
    { id: 'gradient', name: 'Gradient', icon: icon('M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7z'), loader: implemented.gradient },
    { id: 'paintBucket', name: 'Paint Bucket', icon: icon('M19 11l-7-7-9 9 7 7 9-9zm-7 9a2 2 0 100-4 2 2 0 000 4z'), loader: implemented.paintBucket },
    { id: 'text', name: 'Text', icon: icon('M5 4h14v3h-5v13h-4V7H5V4z'), loader: implemented.text },
    { id: 'shape', name: 'Shapes', icon: icon('M4 4h6v6H4V4zm10 0l6 3-6 3V4zm0 8h6v6h-6v-6zM4 14l6 6H4v-6z'), loader: implemented.shape },
    { id: 'crop', name: 'Crop', icon: icon('M6 2h2v14h10v2H8v4H6V2zm16 6h-4V6h-2V4h6v4z'), loader: implemented.crop },
    { id: 'colorPicker', name: 'Color Picker', icon: icon('M12 2l4 4-8 8-4-4 8-8zm-6 10l-2 6 6-2-4-4z'), loader: implemented.colorPicker },
  ];

  // Add many placeholder professional tools
  const moreTools = [
    'pencil','pen','smudge','dodge','burn','blur','sharpen','healingBrush','patch','liquify','warp','meshTransform','symmetry','ruler','guide','aiGenerativeFill','objectRemoval','backgroundBlur','patternStamp','contentAwareScale','cloneStamp','redEye','sponge','slice','sliceSelect','perspectiveCrop','freeTransform','rotate','scale','skew','distort','perspective','pathSelect','directSelect','anchorAdd','anchorDelete','convertPoint','ellipse','rectangle','roundedRect','polygon','star','line','customShape','quickSelect','magneticLasso','magicEraser','backgroundEraser','artHistory','historyBrush','note','count','measure','hand','zoomIn','zoomOut','3DMove','3DRotate','3DRoll','3DScale','colorSampler','rulerTool','frameTool','meshWarp','puppetWarp','autoEnhance','levels','curves','exposure','vibrance','colorBalance','blackWhite','photoFilter','channelMixer','invert','posterize','threshold','gradientMap','selectiveColor','lensBlur','motionBlur','median','noise','addNoise','reduceNoise','despeckle','smartSharpen','unsharpMask','highPass','emboss','findEdges','oilPaint','cameraRaw','hdrToning','tiltShift','irisBlur','fieldBlur','lensCorrection','vanishingPoint','styleTransfer','superResolution','backgroundReplace','skyReplace','debanding','dehaze','defringe'
  ];

  moreTools.forEach((id) => {
    defs.push({ id, name: toTitle(id), icon: icon('M4 4h16v16H4z'), loader: placeholder });
  });

  function toTitle(id){ return id.replace(/([A-Z])/g,' $1').replace(/^\w/, c=>c.toUpperCase()); }

  const byId = new Map(defs.map((d) => [d.id, d]));

  return {
    list: () => defs,
    get: (id) => byId.get(id) || defs[0],
  };
})();