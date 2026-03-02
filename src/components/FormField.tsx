import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

const FormField = ({ label, required, children }: FormFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      <style>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.5rem;
          border: 1.5px solid hsl(var(--input));
          background: hsl(var(--background));
          color: hsl(var(--foreground));
          font-size: 0.875rem;
          transition: all 0.2s ease;
          outline: none;
        }
        .form-input:focus {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 3px hsl(var(--ring) / 0.2);
        }
        .form-input::placeholder {
          color: hsl(var(--muted-foreground));
        }
      `}</style>
    </div>
  );
};

export default FormField;
