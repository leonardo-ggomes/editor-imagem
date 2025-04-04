import { Pane } from './res/tweakpane-4.0.5/tweakpane-4.0.5.min.js';

class ImageEditor {

    img = new Image();
    pane = new Pane({
        position: 'absolute'
    });
    canvas = document.getElementById("studio");
    ctx = this.canvas.getContext("2d");

    isDragging = false;
    offsetX = 0;
    offsetY = 0;
    imageX = 0;
    imageY = 0;

    gridSpacing = 20; // Tamanho inicial do grid
    minGridSpacing = 5; // Tamanho mínimo do grid
    maxGridSpacing = 100; // Tamanho máximo do grid

    constructor() {
        this.pane.title = "Editor de imagem";
        
        // Inicializar os parâmetros do filtro
        this.filters = {
            contrast: 100,
            brightness: 100,
            saturate: 100,
            blurEffect: 0,
            grayscale: 0,
            hue: 0,
            sepia: 0,
            invert: 0,
            opacity: 100,
            rotate: 0,
            scale: 1,
            dropShadow: 0,
            background: '#ffffff',
        };

        window.addEventListener('resize', () => this.resizeCanvas());

        this.canvas.addEventListener('mousedown', this.startDrag.bind(this));
        this.canvas.addEventListener('mousemove', this.dragImage.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrag.bind(this));
    
        this.canvas.addEventListener('mousemove', this.dragImage.bind(this));
        this.canvas.addEventListener('wheel', this.handleScroll.bind(this)); // Evento de scroll
        this.adjustCanvasResolution();
        this.drawGrid();
        this.initializeControls();
    }

    startDrag(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Verifica se o mouse está dentro da área da imagem
        if (
            mouseX >= this.imageX &&
            mouseX <= this.imageX + this.img.width * this.filters.scale &&
            mouseY >= this.imageY &&
            mouseY <= this.imageY + this.img.height * this.filters.scale
        ) {
            this.isDragging = true; // Começa o arraste
            this.offsetX = mouseX - this.imageX; // Calcula a posição relativa
            this.offsetY = mouseY - this.imageY;
        }
    }

    stopDrag() {
        this.isDragging = false; // Finaliza o arraste
    }


    adjustCanvasResolution() {
        const ratio = window.devicePixelRatio || 1; // Pega a densidade de pixels da tela (normalmente 1 ou 2 para telas de alta resolução)

        // Armazena o tamanho original do canvas
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        // Define o tamanho real (em pixels) levando em consideração o ratio
        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;

        // Ajusta a escala de transformação para que as linhas e imagens sejam desenhadas corretamente
        this.ctx.scale(ratio, ratio);
    }

    

    // Função chamada enquanto o mouse está se movendo
    dragImage(event) {
        if (this.isDragging) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            // Atualizar o deslocamento da imagem
            this.offsetX = mouseX - this.imageWidth / 2;
            this.offsetY = mouseY - this.imageHeight / 2;

            // Redesenha o canvas com a imagem movida
            this.applyFilters();
            this.drawGrid();
        }
    }
    
    
    stopDrag() {
        this.isDragging = false; // Finaliza o arraste
    }


   
    // Lida com o scroll para ajustar o grid
    handleScroll(event) {
        if (event.deltaY < 0) {
            // Scroll para cima (aumenta o grid)
            this.gridSpacing = Math.min(this.gridSpacing + 1, this.maxGridSpacing);
        } else {
            // Scroll para baixo (diminui o grid)
            this.gridSpacing = Math.max(this.gridSpacing - 1, this.minGridSpacing);
        }

        // Redesenhar o grid com o novo tamanho
        this.drawGrid();
    }

    // Inicializa os controles do painel
    initializeControls() {
        this.filtersFolder = this.pane.addFolder({ title: 'Filtros' });
        this.filtersFolder.addBinding(this.filters, 'contrast', { min: 0, max: 200, label: 'Contrast' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'brightness', { min: 0, max: 200, label: 'Brightness' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'saturate', { min: 0, max: 200, label: 'Saturate' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'blurEffect', { min: 0, max: 10, step: 0.1, label: 'Blur' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'grayscale', { min: 0, max: 100, label: 'Grayscale' }).on('change', () => this.applyFilters());

        this.filtersFolder.addBinding(this.filters, 'hue', { min: 0, max: 360, label: 'Hue' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'sepia', { min: 0, max: 100, label: 'Sepia' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'invert', { min: 0, max: 100, label: 'Invert' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'opacity', { min: 0, max: 100, label: 'Opacity' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'rotate', { min: 0, max: 360, label: 'Rotate' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'scale', { min: 0.1, max: 3.0, label: 'Scale' }).on('change', () => this.applyFilters());
        this.filtersFolder.addBinding(this.filters, 'dropShadow', { min: 0, max: 100, label: 'dropShadown' }).on('change', () => this.applyFilters());

        this.filtersFolder.addBinding(this.filters, 'background', { picker: 'inline', expanded: true });

        this.filtersFolder = this.pane.addFolder({ title: 'Importar' });
        this.filtersFolder.addButton({
            title: 'Importar imagem'
        }).on('click', () => this.handleImageUpload());

        this.filtersFolder = this.pane.addFolder({ title: 'Padrão' });
        this.filtersFolder.addButton({
            title: 'Resetar'
        }).on('click', () => this.resetFilters());

        this.filtersFolder = this.pane.addFolder({ title: 'Exportar' });
        this.filtersFolder.addButton({
            title: 'Imagem'
        }).on('click', () => this.downloadImage());
    }

    // Lida com o upload da imagem
    handleImageUpload() {
        const reader = new FileReader();
        const input = document.createElement("input");
        input.type = "file";

        input.addEventListener("change", (event) => {
            const file = event.target.files[0];
            reader.onload = (e) => {
                this.img.onload = () => {
                    this.canvas.width = this.img.width;
                    this.canvas.height = this.img.height;
                    this.applyFilters();
                };
                this.img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });

        input.click();
    }

    // Aplica os filtros na imagem com base nos valores dos controles
    applyFilters() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.filter = `
        contrast(${this.filters.contrast}%)
        brightness(${this.filters.brightness}%)
        saturate(${this.filters.saturate}%)
        blur(${this.filters.blurEffect}px)
        grayscale(${this.filters.grayscale}%)
        hue-rotate(${this.filters.hue}deg)
        sepia(${this.filters.sepia}%)
        invert(${this.filters.invert}%)
        opacity(${this.filters.opacity}%)
        `;
        this.ctx.shadowOffsetX = this.filters.dropShadow;
        this.ctx.shadowOffsetY = this.filters.dropShadow;
        this.ctx.shadowBlur = this.filters.dropShadow;
        this.ctx.shadowColor = this.filters.background;

        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate((this.filters.rotate * Math.PI) / 180);
        this.ctx.scale(this.filters.scale, this.filters.scale);

        this.ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2, this.img.width, this.img.height);
        this.ctx.restore();
    }

    // Função para redimensionar o canvas ao mudar o tamanho da tela
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.applyFilters();
        this.drawGrid();
    }

    // Desenha o grid
    drawGrid() {
        const lineWidth = 0.5;
        const gridColor = 'rgba(255, 255, 255, 0.3)'; 

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = lineWidth;

        for (let x = this.gridSpacing; x < this.canvas.width; x += this.gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = this.gridSpacing; y < this.canvas.height; y += this.gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    downloadImage() {
        const imageUrl = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'imagem_editada.png';
        link.click();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const editor = new ImageEditor();
});
