/**
 * Simple Confetti Animation
 * Lightweight implementation for celebration effects
 */
export class Confetti {
    static start(duration = 3000) {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        // Particles
        const particles = [];
        const particleCount = 150;
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff'];

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height - height;
                this.rotation = Math.random() * 360;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.size = Math.random() * 10 + 5;
                this.speedY = Math.random() * 3 + 2;
                this.speedX = Math.random() * 2 - 1;
                this.speedRotation = Math.random() * 2 - 1;
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.speedRotation;

                if (this.y > height) {
                    this.y = -10;
                    this.x = Math.random() * width;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.restore();
            }
        }

        // Init particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation Loop
        let active = true;

        const animate = () => {
            if (!active) return;

            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        setTimeout(() => {
            active = false;
            canvas.style.transition = 'opacity 1s';
            canvas.style.opacity = '0';
            setTimeout(() => {
                canvas.remove();
                window.removeEventListener('resize', resize);
            }, 1000);
        }, duration);
    }
}
