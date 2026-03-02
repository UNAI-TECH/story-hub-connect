import { useState } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "@/components/ProgressBar";
import StepOne from "@/components/StepOne";
import StepTwo from "@/components/StepTwo";
import SuccessScreen from "@/components/SuccessScreen";
import { BookOpen } from "lucide-react";

// Validation schemas
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

const StoryRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [videoFile, setVideoFile] = useState<File | null>(null);
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
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-premium-gradient flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 opacity-0 animate-fade-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/20 mb-4 animate-float">
            <BookOpen className="w-7 h-7 text-secondary" />
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
  );
};

export default StoryRegistrationForm;
