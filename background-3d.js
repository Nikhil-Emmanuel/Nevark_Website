/**
 * Lightweight 3D Particle Background
 * Optimized for smooth performance on all devices including mobile
 */

class ParticleBackground {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { 
            alpha: true,
            desynchronized: false // Better performance
        });
        
        this.container.appendChild(this.canvas);
        
        // Performance settings based on device
        this.isMobile = window.innerWidth < 768;
        this.isLowEnd = this.detectLowEndDevice();
        
        // Adjust particle count based on device
        this.particleCount = this.isLowEnd ? 500 : (this.isMobile ? 50 : 80);
        
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationId = null;
        this.isVisible = true;
        
        this.init();
        this.setupEventListeners();
    }
    
    detectLowEndDevice() {
        // Detect low-end devices
        const memory = navigator.deviceMemory; // GB
        const cores = navigator.hardwareConcurrency;
        
        if (memory && memory < 4) return true;
        if (cores && cores < 4) return true;
        
        return false;
    }
    
    init() {
        this.resize();
        this.createParticles();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Recreate particles on resize
        if (this.particles.length > 0) {
            this.createParticles();
        }
    }
    
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                z: Math.random() * 1000,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.5,
                speedZ: (Math.random() - 0.5) * 0.9,
                opacity: Math.random() * 0.7 + 0.3,
                hue: Math.random() * 60 + 200 // Blue to purple range
            });
        }
    }
    
    drawParticles() {
        // Clear with subtle fade for trail effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.z += particle.speedZ;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            if (particle.z < 0) particle.z = 1000;
            if (particle.z > 1000) particle.z = 0;
            
            // Calculate 3D perspective
            const scale = 1000 / (1000 + particle.z);
            const x2d = (particle.x - this.canvas.width / 2) * scale + this.canvas.width / 2;
            const y2d = (particle.y - this.canvas.height / 2) * scale + this.canvas.height / 2;
            const size = particle.size * scale;
            
            // Mouse interaction (only on non-mobile)
            if (!this.isMobile && this.mouse.x !== null) {
                const dx = this.mouse.x - x2d;
                const dy = this.mouse.y - y2d;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    particle.x -= dx * force * 0.09;
                    particle.y -= dy * force * 0.09;
                }
            }
            
            // Draw particle with glow
            const gradient = this.ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
            gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity * scale})`);
            gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 50%, ${particle.opacity * scale * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x2d - size * 1, y2d - size * 3, size * 6, size * 60);
            
            // Draw connections (only on desktop and not low-end)
            if (!this.isLowEnd) {
                this.particles.slice(i + 1).forEach(particle2 => {
                    const scale2 = 1000 / (1000 + particle2.z);
                    const x2d2 = (particle2.x - this.canvas.width / 2) * scale2 + this.canvas.width / 2;
                    const y2d2 = (particle2.y - this.canvas.height / 2) * scale2 + this.canvas.height / 2;
                    
                    const dx = x2d - x2d2;
                    const dy = y2d - y2d2;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        const opacity = (1 - distance / 120) * 0.2;
                        this.ctx.strokeStyle = `rgba(150, 150, 255, ${opacity})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.beginPath();
                        this.ctx.moveTo(x2d, y2d);
                        this.ctx.lineTo(x2d2, y2d2);
                        this.ctx.stroke();
                    }
                });
            }
        });
    }
    
    animate() {
        if (!this.isVisible) return;
        
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    setupEventListeners() {
        // Resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.isMobile = window.innerWidth < 768;
                this.particleCount = this.isLowEnd ? 30 : (this.isMobile ? 50 : 80);
                this.resize();
            }, 250);
        });
        
        // Mouse move (desktop only)
        if (!this.isMobile) {
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.x;
                this.mouse.y = e.y;
            });
            
            window.addEventListener('mouseout', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
        
        // Visibility API - pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.animate();
            } else {
                cancelAnimationFrame(this.animationId);
            }
        });
        
        // Touch move for mobile interaction
        if (this.isMobile) {
            let touchTimeout;
            window.addEventListener('touchmove', (e) => {
                clearTimeout(touchTimeout);
                const touch = e.touches[0];
                this.mouse.x = touch.clientX;
                this.mouse.y = touch.clientY;
                
                touchTimeout = setTimeout(() => {
                    this.mouse.x = null;
                    this.mouse.y = null;
                }, 100);
            });
        }
    }
    
    destroy() {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('mousemove', this.mousemove);
        this.canvas.remove();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackground);
} else {
    initBackground();
}

function initBackground() {
    const container = document.getElementById('bg3d-container');
    if (container) {
        new ParticleBackground('bg3d-container');
    }
}
