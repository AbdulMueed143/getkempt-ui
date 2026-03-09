import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Label } from "./label";
import { Input } from "./input";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, leftAddon, rightAddon, id, className, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-0", className)}>
        <Label htmlFor={fieldId} required={props.required}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={fieldId}
          hasError={!!error}
          leftAddon={leftAddon}
          rightAddon={rightAddon}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="mt-1.5 text-xs text-red-400 flex items-center gap-1"
          >
            <span>⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
