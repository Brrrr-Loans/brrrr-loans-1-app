import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500 text-white shadow hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
        warning:
          "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
        info: "border-transparent bg-blue-500 text-white shadow hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
        purple:
          "border-transparent bg-purple-500 text-white shadow hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
        cyan: "border-transparent bg-cyan-500 text-white shadow hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700",
        "gradient-fire":
          "border-transparent text-white shadow hover:opacity-90 transition-opacity",
        "gradient-ocean":
          "border-transparent text-white shadow hover:opacity-90 transition-opacity",
        "gradient-cosmic":
          "border-transparent text-white shadow hover:opacity-90 transition-opacity",
        "gradient-nature":
          "border-transparent text-white shadow hover:opacity-90 transition-opacity",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  const getGradientStyle = (variant: BadgeProps["variant"]) => {
    switch (variant) {
      case "gradient-fire":
        return {
          background:
            "radial-gradient(260.69% 202.67% at -4.83% -37.67%, #F72121 24%, #FF9500 71%, #F0D047 100%)",
        };
      case "gradient-ocean":
        return {
          background: "linear-gradient(155deg, #2C53F0 5.99%, #39ACCD 91.59%)",
        };
      case "gradient-cosmic":
        return {
          background: "linear-gradient(155deg, #753FEF 5.99%, #7697CD 91.59%)",
        };
      case "gradient-nature":
        return {
          background: "linear-gradient(155deg, #0EBB3F 5.99%, #3DF04E 91.59%)",
        };
      default:
        return {};
    }
  };

  const gradientStyle = getGradientStyle(variant);

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={gradientStyle}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
