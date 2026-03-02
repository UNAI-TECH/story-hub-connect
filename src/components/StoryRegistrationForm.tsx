import { useState, useRef } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "@/components/ProgressBar";
import StepOne from "@/components/StepOne";
import StepTwo from "@/components/StepTwo";
import SuccessScreen from "@/components/SuccessScreen";

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

  // Step 1 form data
  const [stepOneData, setStepOneData] = useState<StepOneData>({
    name: "",
    standard: "",
    section: "",
    schoolName: "",
    parentName: "",
    email: "",
    mobile: "",
  });

  // Step 2 form data
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    storyTitle: "",
    storyCategory: "",
    classLevel: "",
  });

  const handleStepOneNext = () => {
    const result = stepOneSchema.safeParse(stepOneData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: firstError.message,
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
      const firstError = result.error.errors[0];
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: firstError.message,
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-primary-foreground mb-2">
            Story Registration
          </h1>
          <p className="text-primary-foreground/70 text-sm sm:text-base">
            Register your story in just two simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} totalSteps={2} />

        {/* Form Card */}
        <div className="bg-card rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
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
      </div>
    </div>
  );
};

export default StoryRegistrationForm;
