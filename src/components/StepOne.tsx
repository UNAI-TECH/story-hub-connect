import type { StepOneData } from "./StoryRegistrationForm";
import FormField from "./FormField";

interface StepOneProps {
  data: StepOneData;
  onChange: (data: StepOneData) => void;
  onNext: () => void;
  direction: "forward" | "backward";
}

const STANDARDS = [
  "Select Standard",
  "1st", "2nd", "3rd", "4th", "5th",
  "6th", "7th", "8th", "9th", "10th",
  "11th", "12th",
];

const StepOne = ({ data, onChange, onNext, direction }: StepOneProps) => {
  const update = (field: keyof StepOneData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className={direction === "forward" ? "animate-slide-left" : "animate-slide-right"}>
      <h2 className="text-xl font-bold font-display text-foreground mb-6">
        Step 1: Personal Details
      </h2>

      <div className="space-y-4">
        <FormField label="Name" required>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Enter your full name"
            className="form-input"
            maxLength={100}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Standard">
            <select
              value={data.standard}
              onChange={(e) => update("standard", e.target.value)}
              className="form-input"
            >
              {STANDARDS.map((s) => (
                <option key={s} value={s === "Select Standard" ? "" : s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Section">
            <input
              type="text"
              value={data.section}
              onChange={(e) => update("section", e.target.value)}
              placeholder="e.g. A, B, C"
              className="form-input"
              maxLength={50}
            />
          </FormField>
        </div>

        <FormField label="School Name" required>
          <input
            type="text"
            value={data.schoolName}
            onChange={(e) => update("schoolName", e.target.value)}
            placeholder="Enter your school name"
            className="form-input"
            maxLength={200}
          />
        </FormField>

        <FormField label="Parent's Name" required>
          <input
            type="text"
            value={data.parentName}
            onChange={(e) => update("parentName", e.target.value)}
            placeholder="Enter parent's full name"
            className="form-input"
            maxLength={100}
          />
        </FormField>

        <FormField label="Email ID" required>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="your@email.com"
            className="form-input"
            maxLength={255}
          />
        </FormField>

        <FormField label="Mobile Number" required>
          <input
            type="tel"
            value={data.mobile}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
              update("mobile", val);
            }}
            placeholder="10-digit mobile number"
            className="form-input"
            maxLength={10}
          />
        </FormField>
      </div>

      <button
        onClick={onNext}
        className="w-full mt-6 py-3 px-6 gradient-gold text-secondary-foreground font-semibold rounded-lg 
          hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg"
      >
        Next → Step 2
      </button>
    </div>
  );
};

export default StepOne;
