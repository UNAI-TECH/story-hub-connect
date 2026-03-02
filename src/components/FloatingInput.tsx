interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  maxLength?: number;
  className?: string;
}

const FloatingInput = ({
  label,
  type = "text",
  value,
  onChange,
  required,
  maxLength,
  className = "",
}: FloatingInputProps) => {
  return (
    <div className={`floating-group ${className}`}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        maxLength={maxLength}
        className="floating-input"
      />
      <label className="floating-label">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
    </div>
  );
};

export default FloatingInput;
