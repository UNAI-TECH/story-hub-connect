import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface SuccessScreenProps {
  promoApplied?: boolean;
}

const SuccessScreen = ({ promoApplied }: SuccessScreenProps) => {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

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
      <div className="text-center max-w-md">
        {/* Animated SVG Checkmark */}
        <div className="animate-scale-up mb-8 flex justify-center">
          <svg className="success-checkmark" viewBox="0 0 52 52">
            <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.8s" }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
            Registration Confirmed! 🎉
          </h2>
          <p className="text-primary-foreground/70 text-sm sm:text-base leading-relaxed mb-2">
            Welcome to <strong className="text-blue-300">Future Forge 2026</strong> by Story Seed Studio!
          </p>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            {promoApplied
              ? "Your discounted registration has been submitted. We'll get in touch with you soon!"
              : "Your registration has been successfully submitted. We'll get in touch with you soon!"}
          </p>

          {promoApplied && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 rounded-full px-4 py-1.5">
              <span className="text-xs font-bold text-blue-300">✦ Promo Discount Applied</span>
            </div>
          )}
        </div>

        <div className="opacity-0 animate-fade-up mt-10" style={{ animationDelay: "1.2s" }}>
          <button
            onClick={() => window.open("https://storyseed.in/", "_blank")}
            className="btn-premium"
          >
            Visit Story Seed Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;