/**
 * Animated Wave Background
 * Ported from home.html for unified use across pages
 */

class WaveBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.t = 0;
        this.waves = [...Array(8)].map(() => ({
            val: Math.random() * 0.5 + 0.2,
            tgt: Math.random() * 0.5 + 0.2,
            spd: Math.random() * 0.01 + 0.005,
        }));

        this.isAnimating = true;
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Use visibility API to pause animation when tab is not visible
        document.addEventListener('visibilitychange', () => {
            this.isAnimating = !document.hidden;
            if (this.isAnimating) this.animate();
        });

        // Start animation after a brief delay
        setTimeout(() => this.animate(), 100);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateWave() {
        this.waves.forEach((w) => {
            if (Math.random() < 0.02) w.tgt = Math.random() * 0.6 + 0.2;
            w.val += (w.tgt - w.val) * w.spd;
        });
    }

    drawWave() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reduce wave count on mobile for better performance
        const waveCount = window.innerWidth < 768 ? 4 : this.waves.length;
        // Draw every 2-4 pixels instead of every pixel for performance
        const step = window.innerWidth < 768 ? 4 : 2;
        
        for (let i = 0; i < waveCount; i++) {
            const f = this.waves[i].val * 7;
            this.ctx.beginPath();
            for (let x = 0; x <= this.canvas.width; x += step) {
                const nx = (x / this.canvas.width) * 2 - 1;
                const y = Math.sin((nx + i * 0.05 + this.t) * 6) * Math.cos((nx + this.t) * 3) * f * 8 + this.canvas.height / 2;
                x === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
            }
            const r = 79 + f * 60, g = 70 + f * 100, b = 229;
            this.ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`;
            this.ctx.lineWidth = 1 + i * 0.25;
            this.ctx.stroke();
        }
    }

    animate() {
        if (!this.isAnimating) return;
        this.t += 0.003;
        this.updateWave();
        this.drawWave();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bgWave')) {
        new WaveBackground('bgWave');
    }
});
