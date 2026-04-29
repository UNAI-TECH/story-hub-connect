import { useState, useEffect } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "@/components/ProgressBar";
import StepOne from "@/components/StepOne";
import StepTwo from "@/components/StepTwo";
import SuccessScreen from "@/components/SuccessScreen";
import ResubmitDialog from "@/components/ResubmitDialog";

// ─── Validation schemas ───────────────────────────────────────
export const stepOneSchema = z.object({
  name: z.string().trim().min(1, "Student name is required").max(100),
  standard: z.string().min(1, "Please select a standard"),
  section: z.string().max(50).optional(),
  schoolName: z.string().trim().min(1, "School name is required").max(200),
  parentName: z.string().trim().min(1, "Parent's name is required").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  address: z.string().trim().min(1, "Address is required").max(300),
  promoCode: z.string().optional(),
});

export type StepOneData = z.infer<typeof stepOneSchema>;

const SUBMIT_KEY = "futureForgeSubmitted";

// ─── Component ────────────────────────────────────────────────
const StoryRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);

  const { toast } = useToast();

  const [stepOneData, setStepOneData] = useState<StepOneData>({
    name: "", standard: "", section: "",
    schoolName: "", parentName: "", email: "", mobile: "",
    address: "", promoCode: "",
  });

  useEffect(() => {
    if (sessionStorage.getItem(SUBMIT_KEY) === "true") setShowResubmitDialog(true);
  }, []);

  const handleResubmitConfirm = () => {
    sessionStorage.removeItem(SUBMIT_KEY);
    setShowResubmitDialog(false);
  };
  const handleResubmitCancel = () => {
    sessionStorage.removeItem(SUBMIT_KEY);
    setShowResubmitDialog(false);
    setIsSuccess(true);
  };

  const handleStepOneNext = () => {
    const result = stepOneSchema.safeParse(stepOneData);
    if (!result.success) {
      toast({ variant: "destructive", title: "Please fix the following", description: result.error.errors[0].message });
      return;
    }

    // Check promo code
    const code = (stepOneData.promoCode || "").trim().toUpperCase();
    const valid = code === "VEDAGIRI26";
    setPromoApplied(valid);

    if (code && !valid) {
      toast({ variant: "destructive", title: "Invalid Promo Code", description: "The promo code you entered is not valid." });
      return;
    }

    setDirection("forward");
    setCurrentStep(2);
  };

  const handleBack = () => {
    setDirection("backward");
    setCurrentStep(1);
  };

  // Convert screenshot file to base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (transactionId: string, screenshotFile: File) => {
    setIsSubmitting(true);

    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (scriptUrl && scriptUrl !== "YOUR_WEB_APP_URL_HERE") {
      try {
        const screenshotBase64 = await fileToBase64(screenshotFile);
        await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify({
            action: "submitForm",
            ...stepOneData,
            promoApplied,
            transactionId,
            screenshotName: screenshotFile.name,
            screenshotBase64,
          }),
        });
      } catch {
        // silent — still show success screen
      }
    }

    sessionStorage.setItem(SUBMIT_KEY, "true");
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) return <SuccessScreen promoApplied={promoApplied} />;

  return (
    <>
      {showResubmitDialog && (
        <ResubmitDialog onConfirm={handleResubmitConfirm} onCancel={handleResubmitCancel} />
      )}

      <div className="min-h-screen bg-premium-gradient flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8 opacity-0 animate-fade-up">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/Untitled design (3).png"
                alt="Story Seed Studio Logo"
                className="w-80 h-30 object-contain drop-shadow-lg"
              />
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-3">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">🚀 Summer Boot Camp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
              Future Forge 2026
            </h1>
            <p className="text-primary-foreground/60 text-sm mt-1.5">
              {currentStep === 1 ? "Fill in your details to register for the camp" : "Scan the QR code to complete your payment"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <ProgressBar currentStep={currentStep} totalSteps={2} />
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl opacity-0 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="p-6 sm:p-8">
              {currentStep === 1 && (
                <StepOne data={stepOneData} onChange={setStepOneData} onNext={handleStepOneNext} direction={direction} />
              )}
              {currentStep === 2 && (
                <StepTwo
                  promoApplied={promoApplied}
                  studentName={stepOneData.name}
                  onBack={handleBack}
                  onSubmit={(txnId, file) => handleSubmit(txnId, file)}
                  isSubmitting={isSubmitting}
                  direction={direction}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-primary-foreground/30 text-xs mt-6">
            Your information is safe and secure
          </p>
        </div>
      </div>
    </>
  );
};

export default StoryRegistrationForm;
