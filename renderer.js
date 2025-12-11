export class Renderer {
    constructor(canvas, state) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = state;
        
        // Handle styling
        this.handleSize = 20; // Size of resize handles
        this.handleColor = '#4CAF50';
        this.selectionColor = '#2196F3';
    }

    render() {
        const { width, height } = this.canvas;
        const ctx = this.ctx;
        const state = this.state;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw Background
        ctx.fillStyle = state.bgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw Images
        state.images.forEach(imgObj => {
            ctx.save();
            // Translate to center of image for rotation
            const centerX = imgObj.x + imgObj.width / 2;
            const centerY = imgObj.y + imgObj.height / 2;
            
            ctx.translate(centerX, centerY);
            ctx.rotate(imgObj.rotation);
            ctx.translate(-centerX, -centerY);

            ctx.drawImage(imgObj.img, imgObj.x, imgObj.y, imgObj.width, imgObj.height);
            ctx.restore();
        });

        // Draw Selection Overlay
        if (state.selectedId) {
            const selected = state.getSelectedImage();
            if (selected) {
                this.drawSelectionGizmo(selected);
            }
        }
    }

    drawSelectionGizmo(imgObj) {
        const ctx = this.ctx;
        ctx.save();
        
        // Helper to transform context to match image
        const centerX = imgObj.x + imgObj.width / 2;
        const centerY = imgObj.y + imgObj.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(imgObj.rotation);
        ctx.translate(-centerX, -centerY);

        // Draw Border
        ctx.strokeStyle = this.selectionColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(imgObj.x, imgObj.y, imgObj.width, imgObj.height);

        // Draw Handles
        ctx.fillStyle = this.handleColor;
        const halfHandle = this.handleSize / 2;

        const handles = [
            { x: imgObj.x, y: imgObj.y }, // Top Left
            { x: imgObj.x + imgObj.width, y: imgObj.y }, // Top Right
            { x: imgObj.x + imgObj.width, y: imgObj.y + imgObj.height }, // Bottom Right
            { x: imgObj.x, y: imgObj.y + imgObj.height } // Bottom Left
        ];

        handles.forEach(h => {
            ctx.fillRect(h.x - halfHandle, h.y - halfHandle, this.handleSize, this.handleSize);
            ctx.strokeRect(h.x - halfHandle, h.y - halfHandle, this.handleSize, this.handleSize);
        });

        ctx.restore();
    }
}

