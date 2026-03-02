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
  name: z.string().trim().min(1, "Name is required").max(100),
  standard: z.string().optional(),
  section: z.string().max(50).optional(),
  schoolName: z.string().trim().min(1, "School name is required").max(200),
  parentName: z.string().trim().min(1, "Parent's name is required").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
});

export const stepTwoSchema = z.object({
  storyTitle: z.string().trim().min(1, "Story title is required").max(200),
  storyCategory: z.string().optional(),
  classLevel: z.string().optional(),
});

export type StepOneData = z.infer<typeof stepOneSchema>;
export type StepTwoData = z.infer<typeof stepTwoSchema>;

// sessionStorage key used to detect reloads after submission
const SUBMIT_KEY = "storySeedsSubmitted";

// ─── Component ────────────────────────────────────────────────
const StoryRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const { toast } = useToast();

  const [stepOneData, setStepOneData] = useState<StepOneData>({
    name: "",
    standard: "",
    section: "",
    schoolName: "",
    parentName: "",
    email: "",
    mobile: "",
  });

  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    storyTitle: "",
    storyCategory: "",
    classLevel: "",
  });

  // ── On mount: show resubmit dialog if user reloaded after submitting ──
  useEffect(() => {
    if (sessionStorage.getItem(SUBMIT_KEY) === "true") {
      setShowResubmitDialog(true);
    }
  }, []);

  // ── Resubmit dialog handlers ──────────────────────────────────
  const handleResubmitConfirm = () => {
    // Clear the flag and let the user refill + resubmit
    sessionStorage.removeItem(SUBMIT_KEY);
    setShowResubmitDialog(false);
  };

  const handleResubmitCancel = () => {
    // Go straight to success screen (treat reload as "already submitted")
    sessionStorage.removeItem(SUBMIT_KEY);
    setShowResubmitDialog(false);
    setIsSuccess(true);
  };

  // ── Step navigation ───────────────────────────────────────────
  const handleStepOneNext = () => {
    const result = stepOneSchema.safeParse(stepOneData);
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Please fix the following",
        description: result.error.errors[0].message,
      });
      return;
    }
    setDirection("forward");
    setCurrentStep(2);
  };

  const handleBack = () => {
    setDirection("backward");
    setCurrentStep(1);
  };

  // ── Two-phase submission ──────────────────────────────────────
  const handleSubmit = async () => {
    const result = stepTwoSchema.safeParse(stepTwoData);
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Please fix the following",
        description: result.error.errors[0].message,
      });
      return;
    }

    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!scriptUrl || scriptUrl === "YOUR_WEB_APP_URL_HERE") {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Google Script URL not set in .env",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ── Phase 1: submit text data immediately (fast) ──────────
      const textPayload = {
        action: "submitForm",
        ...stepOneData,
        ...stepTwoData,
      };

      const textRes = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify(textPayload),
      });
      const textJson = await textRes.json();

      if (!textJson.success) {
        throw new Error(textJson.error || "Form submission failed");
      }

      const submissionId: number = textJson.submissionId;

      // ── Mark as submitted BEFORE showing success (for reload detection) ──
      sessionStorage.setItem(SUBMIT_KEY, "true");
      setIsSubmitting(false);
      setIsSuccess(true);

      // ── Phase 2: upload video in the background (non-blocking) ──
      if (videoFile && submissionId) {
        uploadVideoInBackground(scriptUrl, videoFile, submissionId);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err.message || "Something went wrong. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  // ── Background video upload (fire-and-forget) ─────────────────
  const uploadVideoInBackground = async (
    scriptUrl: string,
    file: File,
    submissionId: number
  ) => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "uploadVideo",
          submissionId,
          videoBase64: base64,
          videoName: file.name,
        }),
      });
    } catch {
      // Background upload failure is silent — data row is already saved
    }
  };

  // ─── Render ──────────────────────────────────────────────────
  if (isSuccess) {
    return <SuccessScreen />;
  }

  return (
    <>
      {/* Resubmit dialog (shown on reload after successful submission) */}
      {showResubmitDialog && (
        <ResubmitDialog
          onConfirm={handleResubmitConfirm}
          onCancel={handleResubmitCancel}
        />
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
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
              Story Registration
            </h1>
            <p className="text-primary-foreground/50 text-sm mt-1.5">
              Two simple steps to register your story
            </p>
          </div>

          {/* Progress Bar */}
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <ProgressBar currentStep={currentStep} totalSteps={2} />
          </div>

          {/* Form Card */}
          <div
            className="glass-card rounded-2xl opacity-0 animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="p-6 sm:p-8">
              {currentStep === 1 && (
                <StepOne
                  data={stepOneData}
                  onChange={setStepOneData}
                  onNext={handleStepOneNext}
                  direction={direction}
                />
              )}
              {currentStep === 2 && (
                <StepTwo
                  data={stepTwoData}
                  onChange={setStepTwoData}
                  videoFile={videoFile}
                  onVideoChange={setVideoFile}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
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
