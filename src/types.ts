export interface Flashcard {
  id: string;
  topic: string;
  question: string;
  answer: string;
  sourceExcerpt: string; // The exact or near-exact sentence from student's notes to verify accuracy
  sourceContextNote?: string; // Short note on why this matters
  userRating?: 'got_it' | 'needs_review' | null;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer';
  topic: string;
  question: string;
  options?: string[]; // for multiple_choice (4 items)
  correctAnswerIndex?: number; // 0-3 for multiple_choice
  explanation: string; // Detailed breakdown of why correct and why others are wrong
  sampleAnswer?: string; // for short_answer
  rubricKeyPoints?: string[]; // 2-3 key criteria for grading short answers
  sourceExcerpt: string; // Excerpt from lecture notes verifying this question
  userAnswer?: string | number | null;
  userSelfEvaluation?: 'correct' | 'partial' | 'incorrect' | null; // for short answer
}

export interface StudyPlanDay {
  dayNumber: number;
  dateLabel: string;
  focusTopic: string;
  targetOutcome: string;
  allocatedMinutes: number;
  tasks: {
    id: string;
    text: string;
    done: boolean;
  }[];
}

export interface TopicProgress {
  topic: string;
  totalCards: number;
  cardsKnown: number;
  cardsNeedReview: number;
  quizTotal: number;
  quizCorrect: number;
  masteryPercentage: number;
  status: 'weak' | 'developing' | 'mastered';
}

export interface StudySet {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  examDate?: string;
  summary: string;
  originalNotes: string;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  studyPlan: StudyPlanDay[];
  keyTopics: string[];
}

export type SubjectPreset = 'biology' | 'economics' | 'law' | 'general';
