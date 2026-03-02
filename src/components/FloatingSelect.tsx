interface FloatingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

const FloatingSelect = ({
  label,
  value,
  onChange,
  options,
  className = "",
}: FloatingSelectProps) => {
  return (
    <div className={`floating-group ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="floating-select"
      >
        <option value="">{`Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label className="floating-select-label">{label}</label>
    </div>
  );
};

export default FloatingSelect;
