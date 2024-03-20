<!-- DrawingCanvas.svelte -->
<script lang="js">
  // Define brush types and their properties

  import {onMount} from 'svelte';

  const BRUSHES = {
    PEN: { name: 'Pen', sizeFactor: 1, clippingMask: false },
    PENCIL: { name: 'Pencil', sizeFactor: 0.5, clippingMask: false },
    PAINT: { name: 'Paint', sizeFactor: 2, clippingMask: false },
    AIRBRUSH: { name: 'Airbrush', sizeFactor: 3, clippingMask: true },
  };

  // Drawing state
  let drawing = false;
  let context;
  let previousX;
  let previousY;
  let pressure = 1; // Default pressure value (0 to 1)
  let currentBrush = BRUSHES.PEN; // Default brush type
  let currentColor = '#000000'; // Default color (black)
  let brushSize = 5; // Default brush size

  // Layers state for each brush type
  const layers = Object.fromEntries(Object.values(BRUSHES).map((brush) => [brush, []]));
  const activeLayerIndexMap = new Map(Object.values(BRUSHES).map((brush) => [brush, 0]));

  // Set up the canvas after the component is mounted
  onMount(() => {
    const canvas = document.getElementById('drawingCanvas');
    context = canvas.getContext('2d');

    // Add the initial drawing layers for each brush type (you can add more as needed)
    Object.values(BRUSHES).forEach((brush) => layers[brush].push({ context, clippingMask: brush.clippingMask }));
  });

  // Handle mouse/touch events to draw on the canvas
  function handleStart(event) {
    drawing = true;
    const { offsetX, offsetY } = event;
    previousX = offsetX;
    previousY = offsetY;
    pressure = event.pressure || 1; // Get the pressure value (if supported)
  }

  function handleMove(event) {
    if (drawing) {
      const { offsetX, offsetY } = event;
      pressure = event.pressure || 1; // Update pressure value (if supported)
      drawLine(previousX, previousY, offsetX, offsetY, pressure, currentBrush, currentColor);
      previousX = offsetX;
      previousY = offsetY;
    }
  }

  function handleEnd() {
    drawing = false;
  }

  // Draw a line between two points
  function drawLine(startX, startY, endX, endY, pressure, brushType, color) {
    const layerIndex = activeLayerIndexMap.get(brushType);
    const layer = getActiveLayer(brushType, layerIndex);
    const lineWidth = calculateLineWidth(pressure, brushType);

    if (layer.clippingMask) {
      // Apply airbrush as a clipping mask
      layer.context.globalCompositeOperation = 'destination-in';
    } else {
      // Set paint strokes to "source-over" mode
      layer.context.globalCompositeOperation = 'source-over';
    }

    layer.context.beginPath();
    layer.context.moveTo(startX, startY);
    layer.context.lineTo(endX, endY);
    layer.context.lineWidth = lineWidth;
    layer.context.lineCap = 'round';
    layer.context.strokeStyle = color;
    layer.context.stroke();
    layer.context.closePath();

    // Restore the globalCompositeOperation to the default mode
    layer.context.globalCompositeOperation = 'source-over';
  }

  // Calculate line width based on pressure, brush type, and brush size
  function calculateLineWidth(pressure, brushType) {
    return pressure * brushSize * brushType.sizeFactor;
  }

  // Get the active layer for a given brush type
  function getActiveLayer(brushType, layerIndex) {
    return layers[brushType][layerIndex];
  }

  // Create a new layer for the current brush type
  function addNewLayer() {
    const layerArray = layers[currentBrush];
    const newLayerCanvas = document.createElement('canvas');
    newLayerCanvas.width = context.canvas.width;
    newLayerCanvas.height = context.canvas.height;
    const newLayer = { context: newLayerCanvas.getContext('2d'), clippingMask: currentBrush.clippingMask };
    layerArray.push(newLayer);
    activeLayerIndexMap.set(currentBrush, layerArray.length - 1);
  }

  // Clear the active layer for the current brush type
  function clearActiveLayer() {
    const layerIndex = activeLayerIndexMap.get(currentBrush);
    const layerArray = layers[currentBrush];
    const layer = layerArray[layerIndex];
    layer.context.clearRect(0, 0, layer.context.canvas.width, layer.context.canvas.height);
  }

  // Handle color change from the color picker
  function handleColorChange(event) {
    currentColor = event.target.value;
  }

  // Handle brush size change from the slider
  function handleBrushSizeChange(event) {
    brushSize = +event.target.value; // Convert the value to a number
  }
</script>

<div>
  <canvas
    id="drawingCanvas"
    width="800"
    height="600"
    style="border: 1px solid black;"
    on:mousedown={handleStart}
    on:touchstart={handleStart}
    on:mousemove={handleMove}
    on:touchmove={handleMove}
    on:mouseup={handleEnd}
    on:touchend={handleEnd}
  ></canvas>

  <!-- Color picker -->
  <input type="color" bind:value={currentColor} on:change={handleColorChange} />

  <!-- Brush size slider -->

  <label>
    Brush Size:
    <input type="range" min="1" max="50" step="1" bind:value={brushSize} on:input={handleBrushSizeChange} />
    {brushSize}
  </label>
</div>

<button on:click={clearActiveLayer}>Clear Active Layer</button>
<button on:click={addNewLayer}>Add New Layer</button>

<!-- Brush selection buttons -->
{#each Object.values(BRUSHES) as brush}
  <button on:click={() => currentBrush = brush}>{brush.name}</button>
{/each}
