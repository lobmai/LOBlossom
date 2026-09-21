import Link from "next/link";
import type { LessonStep } from "@/types/lesson";
import { getLessonSteps } from "@/lib/constants";
import { LESSON_SELECT_PATH } from "@/lib/lessons/registry";
import { BlossomProgressBar } from "@/components/BlossomProgressBar";
import { LessonAudioPreloader } from "@/components/LessonAudioPreloader";
import { LessonMemoPanel } from "@/components/LessonMemoPanel";
import { PrefetchOnMount } from "@/components/PrefetchOnMount";
import { SpeechNavigationGuard } from "@/components/SpeechNavigationGuard";

interface LessonLayoutProps {
  lessonNumber: number;
  currentStep: LessonStep;
  title: string;
  subtitle?: string;
  lessonId?: string;
  showMemo?: boolean;
  children: React.ReactNode;
}

export function LessonLayout({
  lessonNumber,
  currentStep,
  title,
  subtitle,
  lessonId,
  showMemo = false,
  children,
}: LessonLayoutProps) {
  const steps = getLessonSteps(lessonNumber);
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  const prevPath = currentIndex > 0 ? steps[currentIndex - 1]?.path : undefined;
  const nextPath =
    currentIndex >= 0 && currentIndex < steps.length - 1
      ? steps[currentIndex + 1]?.path
      : undefined;

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <PrefetchOnMount hrefs={[LESSON_SELECT_PATH, prevPath, nextPath]} />
      <SpeechNavigationGuard />
      <LessonAudioPreloader lessonNumber={lessonNumber} />
      {showMemo && lessonId && <LessonMemoPanel lessonId={lessonId} />}

      <header className="mb-8">
        <Link
          href={LESSON_SELECT_PATH}
          prefetch
          className="mb-4 inline-block text-sm text-gray-500 hover:text-blossom-500"
        >
          ← レッスン選択
        </Link>
        <p className="text-xs font-medium text-blossom-500">
          レッスン{lessonNumber} · {currentIndex + 1} / {steps.length}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{subtitle}</p>
        )}
      </header>

      <BlossomProgressBar lessonNumber={lessonNumber} currentStep={currentStep} />

      <main className="mt-8">{children}</main>
    </div>
  );
}
