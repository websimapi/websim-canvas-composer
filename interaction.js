export class InteractionHandler {
    constructor(canvas, state, renderer) {
        this.canvas = canvas;
        this.state = state;
        this.renderer = renderer;
        
        this.isDragging = false;
        this.isResizing = false;
        this.activeHandle = null; // 'tl', 'tr', 'br', 'bl'
        this.dragStart = { x: 0, y: 0 };
        this.initialObjState = null;

        this.setupEvents();
    }

    setupEvents() {
        // Pointer events cover mouse and touch
        this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));
        window.addEventListener('pointermove', this.onPointerMove.bind(this));
        window.addEventListener('pointerup', this.onPointerUp.bind(this));
    }

    // Helper to get coordinates in canvas space
    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    onPointerDown(e) {
        const coords = this.getCanvasCoordinates(e);
        const selected = this.state.getSelectedImage();
        
        // 1. Check if hitting a resize handle of selected image
        if (selected) {
            const handle = this.getHitHandle(selected, coords);
            if (handle) {
                this.isResizing = true;
                this.activeHandle = handle;
                this.dragStart = coords;
                this.initialObjState = { ...selected };
                e.preventDefault();
                return;
            }
        }

        // 2. Check if hitting an image
        // Iterate in reverse to hit top-most first
        const clickedImage = [...this.state.images].reverse().find(img => 
            this.isPointInImage(img, coords)
        );

        if (clickedImage) {
            this.state.selectImage(clickedImage.id);
            this.isDragging = true;
            this.dragStart = coords;
            this.initialObjState = { ...clickedImage };
        } else {
            this.state.selectImage(null);
        }
    }

    onPointerMove(e) {
        if (!this.isDragging && !this.isResizing) return;
        
        const coords = this.getCanvasCoordinates(e);
        const dx = coords.x - this.dragStart.x;
        const dy = coords.y - this.dragStart.y;
        
        if (this.isDragging) {
            const newX = this.initialObjState.x + dx;
            const newY = this.initialObjState.y + dy;
            this.state.updateImage(this.state.selectedId, { x: newX, y: newY });
        }
        
        if (this.isResizing) {
            this.handleResize(dx, dy);
        }
    }

    onPointerUp(e) {
        this.isDragging = false;
        this.isResizing = false;
        this.activeHandle = null;
    }

    isPointInImage(img, coords) {
        // Simple AABB check (ignoring rotation for hit testing simplicity)
        // If we wanted rotation support, we'd inverse transform the point
        return coords.x >= img.x && coords.x <= img.x + img.width &&
               coords.y >= img.y && coords.y <= img.y + img.height;
    }

    getHitHandle(img, coords) {
        const handleSize = 30; // Larger hit area than visual
        const half = handleSize / 2;
        
        const handles = {
            'tl': { x: img.x, y: img.y },
            'tr': { x: img.x + img.width, y: img.y },
            'br': { x: img.x + img.width, y: img.y + img.height },
            'bl': { x: img.x, y: img.y + img.height }
        };

        for (const [key, pos] of Object.entries(handles)) {
            if (Math.abs(coords.x - pos.x) < half && Math.abs(coords.y - pos.y) < half) {
                return key;
            }
        }
        return null;
    }

    handleResize(dx, dy) {
        const init = this.initialObjState;
        let newX = init.x;
        let newY = init.y;
        let newW = init.width;
        let newH = init.height;

        // Aspect Ratio Lock
        const aspect = init.width / init.height;

        // Logic for each handle
        if (this.activeHandle === 'br') {
            newW = init.width + dx;
            newH = newW / aspect; // Lock aspect
        } else if (this.activeHandle === 'bl') {
            newW = init.width - dx;
            newX = init.x + dx;
            newH = newW / aspect;
        } else if (this.activeHandle === 'tr') {
            newW = init.width + dx;
            newH = newW / aspect;
            newY = init.y + (init.height - newH);
        } else if (this.activeHandle === 'tl') {
            newW = init.width - dx;
            newX = init.x + dx;
            newH = newW / aspect;
            newY = init.y + (init.height - newH);
        }

        // Min size check
        if (newW < 20 || newH < 20) return;

        this.state.updateImage(this.state.selectedId, {
            x: newX,
            y: newY,
            width: newW,
            height: newH
        });
    }
}

