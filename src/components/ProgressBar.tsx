interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-6 animate-fade-in">
      {/* Step labels */}
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                step <= currentStep
                  ? "bg-secondary text-secondary-foreground shadow-lg"
                  : "bg-primary-foreground/20 text-primary-foreground/60"
              }`}
            >
              {step}
            </div>
            <span className="text-primary-foreground/80 text-sm font-medium hidden sm:inline">
              {step === 1 ? "Personal Details" : "Story Details"}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar track */}
      <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
        <div
          className="h-full gradient-gold rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
