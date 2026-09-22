import React from "react";

let _id = 0;
function useId(prefix: string) {
  const [id] = React.useState(() => `${prefix}-${++_id}`);
  return id;
}

interface FieldShellProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  children: (id: string, describedBy?: string) => React.ReactNode;
}

/** Label + hint + error wrapper. Any control composes through it for consistent a11y. */
export function Field({ label, hint, error, required, children }: FieldShellProps) {
  const id = useId("field");
  const descId = hint || error ? `${id}-desc` : undefined;
  return (
    <div className="form-group">
      {label ? (
        <label className="form-label" htmlFor={id}>
          {label}
          {required ? <span style={{ color: "var(--color-error)" }}> *</span> : null}
        </label>
      ) : null}
      {children(id, descId)}
      {error ? (
        <div id={descId} className="form-hint" style={{ color: "var(--color-error)" }}>{error}</div>
      ) : hint ? (
        <div id={descId} className="form-hint">{hint}</div>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className = "", ...rest }, ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(id, descId) => (
        <input ref={ref} id={id} aria-describedby={descId} aria-invalid={!!error || undefined}
          required={required} className={`form-input ${className}`} {...rest} />
      )}
    </Field>
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className = "", ...rest }, ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(id, descId) => (
        <textarea ref={ref} id={id} aria-describedby={descId} aria-invalid={!!error || undefined}
          required={required} className={`form-textarea ${className}`} {...rest} />
      )}
    </Field>
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, className = "", children, ...rest }, ref
) {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      {(id, descId) => (
        <select ref={ref} id={id} aria-describedby={descId} aria-invalid={!!error || undefined}
          required={required} className={`form-select ${className}`} {...rest}>{children}</select>
      )}
    </Field>
  );
});
