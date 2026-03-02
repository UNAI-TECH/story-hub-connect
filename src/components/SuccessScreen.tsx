const SuccessScreen = () => {
  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="text-center animate-scale-up">
        {/* Animated SVG Checkmark */}
        <svg className="success-checkmark mx-auto mb-8" viewBox="0 0 52 52">
          <circle
            className="success-checkmark__circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            className="success-checkmark__check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>

        <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary-foreground mb-4">
          Registration Successful!
        </h2>
        <p className="text-primary-foreground/80 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Your Registration Has Been Successfully Submitted!
        </p>

        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="py-3 px-8 gradient-gold text-secondary-foreground font-semibold rounded-lg 
              hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            Submit Another Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
