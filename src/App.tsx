import React, { useState, useEffect, useMemo } from 'react';
import { StudySet, Flashcard, QuizQuestion, TopicProgress } from './types';
import { Header } from './components/Header';
import { NoteInput } from './components/NoteInput';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { StudyPlanView } from './components/StudyPlanView';
import { ProgressTrackerView } from './components/ProgressTrackerView';
import { PricingModal } from './components/PricingModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { AlertCircle, BookOpen, Layers, CheckCircle2, Sparkles } from 'lucide-react';

const STORAGE_KEY_SET = 'preppulse_studyset_v1';
const STORAGE_KEY_USAGE = 'preppulse_usage_v1';
const STORAGE_KEY_TIER = 'preppulse_tier_v1';

export default function App() {
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [currentTab, setCurrentTab] = useState<'input' | 'flashcards' | 'quiz' | 'plan' | 'progress'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pricing & usage states
  const [userTier, setUserTier] = useState<'free' | 'pro'>('free');
  const [setsUsed, setSetsUsed] = useState(0);
  const maxFreeSets = 3;
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedSet = localStorage.getItem(STORAGE_KEY_SET);
      if (savedSet) {
        const parsed = JSON.parse(savedSet);
        setStudySet(parsed);
        setCurrentTab('flashcards');
      }

      const savedTier = localStorage.getItem(STORAGE_KEY_TIER);
      if (savedTier === 'pro' || savedTier === 'free') {
        setUserTier(savedTier);
      }

      const savedUsage = localStorage.getItem(STORAGE_KEY_USAGE);
      if (savedUsage) {
        setSetsUsed(parseInt(savedUsage, 10) || 0);
      }
    } catch (err) {
      console.warn('Could not load cached session:', err);
    }
  }, []);

  // Save study set to localStorage on change
  useEffect(() => {
    if (studySet) {
      localStorage.setItem(STORAGE_KEY_SET, JSON.stringify(studySet));
    }
  }, [studySet]);

  // Save tier & usage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TIER, userTier);
  }, [userTier]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USAGE, setsUsed.toString());
  }, [setsUsed]);

  // Compute Topic Progress dynamically from flashcard ratings and quiz answers
  const topicProgress: TopicProgress[] = useMemo(() => {
    if (!studySet) return [];

    const topics = studySet.keyTopics && studySet.keyTopics.length > 0
      ? studySet.keyTopics
      : Array.from(new Set(studySet.flashcards.map((f) => f.topic)));

    return topics.map((topic) => {
      // Find cards matching this topic (case-insensitive or partial match)
      const matchingCards = studySet.flashcards.filter(
        (c) =>
          c.topic.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(c.topic.toLowerCase())
      );
      const totalCards = matchingCards.length;
      const cardsKnown = matchingCards.filter((c) => c.userRating === 'got_it').length;
      const cardsNeedReview = matchingCards.filter((c) => c.userRating === 'needs_review').length;

      // Find quiz questions matching this topic
      const matchingQuestions = studySet.quizQuestions.filter(
        (q) =>
          q.topic.toLowerCase().includes(topic.toLowerCase()) ||
          topic.toLowerCase().includes(q.topic.toLowerCase())
      );
      const quizTotal = matchingQuestions.length;
      let quizCorrect = 0;
      matchingQuestions.forEach((q) => {
        if (q.type === 'multiple_choice' && q.userAnswer === q.correctAnswerIndex) {
          quizCorrect += 1;
        } else if (q.type === 'short_answer') {
          if (q.userSelfEvaluation === 'correct') quizCorrect += 1;
          else if (q.userSelfEvaluation === 'partial') quizCorrect += 0.5;
        }
      });

      // Calculate combined mastery weight
      let cardScore = totalCards > 0 ? (cardsKnown / totalCards) * 100 : 50;
      // If cards need review, penalize
      if (cardsNeedReview > 0 && totalCards > 0) {
        cardScore = Math.max(0, cardScore - (cardsNeedReview / totalCards) * 30);
      }
      const quizScore = quizTotal > 0 ? (quizCorrect / quizTotal) * 100 : cardScore;
      const combined = Math.round(cardScore * 0.5 + quizScore * 0.5);

      let status: 'weak' | 'developing' | 'mastered' = 'developing';
      if (combined < 60 || cardsNeedReview > cardsKnown) {
        status = 'weak';
      } else if (combined >= 80) {
        status = 'mastered';
      }

      return {
        topic,
        totalCards,
        cardsKnown,
        cardsNeedReview,
        quizTotal,
        quizCorrect,
        masteryPercentage: combined,
        status,
      };
    });
  }, [studySet]);

  // Generate study set handler
  const handleGenerateStudySet = async (payload: {
    notes: string;
    fileData?: { data: string; mimeType: string };
    examDate: string;
    subject: string;
  }) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-study-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data: StudySet = await response.json();
      setStudySet(data);
      setSetsUsed((prev) => prev + 1);
      setCurrentTab('flashcards');
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorMessage(
        err.message || 'Failed to synthesize study set. Please verify your notes and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Card rating handler
  const handleRateCard = (cardId: string, rating: 'got_it' | 'needs_review') => {
    if (!studySet) return;
    setStudySet({
      ...studySet,
      flashcards: studySet.flashcards.map((card) =>
        card.id === cardId ? { ...card, userRating: rating } : card
      ),
    });
  };

  // Quiz answering handler
  const handleAnswerQuestion = (
    questionId: string,
    answer: string | number | null,
    selfEval?: 'correct' | 'partial' | 'incorrect' | null
  ) => {
    if (!studySet) return;
    setStudySet({
      ...studySet,
      quizQuestions: studySet.quizQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              userAnswer: answer,
              userSelfEvaluation: selfEval,
            }
          : q
      ),
    });
  };

  // Study plan task toggle handler
  const handleToggleTask = (dayIndex: number, taskId: string) => {
    if (!studySet) return;
    const updatedPlan = [...studySet.studyPlan];
    const targetDay = updatedPlan[dayIndex];
    if (targetDay) {
      targetDay.tasks = targetDay.tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      );
      setStudySet({ ...studySet, studyPlan: updatedPlan });
    }
  };

  // Cram weak topics handler
  const handleCramWeakTopics = async (weakTopics: string[]) => {
    if (!studySet) throw new Error('No active study set');

    const res = await fetch('/api/cram-weak-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weakTopics,
        originalNotes: studySet.originalNotes,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to generate cram session');
    }

    return await res.json();
  };

  // Add cram session into the study set
  const handleApplyCramSession = (newCards: Flashcard[], newQuestions: QuizQuestion[]) => {
    if (!studySet) return;
    setStudySet({
      ...studySet,
      flashcards: [...newCards, ...studySet.flashcards],
      quizQuestions: [...studySet.quizQuestions, ...newQuestions],
    });
    setCurrentTab('flashcards');
  };

  // Reset to input view
  const handleReset = () => {
    setCurrentTab('input');
  };

  // Upgrade to Pro handler
  const handleUpgradeToPro = () => {
    setUserTier('pro');
  };

  return (
    <div className="min-h-screen bg-stone-100/50 text-stone-900 font-sans flex flex-col selection:bg-emerald-200">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        hasStudySet={Boolean(studySet)}
        userTier={userTier}
        setsUsed={setsUsed}
        maxFreeSets={maxFreeSets}
        onOpenPricing={() => setIsPricingOpen(true)}
        onReset={handleReset}
        studySetTitle={studySet?.title}
      />

      {/* Error alert banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 hover:text-rose-950 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'input' && (
          <NoteInput
            onGenerate={handleGenerateStudySet}
            isLoading={isLoading}
            userTier={userTier}
            setsUsed={setsUsed}
            maxFreeSets={maxFreeSets}
            onOpenPricing={() => setIsPricingOpen(true)}
          />
        )}

        {currentTab === 'flashcards' && studySet && (
          <FlashcardsView
            flashcards={studySet.flashcards}
            onRateCard={handleRateCard}
            onGoToQuiz={() => setCurrentTab('quiz')}
          />
        )}

        {currentTab === 'quiz' && studySet && (
          <QuizView
            questions={studySet.quizQuestions}
            onAnswerQuestion={handleAnswerQuestion}
            onGoToWeaknessTracker={() => setCurrentTab('progress')}
            onGoToStudyPlan={() => setCurrentTab('plan')}
          />
        )}

        {currentTab === 'plan' && studySet && (
          <StudyPlanView
            studyPlan={studySet.studyPlan}
            examDate={studySet.examDate}
            onToggleTask={handleToggleTask}
          />
        )}

        {currentTab === 'progress' && studySet && (
          <ProgressTrackerView
            topicProgress={topicProgress}
            originalNotes={studySet.originalNotes}
            onCramWeakTopics={handleCramWeakTopics}
            onApplyCramSession={handleApplyCramSession}
            userTier={userTier}
            onOpenPricing={() => setIsPricingOpen(true)}
          />
        )}
      </main>

      {/* Simple quiet footer */}
      <footer className="border-t border-stone-200 bg-stone-50 py-6 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800">PrepPulse</span>
            <span>·</span>
            <span>Niche-Focused Exam Prep for College Midterms &amp; Finals</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Free Tier: 3 sets/mo</span>
            <span>·</span>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="text-stone-600 hover:text-stone-900 underline"
            >
              Student Pro: $4/mo
            </button>
          </div>
        </div>
      </footer>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        userTier={userTier}
        onUpgradeToPro={handleUpgradeToPro}
      />

      {/* Live Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
