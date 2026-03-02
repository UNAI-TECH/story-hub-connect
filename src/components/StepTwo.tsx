import { Upload, FileVideo, Loader2 } from "lucide-react";
import type { StepTwoData } from "./StoryRegistrationForm";
import FormField from "./FormField";
import { useToast } from "@/hooks/use-toast";

interface StepTwoProps {
  data: StepTwoData;
  onChange: (data: StepTwoData) => void;
  videoFile: File | null;
  onVideoChange: (file: File | null) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  direction: "forward" | "backward";
}

const CATEGORIES = [
  "Select Category",
  "Fiction",
  "Non-Fiction",
  "Mythology",
  "Science Fiction",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Other",
];

const CLASS_LEVELS = [
  "Select Class Level",
  "Primary (1-5)",
  "Middle (6-8)",
  "Senior (9-12)",
];

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const StepTwo = ({
  data,
  onChange,
  videoFile,
  onVideoChange,
  onBack,
  onSubmit,
  isSubmitting,
  direction,
}: StepTwoProps) => {
  const { toast } = useToast();

  const update = (field: keyof StepTwoData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("mp4") && !file.name.endsWith(".mp4")) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an MP4 video file only.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Video file must be under 100MB.",
      });
      e.target.value = "";
      return;
    }

    onVideoChange(file);
  };

  return (
    <div className={direction === "forward" ? "animate-slide-left" : "animate-slide-right"}>
      <h2 className="text-xl font-bold font-display text-foreground mb-6">
        Step 2: Story Details
      </h2>

      <div className="space-y-4">
        <FormField label="Story Title" required>
          <input
            type="text"
            value={data.storyTitle}
            onChange={(e) => update("storyTitle", e.target.value)}
            placeholder="Enter your story title"
            className="form-input"
            maxLength={200}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Story Category">
            <select
              value={data.storyCategory}
              onChange={(e) => update("storyCategory", e.target.value)}
              className="form-input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c === "Select Category" ? "" : c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Class Level">
            <select
              value={data.classLevel}
              onChange={(e) => update("classLevel", e.target.value)}
              className="form-input"
            >
              {CLASS_LEVELS.map((l) => (
                <option key={l} value={l === "Select Class Level" ? "" : l}>
                  {l}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Video Upload */}
        <FormField label="Upload Video (MP4, max 100MB)">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-accent transition-colors duration-200">
              {videoFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileVideo className="w-8 h-8 text-success" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">MP4 only, max 100MB</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept=".mp4,video/mp4"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </FormField>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 px-6 bg-muted text-foreground font-semibold rounded-lg 
            hover:bg-muted/80 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 px-6 gradient-gold text-secondary-foreground font-semibold rounded-lg 
            hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg
            disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Registration"
          )}
        </button>
      </div>
    </div>
  );
};

export default StepTwo;
