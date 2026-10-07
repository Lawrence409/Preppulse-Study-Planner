import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  ChevronRight,
  FileCheck,
  Check,
  Percent,
} from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
  onAnswerQuestion: (questionId: string, answer: string | number, selfEval?: 'correct' | 'partial' | 'incorrect') => void;
  onGoToWeaknessTracker: () => void;
  onGoToStudyPlan: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  questions,
  onAnswerQuestion,
  onGoToWeaknessTracker,
  onGoToStudyPlan,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shortAnswerInput, setShortAnswerInput] = useState('');
  const [showShortAnswerModel, setShowShortAnswerModel] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  const activeQuestion = questions[currentIdx];

  // Calculate scores
  const answeredCount = questions.filter((q) => q.userAnswer !== undefined && q.userAnswer !== null).length;
  
  const scoreBreakdown = questions.reduce(
    (acc, q) => {
      if (q.type === 'multiple_choice') {
        if (q.userAnswer === q.correctAnswerIndex) {
          acc.correct += 1;
        } else if (q.userAnswer !== undefined && q.userAnswer !== null) {
          acc.incorrect += 1;
        }
      } else {
        // short answer
        if (q.userSelfEvaluation === 'correct') {
          acc.correct += 1;
        } else if (q.userSelfEvaluation === 'partial') {
          acc.partial += 1;
        } else if (q.userSelfEvaluation === 'incorrect') {
          acc.incorrect += 1;
        }
      }
      return acc;
    },
    { correct: 0, partial: 0, incorrect: 0 }
  );

  const totalPointsEarned = scoreBreakdown.correct * 1 + scoreBreakdown.partial * 0.5;
  const totalScorePercent = answeredCount > 0 ? Math.round((totalPointsEarned / questions.length) * 100) : 0;

  // Topic-level breakdown for summary
  const topicStats: Record<string, { total: number; correct: number }> = {};
  questions.forEach((q) => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, correct: 0 };
    }
    topicStats[q.topic].total += 1;
    if (q.type === 'multiple_choice' && q.userAnswer === q.correctAnswerIndex) {
      topicStats[q.topic].correct += 1;
    } else if (q.type === 'short_answer' && q.userSelfEvaluation === 'correct') {
      topicStats[q.topic].correct += 1;
    } else if (q.type === 'short_answer' && q.userSelfEvaluation === 'partial') {
      topicStats[q.topic].correct += 0.5;
    }
  });

  const handleSelectMultipleChoice = (optionIdx: number) => {
    if (activeQuestion.userAnswer !== undefined && activeQuestion.userAnswer !== null) return; // already answered
    onAnswerQuestion(activeQuestion.id, optionIdx);
  };

  const handleRevealShortAnswer = () => {
    setShowShortAnswerModel(true);
  };

  const handleGradeShortAnswer = (evaluation: 'correct' | 'partial' | 'incorrect') => {
    onAnswerQuestion(activeQuestion.id, shortAnswerInput, evaluation);
    setShowShortAnswerModel(false);
  };

  const handleNext = () => {
    setShowShortAnswerModel(false);
    setShortAnswerInput('');
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    questions.forEach((q) => {
      onAnswerQuestion(q.id, null as any, null as any);
    });
    setCurrentIdx(0);
    setIsQuizCompleted(false);
    setShortAnswerInput('');
    setShowShortAnswerModel(false);
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-stone-500">
        No quiz questions available. Please generate a study set first.
      </div>
    );
  }

  // Quiz Completion Screen
  if (isQuizCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-4">
            <Award className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">Quiz Completed!</h2>
          <p className="text-sm text-stone-600 mb-6">
            Here is your diagnostic breakdown. Review missed concepts before your exam date.
          </p>

          {/* Big Score Card */}
          <div className="inline-flex items-baseline justify-center gap-2 p-4 bg-stone-50 rounded-xl border border-stone-200 mb-8 min-w-[200px]">
            <span className="text-4xl font-serif font-bold text-stone-900">{totalScorePercent}%</span>
            <span className="text-xs text-stone-500 font-sans">
              ({totalPointsEarned} / {questions.length} points)
            </span>
          </div>

          {/* Performance breakdown by topic */}
          <div className="text-left mb-8">
            <h3 className="text-xs font-bold text-stone-500 tracking-wider mb-3">
              TOPIC ACCURACY BREAKDOWN
            </h3>
            <div className="space-y-3">
              {Object.entries(topicStats).map(([topic, stat]) => {
                const percent = Math.round((stat.correct / stat.total) * 100);
                const isWeak = percent < 60;
                return (
                  <div key={topic} className="p-3 rounded-lg border border-stone-200 bg-stone-50/50">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-stone-800">{topic}</span>
                      <span
                        className={`font-mono font-medium ${
                          isWeak ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {percent}% ({stat.correct}/{stat.total})
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWeak ? 'bg-amber-600' : 'bg-emerald-700'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleResetQuiz}
              className="px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={onGoToWeaknessTracker}
              className="px-5 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-950 text-stone-100 text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Weakness Tracker &amp; Cram</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentAnswered =
    activeQuestion.type === 'multiple_choice'
      ? activeQuestion.userAnswer !== undefined && activeQuestion.userAnswer !== null
      : activeQuestion.userSelfEvaluation !== undefined && activeQuestion.userSelfEvaluation !== null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Progress & Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Exam Quiz Simulation</h2>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
            <span>
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeQuestion.type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-stone-700">{activeQuestion.topic}</span>
          </div>
        </div>

        {/* Quick jump pills */}
        <div className="flex items-center gap-1">
          {questions.map((q, idx) => {
            const answered = q.userAnswer !== undefined && q.userAnswer !== null;
            const isCorrect =
              q.type === 'multiple_choice'
                ? q.userAnswer === q.correctAnswerIndex
                : q.userSelfEvaluation === 'correct';
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setShowShortAnswerModel(false);
                }}
                className={`w-6 h-6 rounded text-[11px] font-mono transition-all ${
                  idx === currentIdx
                    ? 'ring-2 ring-emerald-800 font-bold'
                    : ''
                } ${
                  answered
                    ? isCorrect
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Text */}
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mb-2">
            <span>QUESTION {currentIdx + 1}</span>
            <span>·</span>
            <span className="text-stone-600 font-sans">{activeQuestion.topic}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif text-stone-900 leading-snug">
            {activeQuestion.question}
          </h3>
        </div>

        {/* Multiple Choice Options */}
        {activeQuestion.type === 'multiple_choice' && activeQuestion.options && (
          <div className="space-y-2.5">
            {activeQuestion.options.map((opt, optIdx) => {
              const hasAnswered = activeQuestion.userAnswer !== undefined && activeQuestion.userAnswer !== null;
              const isSelected = activeQuestion.userAnswer === optIdx;
              const isCorrectOpt = optIdx === activeQuestion.correctAnswerIndex;

              let buttonStyle = 'border-stone-200 hover:border-stone-400 bg-white text-stone-800';
              if (hasAnswered) {
                if (isCorrectOpt) {
                  buttonStyle = 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-medium';
                } else if (isSelected) {
                  buttonStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                } else {
                  buttonStyle = 'border-stone-200 bg-stone-50/50 text-stone-400 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleSelectMultipleChoice(optIdx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3 ${buttonStyle}`}
                >
                  <span className="w-5 h-5 rounded-full border border-current text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{opt}</span>
                  {hasAnswered && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  )}
                  {hasAnswered && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Short Answer Field */}
        {activeQuestion.type === 'short_answer' && (
          <div className="space-y-4">
            {!isCurrentAnswered && !showShortAnswerModel ? (
              <div className="space-y-3">
                <label className="text-xs font-medium text-stone-600 block">
                  Write your answer from memory (tests active recall retention):
                </label>
                <textarea
                  value={shortAnswerInput}
                  onChange={(e) => setShortAnswerInput(e.target.value)}
                  rows={4}
                  placeholder="Type your response here before viewing the rubric..."
                  className="w-full text-sm p-3.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 leading-relaxed"
                />
                <button
                  type="button"
                  onClick={handleRevealShortAnswer}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-lg text-xs font-medium transition-colors"
                >
                  Reveal Model Answer &amp; Self-Grade Rubric
                </button>
              </div>
            ) : (
              <div className="space-y-4 bg-stone-50 p-5 rounded-xl border border-stone-200">
                {shortAnswerInput && (
                  <div>
                    <span className="text-xs text-stone-500 font-mono block mb-1">YOUR ATTEMPT:</span>
                    <p className="text-xs text-stone-800 bg-white p-3 rounded-md border border-stone-200 font-sans">
                      {shortAnswerInput}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-xs text-emerald-800 font-mono block mb-1 font-semibold">
                    MODEL ANSWER:
                  </span>
                  <p className="text-sm text-stone-900 bg-white p-3.5 rounded-md border border-emerald-200/80 font-serif leading-relaxed">
                    {activeQuestion.sampleAnswer}
                  </p>
                </div>

                {activeQuestion.rubricKeyPoints && (
                  <div>
                    <span className="text-xs text-stone-500 font-mono block mb-1">
                      KEY RUBRIC POINTS EXPECTED:
                    </span>
                    <ul className="list-disc pl-5 text-xs text-stone-700 space-y-1">
                      {activeQuestion.rubricKeyPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!isCurrentAnswered && (
                  <div className="pt-2 border-t border-stone-200">
                    <span className="text-xs font-medium text-stone-700 block mb-2">
                      How did your answer compare?
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGradeShortAnswer('correct')}
                        className="flex-1 py-2 rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-950 text-xs font-medium hover:bg-emerald-100 transition-colors"
                      >
                        Nailed It (Full Points)
                      </button>
                      <button
                        onClick={() => handleGradeShortAnswer('partial')}
                        className="flex-1 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-medium hover:bg-amber-100 transition-colors"
                      >
                        Partial (Got Some Parts)
                      </button>
                      <button
                        onClick={() => handleGradeShortAnswer('incorrect')}
                        className="flex-1 py-2 rounded-lg border border-rose-300 bg-rose-50 text-rose-950 text-xs font-medium hover:bg-rose-100 transition-colors"
                      >
                        Missed It (Need Review)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instant Feedback & Explanations (after answering) */}
        {isCurrentAnswered && (
          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <span className="text-xs font-bold text-stone-900 block mb-1.5">
                EXPLANATION &amp; REASONING:
              </span>
              <p className="text-xs text-stone-700 leading-relaxed">
                {activeQuestion.explanation}
              </p>
            </div>

            {/* Source grounding quote */}
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/60 flex items-start gap-2.5 text-xs">
              <FileCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-900 block">Verified Note Excerpt:</span>
                <p className="text-emerald-950 italic font-serif">
                  &ldquo;{activeQuestion.sourceExcerpt}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Next Question Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              if (currentIdx > 0) setCurrentIdx((prev) => prev - 1);
            }}
            disabled={currentIdx === 0}
            className="text-xs text-stone-500 hover:text-stone-800 disabled:opacity-40"
          >
            ← Previous Question
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-stone-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>
              {currentIdx === questions.length - 1 ? 'Finish & See Scorecard' : 'Next Question'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
