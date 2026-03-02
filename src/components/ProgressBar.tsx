import { Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const steps = [
    { num: 1, label: "Personal Details" },
    { num: 2, label: "Story Details" },
  ];

  // Track animation state
  const [isAnimating, setIsAnimating] = useState(false);
  // 'forward' = step1→step2 (car goes left→right), 'backward' = step2→step1 (car goes right→left)
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  // Whether car is at destination end (right side for forward, left for backward)
  const [atEnd, setAtEnd] = useState(false);
  const prevStep = useRef(currentStep);

  useEffect(() => {
    if (currentStep === prevStep.current) return;

    const isForward = currentStep > prevStep.current;
    prevStep.current = currentStep;

    setDirection(isForward ? "forward" : "backward");
    setAtEnd(false);
    setIsAnimating(true);

    // Small tick to let the browser paint the start position before transitioning
    const startTimer = setTimeout(() => {
      setAtEnd(true);
    }, 30);

    // Hide car after animation completes (~1s animation + small buffer)
    const endTimer = setTimeout(() => {
      setIsAnimating(false);
      setAtEnd(false);
    }, 1050);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [currentStep]);

  // Car position logic:
  // forward: starts at left (0%), races to right (~90%)
  // backward: starts at right (~90%), races to left (0%)
  const carLeft = direction === "forward"
    ? (atEnd ? "calc(100% - 40px)" : "0%")
    : (atEnd ? "0%" : "calc(100% - 40px)");




  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting line track */}
        <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-border overflow-visible">
          {/* Filled progress line */}
          <div
            className="h-full bg-secondary"
            style={{
              width: currentStep > 1 ? "100%" : "0%",
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {/* Racing car — only mounts during animation */}
          {isAnimating && (
            <div
              style={{
                position: "absolute",
                top: "-28px",
                left: carLeft,
                transition: atEnd
                  ? "left 0.95s cubic-bezier(0.2, 0, 0.05, 1)"
                  : "none",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              <img
                src={
                  direction === "forward"
                    ? "/white-sport-car-on-transparent-background-3d-rendering-illustration-free-png - Copy.png"
                    : "/white-sport-car-on-transparent-background-3d-rendering-illustration-free-png.png"
                }
                alt="Racing Car"
                style={{
                  width: "80px",
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 10px rgba(234,179,8,0.9))",
                }}
              />
            </div>
          )}
        </div>

        {steps.map((step) => (
          <div key={step.num} className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-500 ${step.num < currentStep
                  ? "bg-success text-success-foreground shadow-md"
                  : step.num === currentStep
                    ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30"
                    : "bg-card text-muted-foreground border-2 border-border"
                }`}
            >
              {step.num < currentStep ? (
                <Check className="w-4 h-4" strokeWidth={3} />
              ) : (
                step.num
              )}
            </div>
            <span className="mt-2 text-xs font-medium tracking-wide text-white">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
