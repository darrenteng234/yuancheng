import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

/** Surface container. `padded` adds the standard card body inset. */
export function Card({ padded = true, as: Tag = "div", className = "", children, ...rest }: CardProps) {
  return (
    // @ts-expect-error dynamic tag
    <Tag className={`card ${className}`} {...rest}>
      {padded ? <div className="card-body">{children}</div> : children}
    </Tag>
  );
}

export function CardHeader({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`card-header ${className}`} {...rest}>{children}</div>;
}

export default Card;
