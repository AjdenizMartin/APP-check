import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-[#8d6735] bg-[var(--accent)] text-[#1d1306] shadow-[0_10px_22px_-10px_rgba(211,164,96,0.6)] hover:translate-y-[-1px] hover:bg-[var(--accent-strong)]",
        secondary: "border border-[var(--line)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[#193229]",
        destructive:
          "border border-[#85342f] bg-[var(--danger)] text-[#240e0c] shadow-[0_8px_20px_-8px_rgba(209,96,87,0.55)] hover:brightness-110",
        outline: "border border-[var(--line)] bg-transparent text-[var(--foreground)] hover:bg-[#132821]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
