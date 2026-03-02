import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const SuccessScreen = () => {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Fire confetti from both sides
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#9e1a1a", "#ffc105", "#ffffff", "#2ecc71"]
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#9e1a1a", "#ffc105", "#ffffff", "#2ecc71"]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Big initial burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#9e1a1a", "#ffc105", "#ffffff", "#2ecc71"]
    });

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-premium-gradient flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated SVG Checkmark */}
        <div className="animate-scale-up mb-8 flex justify-center">
          <svg className="success-checkmark" viewBox="0 0 52 52">
            <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.8s" }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
            Registration Successful!
          </h2>
          <p className="text-primary-foreground/70 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
            Your Registration Has Been Successfully Submitted!
          </p>
        </div>

        <div className="opacity-0 animate-fade-up mt-10" style={{ animationDelay: "1.2s" }}>
          





        </div>
      </div>
    </div>);

};

export default SuccessScreen;