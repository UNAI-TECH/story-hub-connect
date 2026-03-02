import type { StepOneData } from "./StoryRegistrationForm";
import FloatingInput from "./FloatingInput";
import FloatingSelect from "./FloatingSelect";

interface StepOneProps {
  data: StepOneData;
  onChange: (data: StepOneData) => void;
  onNext: () => void;
  direction: "forward" | "backward";
}

const STANDARDS = [
  { value: "1st", label: "1st" },
  { value: "2nd", label: "2nd" },
  { value: "3rd", label: "3rd" },
  { value: "4th", label: "4th" },
  { value: "5th", label: "5th" },
  { value: "6th", label: "6th" },
  { value: "7th", label: "7th" },
  { value: "8th", label: "8th" },
  { value: "9th", label: "9th" },
  { value: "10th", label: "10th" },
  { value: "11th", label: "11th" },
  { value: "12th", label: "12th" },
];

const StepOne = ({ data, onChange, onNext, direction }: StepOneProps) => {
  const update = (field: keyof StepOneData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className={direction === "forward" ? "animate-slide-left" : "animate-slide-right"}>
      <h2 className="text-lg font-semibold text-foreground mb-1">Personal Details</h2>
      <p className="text-xs text-muted-foreground mb-6">Fill in your information to get started</p>

      <div className="space-y-4">
        <div className="opacity-0 animate-fade-up stagger-1">
          <FloatingInput
            label="Full Name"
            value={data.name}
            onChange={(v) => update("name", v)}
            required
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="opacity-0 animate-fade-up stagger-2">
            <FloatingSelect
              label="Standard"
              value={data.standard || ""}
              onChange={(v) => update("standard", v)}
              options={STANDARDS}
            />
          </div>
          <div className="opacity-0 animate-fade-up stagger-2">
            <FloatingInput
              label="Section"
              value={data.section || ""}
              onChange={(v) => update("section", v)}
              maxLength={50}
            />
          </div>
        </div>

        <div className="opacity-0 animate-fade-up stagger-3">
          <FloatingInput
            label="School Name"
            value={data.schoolName}
            onChange={(v) => update("schoolName", v)}
            required
            maxLength={200}
          />
        </div>

        <div className="opacity-0 animate-fade-up stagger-4">
          <FloatingInput
            label="Parent's Name"
            value={data.parentName}
            onChange={(v) => update("parentName", v)}
            required
            maxLength={100}
          />
        </div>

        <div className="opacity-0 animate-fade-up stagger-5">
          <FloatingInput
            label="Email Address"
            type="email"
            value={data.email}
            onChange={(v) => update("email", v)}
            required
            maxLength={255}
          />
        </div>

        <div className="opacity-0 animate-fade-up stagger-6">
          <FloatingInput
            label="Mobile Number"
            type="tel"
            value={data.mobile}
            onChange={(v) => {
              const clean = v.replace(/\D/g, "").slice(0, 10);
              update("mobile", clean);
            }}
            required
            maxLength={10}
          />
        </div>
      </div>

      <div className="opacity-0 animate-fade-up stagger-7 mt-8">
        <button onClick={onNext} className="btn-premium w-full">
          Continue to Story Details
        </button>
      </div>
    </div>
  );
};

export default StepOne;
