export class State {
    constructor() {
        this.canvasWidth = 1080;
        this.canvasHeight = 1080;
        this.bgColor = '#ffffff';
        this.images = []; // Array of image objects { id, img, x, y, width, height, rotation }
        this.selectedId = null;
        this.listeners = new Set();
    }

    subscribe(callback) {
        this.listeners.add(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this));
    }

    setCanvasSize(width, height) {
        this.canvasWidth = parseInt(width);
        this.canvasHeight = parseInt(height);
        this.notify();
    }

    setBackgroundColor(color) {
        this.bgColor = color;
        this.notify();
    }

    addImage(imgElement) {
        // Calculate initial scale to fit nicely
        let w = imgElement.naturalWidth;
        let h = imgElement.naturalHeight;
        
        // If image is huge, scale it down initially
        const maxInitSize = Math.min(this.canvasWidth, this.canvasHeight) * 0.5;
        if (w > maxInitSize || h > maxInitSize) {
            const ratio = Math.min(maxInitSize / w, maxInitSize / h);
            w *= ratio;
            h *= ratio;
        }

        const newImage = {
            id: Date.now() + Math.random().toString(),
            img: imgElement,
            x: (this.canvasWidth - w) / 2,
            y: (this.canvasHeight - h) / 2,
            width: w,
            height: h,
            rotation: 0
        };

        this.images.push(newImage);
        this.selectedId = newImage.id;
        this.notify();
    }

    updateImage(id, updates) {
        const img = this.images.find(i => i.id === id);
        if (img) {
            Object.assign(img, updates);
            this.notify();
        }
    }

    selectImage(id) {
        this.selectedId = id;
        this.notify();
    }

    deleteSelected() {
        if (this.selectedId) {
            this.images = this.images.filter(i => i.id !== this.selectedId);
            this.selectedId = null;
            this.notify();
        }
    }

    getSelectedImage() {
        return this.images.find(i => i.id === this.selectedId);
    }
}

