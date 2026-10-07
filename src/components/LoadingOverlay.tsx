import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Clock } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  const [seconds, setSeconds] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const steps = [
    'Parsing lecture notes & extracting core concepts...',
    'Formulating high-yield active recall flashcards...',
    'Verifying source quotes to prevent AI hallucinations...',
    'Generating exam-style multiple-choice & short-answer questions...',
    'Building day-by-day spaced repetition schedule...',
  ];

  useEffect(() => {
    if (!isLoading) {
      setSeconds(0);
      setCurrentStepIdx(0);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    const stepTimer = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3800);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto relative">
          <Sparkles className="w-6 h-6 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        </div>

        <div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            Synthesizing Your Study Set
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Analyzing notes and generating cards, quiz, and study plan
          </p>
        </div>

        {/* Live Timer */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-xs font-mono text-stone-600">
          <Clock className="w-3.5 h-3.5" />
          <span>{seconds}s elapsed (average: ~20s)</span>
        </div>

        {/* Steps List */}
        <div className="space-y-2 text-left bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 transition-colors ${
                  isCompleted
                    ? 'text-emerald-800 font-medium'
                    : isCurrent
                    ? 'text-stone-900 font-semibold'
                    : 'text-stone-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'border border-stone-900 text-stone-900'
                      : 'border border-stone-300 text-stone-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span className="truncate">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
