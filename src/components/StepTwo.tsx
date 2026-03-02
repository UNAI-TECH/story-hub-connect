import { Upload, FileVideo, Loader2 } from "lucide-react";
import type { StepTwoData } from "./StoryRegistrationForm";
import FloatingInput from "./FloatingInput";
import FloatingSelect from "./FloatingSelect";
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
  { value: "Fiction", label: "Fiction" },
  { value: "Non-Fiction", label: "Non-Fiction" },
  { value: "Mythology", label: "Mythology" },
  { value: "Science Fiction", label: "Science Fiction" },
  { value: "Adventure", label: "Adventure" },
  { value: "Comedy", label: "Comedy" },
  { value: "Drama", label: "Drama" },
  { value: "Fantasy", label: "Fantasy" },
  { value: "Horror", label: "Horror" },
  { value: "Other", label: "Other" },
];

const CLASS_LEVELS = [
  { value: "Primary (1-5)", label: "Primary (1-5)" },
  { value: "Middle (6-8)", label: "Middle (6-8)" },
  { value: "Senior (9-12)", label: "Senior (9-12)" },
];

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

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
      toast({ variant: "destructive", title: "Invalid File", description: "Only MP4 files are accepted." });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      toast({ variant: "destructive", title: "File Too Large", description: "Max file size is 100MB." });
      e.target.value = "";
      return;
    }
    onVideoChange(file);
  };

  return (
    <div className={direction === "forward" ? "animate-slide-left" : "animate-slide-right"}>
      <h2 className="text-lg font-semibold text-foreground mb-1">Story Details</h2>
      <p className="text-xs text-muted-foreground mb-6">Tell us about your story</p>

      <div className="space-y-4">
        <div className="opacity-0 animate-fade-up stagger-1">
          <FloatingInput
            label="Story Title"
            value={data.storyTitle}
            onChange={(v) => update("storyTitle", v)}
            required
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="opacity-0 animate-fade-up stagger-2">
            <FloatingSelect
              label="Category"
              value={data.storyCategory || ""}
              onChange={(v) => update("storyCategory", v)}
              options={CATEGORIES}
            />
          </div>
          <div className="opacity-0 animate-fade-up stagger-2">
            <FloatingSelect
              label="Class Level"
              value={data.classLevel || ""}
              onChange={(v) => update("classLevel", v)}
              options={CLASS_LEVELS}
            />
          </div>
        </div>

        {/* Video upload */}
        <div className="opacity-0 animate-fade-up stagger-3">
          <label className="block cursor-pointer group">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${videoFile ? "border-success bg-success/5" : "border-border hover:border-accent hover:bg-accent/5"}`}
            >
              {videoFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <FileVideo className="w-5 h-5 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground truncate max-w-[220px]">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3
                    group-hover:bg-accent/20 transition-colors duration-300">
                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Upload Video</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4 only • Max 100MB</p>
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
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-8 opacity-0 animate-fade-up stagger-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="btn-secondary-soft flex-1"
        >
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-premium flex-1 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
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
