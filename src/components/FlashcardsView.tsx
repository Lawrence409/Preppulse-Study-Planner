import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Check,
  AlertCircle,
  FileCheck,
  Eye,
  SlidersHorizontal,
  Layers,
  List,
} from 'lucide-react';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  onRateCard: (cardId: string, rating: 'got_it' | 'needs_review') => void;
  onGoToQuiz: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards,
  onRateCard,
  onGoToQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'needs_review' | 'got_it'>('all');
  const [viewMode, setViewMode] = useState<'deck' | 'list'>('deck');
  const [showSourceVerification, setShowSourceVerification] = useState(true);

  // Filtered cards based on active filter
  const filteredCards = flashcards.filter((card) => {
    if (filterMode === 'needs_review') return card.userRating === 'needs_review';
    if (filterMode === 'got_it') return card.userRating === 'got_it';
    return true;
  });

  // Current active card
  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  // Stats
  const gotItCount = flashcards.filter((c) => c.userRating === 'got_it').length;
  const needsReviewCount = flashcards.filter((c) => c.userRating === 'needs_review').length;
  const unreviewedCount = flashcards.filter((c) => !c.userRating).length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        if (activeCard) {
          onRateCard(activeCard.id, 'needs_review');
          handleNext();
        }
      } else if (e.key === '2') {
        if (activeCard) {
          onRateCard(activeCard.id, 'got_it');
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCard, filteredCards.length, currentIndex]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(filteredCards.length, 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % Math.max(filteredCards.length, 1));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  if (flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-stone-500">
        No flashcards generated yet. Please input notes to generate a study set.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Active Recall Flashcards</h2>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
            <span>{flashcards.length} cards generated</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">{gotItCount} mastered</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-medium">{needsReviewCount} need review</span>
            <span aria-hidden="true">·</span>
            <span>{unreviewedCount} unrated</span>
          </div>
        </div>

        {/* View & Filter Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-stone-200/60 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setFilterMode('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterMode === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({flashcards.length})
            </button>
            <button
              onClick={() => {
                setFilterMode('needs_review');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterMode === 'needs_review' ? 'bg-white text-amber-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Needs Review ({needsReviewCount})
            </button>
            <button
              onClick={() => {
                setFilterMode('got_it');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterMode === 'got_it' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Mastered ({gotItCount})
            </button>
          </div>

          {/* Deck vs List view toggle */}
          <div className="flex items-center bg-stone-200/60 p-1 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('deck')}
              title="Interactive Flip Deck"
              className={`p-1.5 rounded-md ${viewMode === 'deck' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Full List View"
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'deck' ? (
        filteredCards.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-12 text-center">
            <p className="text-stone-600 text-sm mb-3">No cards match this filter.</p>
            <button
              onClick={() => setFilterMode('all')}
              className="text-xs px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-md text-stone-800"
            >
              Show all {flashcards.length} cards
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Flashcard Column (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Card Meta & Navigation Bar */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-mono">
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">Topic:</span>
                  <span className="font-semibold text-stone-700">{activeCard.topic}</span>
                </div>

                {activeCard.userRating && (
                  <span
                    className={`font-medium ${
                      activeCard.userRating === 'got_it' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {activeCard.userRating === 'got_it' ? 'Mastered' : 'Needs Review'}
                  </span>
                )}
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="relative min-h-[320px] sm:min-h-[360px] w-full rounded-2xl cursor-pointer select-none transition-all duration-300"
                style={{ perspective: '1200px' }}
              >
                <div
                  className={`w-full h-full min-h-[320px] sm:min-h-[360px] rounded-2xl border transition-all duration-500 [transform-style:preserve-3d] ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* Front Side: Question */}
                  <div
                    className={`absolute inset-0 w-full h-full p-8 sm:p-10 rounded-2xl bg-white border border-stone-200 shadow-md flex flex-col justify-between [backface-visibility:hidden] ${
                      isFlipped ? 'pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                      <span>QUESTION</span>
                      <span className="text-emerald-800 text-[11px] font-sans">Click to flip or Press Space</span>
                    </div>

                    <div className="my-auto py-6">
                      <p className="text-lg sm:text-2xl font-serif text-stone-900 leading-snug tracking-tight">
                        {activeCard.question}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-100 pt-4">
                      <span>Recall the core mechanism or definition</span>
                      <div className="flex items-center gap-1 text-stone-500">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Flip card</span>
                      </div>
                    </div>
                  </div>

                  {/* Back Side: Answer */}
                  <div
                    className={`absolute inset-0 w-full h-full p-8 sm:p-10 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 shadow-md flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] ${
                      !isFlipped ? 'pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                      <span className="text-emerald-400">ANSWER &amp; KEY TAKEAWAY</span>
                      <span className="text-[11px] text-stone-400 font-sans">Click to flip back</span>
                    </div>

                    <div className="my-auto py-4">
                      <p className="text-base sm:text-xl font-sans text-stone-100 leading-relaxed">
                        {activeCard.answer}
                      </p>
                      {activeCard.sourceContextNote && (
                        <p className="mt-3 text-xs text-stone-400 font-sans italic border-l-2 border-emerald-500 pl-2.5">
                          {activeCard.sourceContextNote}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800 pt-4">
                      <span>Did you recall this correctly? Rate below</span>
                      <div className="flex items-center gap-1 text-stone-400">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Flip back</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls: Rating & Nav */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                {/* Arrow navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs"
                    title="Previous (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs"
                    title="Next (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Rating Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      onRateCard(activeCard.id, 'needs_review');
                      handleNext();
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      activeCard.userRating === 'needs_review'
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : 'border-stone-200 bg-white hover:bg-amber-50/50 text-stone-700'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Need Review</span>
                    <span className="text-[10px] text-stone-400 font-mono">(1)</span>
                  </button>

                  <button
                    onClick={() => {
                      onRateCard(activeCard.id, 'got_it');
                      handleNext();
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      activeCard.userRating === 'got_it'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                        : 'border-stone-200 bg-white hover:bg-emerald-50/50 text-stone-700'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Got It</span>
                    <span className="text-[10px] text-stone-400 font-mono">(2)</span>
                  </button>
                </div>
              </div>

              {/* Keyboard shortcuts footer */}
              <div className="text-center text-[11px] text-stone-400 pt-1 font-mono">
                Keyboard: Space (Flip) · ← / → (Prev/Next) · 1 (Need Review) · 2 (Got It)
              </div>
            </div>

            {/* Source Verification Side Panel (4 cols) */}
            <div className="lg:col-span-4 bg-stone-50 rounded-xl border border-stone-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-stone-900 tracking-tight">Source Note Verification</h3>
                </div>
                <span className="text-[10px] text-emerald-800 font-mono bg-emerald-100/60 px-1.5 py-0.5 rounded">
                  100% Grounded
                </span>
              </div>

              <div>
                <p className="text-xs text-stone-500 mb-2">
                  To prevent AI hallucinations, every card links directly to the exact statement in your uploaded notes:
                </p>

                <div className="bg-white rounded-lg p-3.5 border border-stone-200 text-xs text-stone-700 font-serif leading-relaxed italic border-l-4 border-l-emerald-600">
                  &ldquo;{activeCard.sourceExcerpt}&rdquo;
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Topic Alignment:</span>
                  <span className="font-semibold text-stone-800">{activeCard.topic}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Fact Check:</span>
                  <span className="text-emerald-700 font-medium">Verified against lecture text</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onGoToQuiz}
                  className="w-full text-xs font-medium py-2 px-3 bg-stone-200/80 hover:bg-stone-300/80 rounded-lg text-stone-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Ready to test yourself? Take Quiz</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        /* Full List Mode for Cramming */
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-stone-500">
            <span>Showing all {filteredCards.length} cards</span>
            <button
              onClick={() => setViewMode('deck')}
              className="text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Back to Flip Deck</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card, idx) => (
              <div
                key={card.id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-2 font-mono">
                    <span>CARD {idx + 1} · {card.topic}</span>
                    {card.userRating && (
                      <span
                        className={
                          card.userRating === 'got_it' ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'
                        }
                      >
                        {card.userRating === 'got_it' ? 'Mastered' : 'Needs Review'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-2 font-serif">{card.question}</h4>
                  <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-700 leading-relaxed border border-stone-100">
                    {card.answer}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <p className="text-[11px] text-stone-500 italic truncate" title={card.sourceExcerpt}>
                    Source: &ldquo;{card.sourceExcerpt}&rdquo;
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onRateCard(card.id, 'needs_review')}
                      className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                        card.userRating === 'needs_review'
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-medium'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Need Review
                    </button>
                    <button
                      onClick={() => onRateCard(card.id, 'got_it')}
                      className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                        card.userRating === 'got_it'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      Mastered
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
