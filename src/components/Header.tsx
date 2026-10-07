import React from 'react';
import { BookOpen, Sparkles, GraduationCap, Calendar, CheckCircle2, Award } from 'lucide-react';

interface HeaderProps {
  currentTab: 'input' | 'flashcards' | 'quiz' | 'plan' | 'progress';
  onTabChange: (tab: 'input' | 'flashcards' | 'quiz' | 'plan' | 'progress') => void;
  hasStudySet: boolean;
  userTier: 'free' | 'pro';
  setsUsed: number;
  maxFreeSets: number;
  onOpenPricing: () => void;
  onReset: () => void;
  studySetTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  hasStudySet,
  userTier,
  setsUsed,
  maxFreeSets,
  onOpenPricing,
  onReset,
  studySetTitle,
}) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-stone-100 flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              P
            </div>
            <div>
              <span className="font-serif font-bold text-stone-900 tracking-tight text-lg flex items-center gap-1.5">
                PrepPulse
              </span>
              <span className="text-[11px] text-stone-500 block -mt-1 font-sans">
                AI Exam Prep Assistant
              </span>
            </div>
          </button>

          {studySetTitle && (
            <div className="hidden md:flex items-center text-xs text-stone-500 border-l border-stone-300 pl-3 ml-2 truncate max-w-xs">
              <span className="truncate font-medium text-stone-700">{studySetTitle}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs (if study set exists) */}
        {hasStudySet && (
          <nav className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-lg">
            <button
              onClick={() => onTabChange('flashcards')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                currentTab === 'flashcards'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => onTabChange('quiz')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                currentTab === 'quiz'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Quiz Mode
            </button>
            <button
              onClick={() => onTabChange('plan')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                currentTab === 'plan'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Study Plan
            </button>
            <button
              onClick={() => onTabChange('progress')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                currentTab === 'progress'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Weakness Tracker
            </button>
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {hasStudySet && (
            <button
              onClick={onReset}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-md hover:bg-stone-200/50 transition-colors"
            >
              + New Notes
            </button>
          )}

          {/* Pricing & Usage status */}
          {userTier === 'free' ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-stone-500 font-sans">
                {setsUsed}/{maxFreeSets} free sets used
              </span>
              <button
                onClick={onOpenPricing}
                className="text-xs font-medium bg-emerald-900 hover:bg-emerald-950 text-stone-100 px-3 py-1.5 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Upgrade</span>
                <span className="text-[10px] text-emerald-300 font-mono">$4/mo student</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-medium px-2 py-1 bg-emerald-100/70 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pro Student Active</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
