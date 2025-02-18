// Confetti Explosion
const duration = 5 * 1000; // Duration: 5 seconds
const end = Date.now() + duration;

const colors = ['#FFFF00','#ffffff'];

(function frame() {
    confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
    });
    confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
    });

    if (Date.now() < end) {
        requestAnimationFrame(frame);
    }
})();
