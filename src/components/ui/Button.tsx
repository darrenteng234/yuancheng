import React from "react";

type Variant = "primary" | "secondary" | "accent" | "success" | "danger" | "warning" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  success: "btn-success",
  danger: "btn-danger",
  warning: "btn-warning",
  ghost: "btn-ghost",
};
const SIZE_CLASS: Record<Size, string> = { sm: "btn-sm", md: "", lg: "btn-lg" };

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
}

/** Primary interactive control. Consumes .btn token classes from the design system. */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", full, loading, disabled, className = "", children, ...rest },
  ref
) {
  const classes = ["btn", VARIANT_CLASS[variant], SIZE_CLASS[size], full ? "btn-full" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button ref={ref} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});

export default Button;
