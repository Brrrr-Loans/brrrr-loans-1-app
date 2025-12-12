"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = onStepClick && index <= currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                "relative flex-1",
                index !== steps.length - 1 && "pr-8 sm:pr-20"
              )}
            >
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div
                  className="absolute top-4 left-0 -right-8 sm:-right-20 h-0.5 w-full"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-full transition-colors duration-300",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}

              {/* Step indicator */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  "group relative flex flex-col items-center",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                <span className="flex items-center">
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isCompleted &&
                        "border-primary bg-primary text-primary-foreground",
                      isCurrent &&
                        "border-primary bg-background text-primary ring-4 ring-primary/20",
                      !isCompleted &&
                        !isCurrent &&
                        "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </span>
                </span>

                {/* Step label */}
                <span className="mt-2 flex flex-col items-center">
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isCurrent && "text-primary",
                      isCompleted && "text-foreground",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepContent({ children, className }: StepContentProps) {
  return (
    <div className={cn("mt-8 min-h-[400px]", className)}>{children}</div>
  );
}

interface StepActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function StepActions({ children, className }: StepActionsProps) {
  return (
    <div
      className={cn(
        "mt-8 flex items-center justify-between border-t pt-6",
        className
      )}
    >
      {children}
    </div>
  );
}

