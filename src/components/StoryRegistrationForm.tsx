import { useState, useEffect, useRef } from "react";
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

const SUBMIT_KEY = "storySeedsSubmitted";

// 5 MB per chunk (must be multiple of 256 KB: 5×1024×1024 = 20×256 KB ✓)
const CHUNK_SIZE = 5 * 1024 * 1024;

// ─── Component ────────────────────────────────────────────────
const StoryRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);

  // ── Video upload state ────────────────────────────────────
  const [uploadProgress, setUploadProgress] = useState(0);   // 0–100
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadedFileId, setUploadedFileId] = useState("");
  const [uploadedVideoName, setUploadedVideoName] = useState("");
  const abortRef = useRef(false);

  const { toast } = useToast();

  const [stepOneData, setStepOneData] = useState<StepOneData>({
    name: "", standard: "", section: "",
    schoolName: "", parentName: "", email: "", mobile: "",
  });
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>({
    storyTitle: "", storyCategory: "", classLevel: "",
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
    setDirection("forward");
    setCurrentStep(2);
  };

  const handleBack = () => {
    setDirection("backward");
    setCurrentStep(1);
  };

  // ── Converts a slice of a File into a base64 string ──────────
  const sliceToBase64 = (file: File, start: number, end: number): Promise<string> =>
    new Promise((resolve, reject) => {
      const slice = file.slice(start, end);
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(slice);
    });

  // ── Upload video in 5 MB chunks via Apps Script proxy ────────
  const uploadVideoChunked = async (
    scriptUrl: string,
    file: File
  ): Promise<string> => {
    const total = file.size;

    // Step 1: init upload session
    const initRes = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "initUpload", videoName: file.name, fileSize: total }),
    });
    const initJson = await initRes.json();
    if (!initJson.success || !initJson.sessionId) {
      throw new Error(initJson.error || "Could not start upload");
    }
    const sessionId = initJson.sessionId;

    // Step 2: send chunks one by one
    let fileId = "";
    let offset = 0;
    let chunkIndex = 0;
    const totalChunks = Math.ceil(total / CHUNK_SIZE);

    while (offset < total) {
      if (abortRef.current) throw new Error("Upload cancelled");

      const end = Math.min(offset + CHUNK_SIZE, total);
      const chunkBase64 = await sliceToBase64(file, offset, end);

      const chunkRes = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "uploadChunk",
          sessionId,
          chunkBase64,
          start: offset,
          end: end - 1,  // inclusive byte range
          total,
        }),
      });
      const chunkJson = await chunkRes.json();
      if (!chunkJson.success) throw new Error(chunkJson.error || "Chunk upload failed");

      chunkIndex++;
      const pct = Math.round((chunkIndex / totalChunks) * 100);
      setUploadProgress(Math.min(pct, 99)); // hold at 99 until final confirm

      if (chunkJson.status === "complete") {
        fileId = chunkJson.fileId;
        break;
      }

      offset = end;
    }

    return fileId;
  };

  // ── Auto-upload when a video file is selected ─────────────
  const handleVideoChange = async (file: File | null) => {
    // Reset prior upload state
    setVideoFile(file);
    setUploadProgress(0);
    setUploadedFileId("");
    setUploadedVideoName("");
    abortRef.current = false;

    if (!file) {
      setUploadStatus("idle");
      return;
    }

    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!scriptUrl || scriptUrl === "YOUR_WEB_APP_URL_HERE") {
      toast({ variant: "destructive", title: "Configuration Error", description: "Google Script URL not set in .env" });
      return;
    }

    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      const fileId = await uploadVideoChunked(scriptUrl, file);
      setUploadProgress(100);
      setUploadedFileId(fileId);
      setUploadedVideoName(file.name);
      setUploadStatus("done");
    } catch (err: any) {
      if (abortRef.current) return;
      setUploadStatus("error");
      setUploadProgress(0);
      toast({
        variant: "destructive",
        title: "Video Upload Failed",
        description: err.message || "Could not upload video. Please try again.",
      });
    }
  };

  // ── Main submit handler (video already in Drive) ───────────
  const handleSubmit = async () => {
    const result = stepTwoSchema.safeParse(stepTwoData);
    if (!result.success) {
      toast({ variant: "destructive", title: "Please fix the following", description: result.error.errors[0].message });
      return;
    }

    const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!scriptUrl || scriptUrl === "YOUR_WEB_APP_URL_HERE") {
      toast({ variant: "destructive", title: "Configuration Error", description: "Google Script URL not set in .env" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save form data + video info to Sheets (video already uploaded)
      const formRes = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "submitForm",
          ...stepOneData,
          ...stepTwoData,
          fileId: uploadedFileId,
          videoName: uploadedVideoName,
        }),
      });
      const formJson = await formRes.json();
      if (!formJson.success) throw new Error(formJson.error || "Form submission failed");

      sessionStorage.setItem(SUBMIT_KEY, "true");
      setIsSuccess(true);

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return <SuccessScreen />;

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
          <div className="glass-card rounded-2xl opacity-0 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="p-6 sm:p-8">
              {currentStep === 1 && (
                <StepOne data={stepOneData} onChange={setStepOneData} onNext={handleStepOneNext} direction={direction} />
              )}
              {currentStep === 2 && (
                <StepTwo
                  data={stepTwoData}
                  onChange={setStepTwoData}
                  videoFile={videoFile}
                  onVideoChange={handleVideoChange}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  uploadProgress={uploadProgress}
                  uploadStatus={uploadStatus}
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
