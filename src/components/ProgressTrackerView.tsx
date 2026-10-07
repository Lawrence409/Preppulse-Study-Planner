import React, { useState } from 'react';
import { TopicProgress, Flashcard, QuizQuestion } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface ProgressTrackerViewProps {
  topicProgress: TopicProgress[];
  originalNotes: string;
  onCramWeakTopics: (weakTopics: string[]) => Promise<{
    targetedCards: Flashcard[];
    targetedQuiz: QuizQuestion[];
    coachAdvice: string;
  }>;
  onApplyCramSession: (cards: Flashcard[], quiz: QuizQuestion[]) => void;
  userTier: 'free' | 'pro';
  onOpenPricing: () => void;
}

export const ProgressTrackerView: React.FC<ProgressTrackerViewProps> = ({
  topicProgress,
  originalNotes,
  onCramWeakTopics,
  onApplyCramSession,
  userTier,
  onOpenPricing,
}) => {
  const [isCramming, setIsCramming] = useState(false);
  const [cramResult, setCramResult] = useState<{
    targetedCards: Flashcard[];
    targetedQuiz: QuizQuestion[];
    coachAdvice: string;
    weakTopics: string[];
  } | null>(null);

  const weakTopics = topicProgress.filter((t) => t.status === 'weak');
  const developingTopics = topicProgress.filter((t) => t.status === 'developing');
  const masteredTopics = topicProgress.filter((t) => t.status === 'mastered');

  const averageMastery =
    topicProgress.length > 0
      ? Math.round(
          topicProgress.reduce((acc, t) => acc + t.masteryPercentage, 0) / topicProgress.length
        )
      : 0;

  const handleStartCram = async () => {
    const topicsToCram = weakTopics.length > 0
      ? weakTopics.map((t) => t.topic)
      : developingTopics.slice(0, 2).map((t) => t.topic);

    if (topicsToCram.length === 0) return;

    try {
      setIsCramming(true);
      const res = await onCramWeakTopics(topicsToCram);
      setCramResult({
        ...res,
        weakTopics: topicsToCram,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCramming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Title & Overview Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ACTIVE RECALL ANALYTICS</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Exam Weak Spot Diagnosis
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Aggregated from your flashcard ratings and quiz answers to pinpoint where you will lose points.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center sm:text-right shrink-0">
            <span className="text-[11px] text-stone-400 font-mono block">OVERALL READINESS</span>
            <span className="text-3xl font-serif font-bold text-stone-900">{averageMastery}%</span>
          </div>
        </div>

        {/* 3 Status Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Weak Topics ({weakTopics.length})</span>
            </div>
            <p className="text-xs text-amber-800/80">
              Requires immediate active-recall cramming before exam.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 mb-1">
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>Developing ({developingTopics.length})</span>
            </div>
            <p className="text-xs text-stone-600">
              Understood in broad strokes, but needs precision drilling.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mastered ({masteredTopics.length})</span>
            </div>
            <p className="text-xs text-emerald-800/80">
              Consistently answered correctly and marked confident.
            </p>
          </div>
        </div>

        {/* Hero Cram Action */}
        {(weakTopics.length > 0 || developingTopics.length > 0) && (
          <div className="mt-6 p-5 rounded-xl bg-stone-900 text-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>RAPID CRAM DRILL</span>
              </div>
              <h3 className="text-base font-bold text-white font-serif">
                Generate Targeted Drill for Weak Topics
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Targeting:{' '}
                {(weakTopics.length > 0 ? weakTopics : developingTopics)
                  .map((t) => t.topic)
                  .slice(0, 3)
                  .join(', ')}
              </p>
            </div>

            <button
              onClick={handleStartCram}
              disabled={isCramming}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-700 text-stone-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              {isCramming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Drill (~5s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Cram Weak Topics Now</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Cram Result Presentation if generated */}
      {cramResult && (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-800" />
              <h3 className="text-base font-bold text-emerald-950 font-serif">
                Targeted Drill Ready ({cramResult.weakTopics.join(', ')})
              </h3>
            </div>
            <button
              onClick={() => setCramResult(null)}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              Close Drill
            </button>
          </div>

          <div className="p-3 bg-white rounded-lg border border-emerald-200/80 text-xs text-emerald-950 italic">
            <span className="font-bold not-italic font-sans text-emerald-900 block mb-0.5">
              Tactical Exam Coach Tip:
            </span>
            &ldquo;{cramResult.coachAdvice}&rdquo;
          </div>

          <div className="text-xs text-stone-700">
            Generated {cramResult.targetedCards.length} high-yield flashcards and{' '}
            {cramResult.targetedQuiz.length} diagnostic questions attacking these misconceptions.
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                onApplyCramSession(cramResult.targetedCards, cramResult.targetedQuiz);
                setCramResult(null);
              }}
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-stone-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Add These Drill Cards &amp; Quiz to Study Set</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Topic List Details */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-500 tracking-wider">
          TOPIC MASTERY BREAKDOWN
        </h3>

        {topicProgress.map((item) => (
          <div
            key={item.topic}
            className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.status === 'weak'
                      ? 'bg-amber-500'
                      : item.status === 'developing'
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <h4 className="text-sm font-bold text-stone-900 font-serif">{item.topic}</h4>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span>
                  Cards: {item.cardsKnown}/{item.totalCards} mastered
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Quiz: {item.quizCorrect}/{item.quizTotal} correct
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:text-right">
              <div className="w-28 sm:w-36">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-stone-400">Mastery</span>
                  <span
                    className={
                      item.status === 'weak'
                        ? 'text-amber-700 font-bold'
                        : item.status === 'developing'
                        ? 'text-stone-700 font-bold'
                        : 'text-emerald-700 font-bold'
                    }
                  >
                    {item.masteryPercentage}%
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.status === 'weak'
                        ? 'bg-amber-500'
                        : item.status === 'developing'
                        ? 'bg-blue-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${item.masteryPercentage}%` }}
                  />
                </div>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded font-medium shrink-0 ${
                  item.status === 'weak'
                    ? 'bg-amber-100 text-amber-900'
                    : item.status === 'developing'
                    ? 'bg-stone-100 text-stone-800'
                    : 'bg-emerald-100 text-emerald-950'
                }`}
              >
                {item.status === 'weak'
                  ? 'Weak Point'
                  : item.status === 'developing'
                  ? 'Developing'
                  : 'Mastered'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
