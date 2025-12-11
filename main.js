import { State } from './state.js';
import { Renderer } from './renderer.js';
import { InteractionHandler } from './interaction.js';

// Elements
const canvas = document.getElementById('main-canvas');
const workspace = document.getElementById('workspace');
const canvasWrapper = document.getElementById('canvas-wrapper');
const fileInput = document.getElementById('file-input');
const btnDownload = document.getElementById('btn-download');
const btnDelete = document.getElementById('btn-delete');
const inpWidth = document.getElementById('inp-width');
const inpHeight = document.getElementById('inp-height');
const inpColor = document.getElementById('inp-bg-color');
const selectionControls = document.getElementById('selection-controls');

// Initialize State
const state = new State();

// Initialize Renderer
const renderer = new Renderer(canvas, state);

// Initialize Interactions
const interactions = new InteractionHandler(canvas, state, renderer);

// Resize Observer to scale canvas wrapper
function updateWrapperTransform() {
    const wsRect = workspace.getBoundingClientRect();
    const cWidth = state.canvasWidth;
    const cHeight = state.canvasHeight;
    
    // Add some padding
    const padding = 20;
    const availW = wsRect.width - padding * 2;
    const availH = wsRect.height - padding * 2;

    const scale = Math.min(availW / cWidth, availH / cHeight, 1); // Max scale 1 (optional, can be > 1 to zoom)

    canvasWrapper.style.transform = `scale(${scale})`;
    canvasWrapper.style.width = `${cWidth}px`;
    canvasWrapper.style.height = `${cHeight}px`;
}

// Sync State with UI
state.subscribe((s) => {
    // Update Canvas Element Size
    if (canvas.width !== s.canvasWidth || canvas.height !== s.canvasHeight) {
        canvas.width = s.canvasWidth;
        canvas.height = s.canvasHeight;
        updateWrapperTransform();
    }

    // Update UI Values
    if (document.activeElement !== inpWidth) inpWidth.value = s.canvasWidth;
    if (document.activeElement !== inpHeight) inpHeight.value = s.canvasHeight;
    if (document.activeElement !== inpColor) inpColor.value = s.bgColor;

    // Show/Hide selection controls
    if (s.selectedId) {
        selectionControls.style.display = 'flex';
        selectionControls.style.opacity = '1';
    } else {
        selectionControls.style.opacity = '0.5';
        // Keep display flex but reduce opacity to avoid layout jumps, 
        // or toggle display if space is tight.
    }

    // Render
    renderer.render();
});

// Event Listeners for UI
window.addEventListener('resize', updateWrapperTransform);

inpWidth.addEventListener('change', (e) => state.setCanvasSize(e.target.value, state.canvasHeight));
inpHeight.addEventListener('change', (e) => state.setCanvasSize(state.canvasWidth, e.target.value));
inpColor.addEventListener('input', (e) => state.setBackgroundColor(e.target.value));

btnDelete.addEventListener('click', () => state.deleteSelected());

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(processFile);
    e.target.value = ''; // Reset
});

btnDownload.addEventListener('click', () => {
    // Temporarily deselect to hide handles
    const prevSelection = state.selectedId;
    state.selectImage(null);
    renderer.render(); // Render clean

    // Download
    const link = document.createElement('a');
    link.download = `composition-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    // Restore selection
    state.selectImage(prevSelection);
});

// Paste Support
window.addEventListener('paste', (e) => {
    e.preventDefault();
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            processFile(blob);
        }
    }
});

function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => state.addImage(img);
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Initial render
updateWrapperTransform();
renderer.render();

