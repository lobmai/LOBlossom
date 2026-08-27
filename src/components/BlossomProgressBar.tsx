import type { LessonStep } from "@/types/lesson";
import { getLessonSteps } from "@/lib/constants";

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path
        d="M8 14V8M8 8Q5 8 4 5Q3 3 5 2"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8 8Q11 8 12 5Q13 3 11 2"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <ellipse cx="8" cy="9" rx="3" ry="4" fill="currentColor" opacity="0.5" />
      <path d="M8 13V6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function BlossomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="8" cy="5" r="2" fill="currentColor" />
      <circle cx="5" cy="7" r="2" fill="currentColor" opacity="0.85" />
      <circle cx="11" cy="7" r="2" fill="currentColor" opacity="0.85" />
      <circle cx="6" cy="10" r="2" fill="currentColor" opacity="0.7" />
      <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

function stepIcon(index: number, currentIndex: number, totalSteps: number) {
  if (index < currentIndex) {
    return <BlossomIcon className="h-3.5 w-3.5 text-blossom-400" />;
  }
  if (index === currentIndex) {
    if (currentIndex >= totalSteps - 1) {
      return <BlossomIcon className="h-4 w-4 text-blossom-500" />;
    }
    if (currentIndex >= 4) {
      return <BudIcon className="h-3.5 w-3.5 text-blossom-400" />;
    }
    if (currentIndex >= 1) {
      return <BudIcon className="h-3 w-3 text-blossom-300" />;
    }
    return <SproutIcon className="h-3.5 w-3.5 text-leaf-500" />;
  }
  return <div className="h-2 w-2 rounded-full bg-gray-200" />;
}

export function BlossomProgressBar({
  lessonNumber,
  currentStep,
}: {
  lessonNumber: number;
  currentStep: LessonStep;
}) {
  const steps = getLessonSteps(lessonNumber);
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-2">
      <div className="flex justify-between px-0.5">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center gap-1" title={step.label}>
            {stepIcon(index, currentIndex, steps.length)}
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              index <= currentIndex ? "bg-blossom-300" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
