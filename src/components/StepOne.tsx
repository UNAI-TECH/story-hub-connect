import { Tag } from "lucide-react";
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
  { value: "1st", label: "1st Standard" },
  { value: "2nd", label: "2nd Standard" },
  { value: "3rd", label: "3rd Standard" },
  { value: "4th", label: "4th Standard" },
  { value: "5th", label: "5th Standard" },
  { value: "6th", label: "6th Standard" },
  { value: "7th", label: "7th Standard" },
  { value: "8th", label: "8th Standard" },
  { value: "9th", label: "9th Standard" },
  { value: "10th", label: "10th Standard" },
  { value: "11th", label: "11th Standard" },
  { value: "12th", label: "12th Standard" },
];

const StepOne = ({ data, onChange, onNext, direction }: StepOneProps) => {
  const update = (field: keyof StepOneData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className={direction === "forward" ? "animate-slide-left" : "animate-slide-right"}>
      <h2 className="text-lg font-semibold text-foreground mb-1">Student Registration</h2>
      <p className="text-xs text-muted-foreground mb-6">Future Forge 2026 — Please fill in all required fields</p>

      <div className="space-y-4">
        {/* Student Name */}
        <div className="opacity-0 animate-fade-up stagger-1">
          <FloatingInput
            label="Student's Full Name"
            value={data.name}
            onChange={(v) => update("name", v)}
            required
            maxLength={100}
          />
        </div>

        {/* Standard + Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="opacity-0 animate-fade-up stagger-2">
            <FloatingSelect
              label="Standard / Grade"
              value={data.standard || ""}
              onChange={(v) => update("standard", v)}
              options={STANDARDS}
            />
          </div>
          <div className="opacity-0 animate-fade-up stagger-2">
            <FloatingInput
              label="Section (e.g. A, B)"
              value={data.section || ""}
              onChange={(v) => update("section", v)}
              maxLength={10}
            />
          </div>
        </div>

        {/* School Name */}
        <div className="opacity-0 animate-fade-up stagger-3">
          <FloatingInput
            label="School Name"
            value={data.schoolName}
            onChange={(v) => update("schoolName", v)}
            required
            maxLength={200}
          />
        </div>

        {/* Parent Name */}
        <div className="opacity-0 animate-fade-up stagger-4">
          <FloatingInput
            label="Parent / Guardian Name"
            value={data.parentName}
            onChange={(v) => update("parentName", v)}
            required
            maxLength={100}
          />
        </div>

        {/* Email */}
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

        {/* Mobile */}
        <div className="opacity-0 animate-fade-up stagger-6">
          <FloatingInput
            label="Mobile Number (10 digits)"
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

        {/* Address */}
        <div className="opacity-0 animate-fade-up stagger-7">
          <FloatingInput
            label="Home Address"
            value={data.address}
            onChange={(v) => update("address", v)}
            required
            maxLength={300}
          />
        </div>

        {/* Promo Code divider */}
        <div className="opacity-0 animate-fade-up stagger-8">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border" />
            <span className="mx-3 text-xs text-muted-foreground font-medium">Have a promo code?</span>
            <div className="flex-grow border-t border-border" />
          </div>
        </div>

        {/* Promo Code */}
        <div className="opacity-0 animate-fade-up stagger-8">
          <div className="promo-field-wrapper">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none z-10">
                <Tag className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="promoCode"
                value={data.promoCode || ""}
                onChange={(e) => update("promoCode", e.target.value.toUpperCase())}
                placeholder="Enter promo code (optional)"
                maxLength={30}
                className="promo-input"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 pl-1">
              Skip this field if you don't have a promo code
            </p>
          </div>
        </div>
      </div>

      <div className="opacity-0 animate-fade-up stagger-8 mt-8">
        <button onClick={onNext} className="btn-premium w-full">
          Continue to Payment →
        </button>
      </div>
    </div>
  );
};

export default StepOne;
