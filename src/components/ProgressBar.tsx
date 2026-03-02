import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const steps = [
    { num: 1, label: "Personal Details" },
    { num: 2, label: "Story Details" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-border">
          <div
            className="h-full bg-secondary transition-all duration-700 ease-out"
            style={{ width: currentStep > 1 ? "100%" : "0%" }}
          />
        </div>

        {steps.map((step) => (
          <div key={step.num} className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-500 ${
                  step.num < currentStep
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
            <span
              className={`mt-2 text-xs font-medium tracking-wide transition-colors duration-300 ${
                step.num <= currentStep ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
