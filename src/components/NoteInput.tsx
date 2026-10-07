import React, { useState, useRef } from 'react';
import { SAMPLE_NOTES, SampleNotePreset } from '../data/sampleNotes';
import {
  FileText,
  Upload,
  Sparkles,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface NoteInputProps {
  onGenerate: (data: {
    notes: string;
    fileData?: { data: string; mimeType: string };
    examDate: string;
    subject: string;
  }) => Promise<void>;
  isLoading: boolean;
  userTier: 'free' | 'pro';
  setsUsed: number;
  maxFreeSets: number;
  onOpenPricing: () => void;
}

export const NoteInput: React.FC<NoteInputProps> = ({
  onGenerate,
  isLoading,
  userTier,
  setsUsed,
  maxFreeSets,
  onOpenPricing,
}) => {
  const [inputMode, setInputMode] = useState<'paste' | 'upload' | 'samples'>('paste');
  const [notesText, setNotesText] = useState('');
  const [subject, setSubject] = useState('Biology / STEM');
  
  // Default exam date to 7 days in the future
  const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [examDate, setExamDate] = useState(defaultDate);
  const [examPresetDays, setExamPresetDays] = useState<number>(7);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    mimeType: string;
    data: string; // base64
    previewUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = notesText.trim() ? notesText.trim().split(/\s+/).length : 0;
  const isFreeLimitReached = userTier === 'free' && setsUsed >= maxFreeSets;

  const handleSelectSample = (sample: SampleNotePreset) => {
    setNotesText(sample.content);
    setSubject(sample.subject.split('/')[0].trim());
    setInputMode('paste');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type || 'application/octet-stream',
        data: base64Data,
        previewUrl: file.type.startsWith('image/') ? result : undefined,
      });

      // If it's a plain text or markdown file, also populate the text preview
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const textReader = new FileReader();
        textReader.onload = () => {
          if (typeof textReader.result === 'string') {
            setNotesText(textReader.result);
          }
        };
        textReader.readAsText(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetExamPreset = (days: number) => {
    setExamPresetDays(days);
    const d = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    setExamDate(d);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFreeLimitReached) {
      onOpenPricing();
      return;
    }

    if (!notesText.trim() && !selectedFile) {
      return;
    }

    onGenerate({
      notes: notesText,
      fileData: selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType } : undefined,
      examDate,
      subject,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Pitch */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>Turn notes into study material in under 60 seconds</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Paste your notes, get flashcards, a quiz, and a study plan.
        </h1>
        <p className="mt-2.5 text-stone-600 max-w-2xl mx-auto text-base">
          Built specifically for college students facing exam week. Includes source note verification so you know the AI isn&apos;t hallucinating facts.
        </p>
      </div>

      {/* Free tier notice banner if approaching limit */}
      {userTier === 'free' && (
        <div className="mb-6 p-3 bg-stone-100 rounded-lg border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">Free Tier:</span>
            <span>{setsUsed} of {maxFreeSets} monthly study sets used.</span>
          </div>
          <button
            onClick={onOpenPricing}
            className="text-emerald-800 font-medium hover:underline flex items-center gap-1"
          >
            <span>Need unlimited sets? Student plan is $4/mo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Input Mode Selector Bar */}
        <div className="flex border-b border-stone-200 bg-stone-50/50 p-2 gap-2">
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
              inputMode === 'paste'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
              inputMode === 'upload'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('samples')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
              inputMode === 'samples'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sample College Notes</span>
          </button>
        </div>

        {/* Input Bodies */}
        <div className="p-5 sm:p-6 space-y-5">
          {inputMode === 'paste' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="notes-textarea" className="text-xs font-medium text-stone-700">
                  Lecture Notes, Readings, or Study Guide
                </label>
                <span className="text-xs text-stone-400">
                  {wordCount > 0 ? `${wordCount} words` : 'Paste at least 50-100 words for best results'}
                </span>
              </div>
              <textarea
                id="notes-textarea"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={10}
                placeholder="Paste lecture notes, textbook summaries, professor slides outline, or exam review sheets here...&#10;&#10;e.g. 'Bio 101 - Lecture 8: Cellular Respiration. Glycolysis takes place in the cytosol and yields 2 net ATP and 2 NADH...'"
                className="w-full text-sm font-sans p-3.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 placeholder:text-stone-400 leading-relaxed resize-y"
              />
            </div>
          )}

          {inputMode === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-xl p-8 text-center cursor-pointer bg-stone-50/50 hover:bg-emerald-50/20 transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-emerald-100 text-stone-600 group-hover:text-emerald-800 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-stone-800 mb-1">
                  Upload your lecture slides, handwritten notes photo, or PDF
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Supports PDF, plain text, or photos of notebooks / lecture slides (JPG, PNG). The AI extracts text automatically.
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    {selectedFile.previewUrl ? (
                      <img
                        src={selectedFile.previewUrl}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded border border-stone-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-stone-200 flex items-center justify-center text-stone-700 font-bold">
                        PDF
                      </div>
                    )}
                    <div className="truncate">
                      <p className="font-medium text-stone-800 truncate">{selectedFile.name}</p>
                      <p className="text-stone-500">{selectedFile.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Optional supplementary text notes */}
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">
                  Additional context or instructor emphasis (optional)
                </label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  rows={3}
                  placeholder="e.g. Professor stressed that Complex IV and allosteric regulation of PFK-1 will be on Midterm 2..."
                  className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          )}

          {inputMode === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 mb-2">
                Click any real course notes below to test the flashcards, quiz, and study schedule generation instantly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_NOTES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="text-left p-3.5 rounded-lg border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] text-stone-500 font-mono block mb-1">
                        {sample.campusExample}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 mb-1 leading-snug">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-3 leading-relaxed">
                        {sample.content.slice(0, 120)}...
                      </p>
                    </div>
                    <span className="mt-3 text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                      <span>Load preset</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exam Date & Subject Row */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Exam Date */}
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>When is your exam?</span>
              </label>
              <div className="flex gap-1.5 mb-2">
                {[
                  { label: '3 days', days: 3 },
                  { label: '7 days', days: 7 },
                  { label: '14 days', days: 14 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleSetExamPreset(preset.days)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      examPresetDays === preset.days
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-medium'
                        : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={examDate}
                onChange={(e) => {
                  setExamDate(e.target.value);
                  setExamPresetDays(0);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full text-xs p-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              />
            </div>

            {/* Subject Area */}
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                <span>Subject Area</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2.5 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value="Biology / STEM">Biology / Pre-Med / Chemistry / Physics</option>
                <option value="Economics / Business">Economics / Finance / Business</option>
                <option value="Law / Political Science">Pre-Law / Poli Sci / Constitutional Law</option>
                <option value="Computer Science / Engineering">Computer Science / Engineering</option>
                <option value="Psychology / Social Science">Psychology / Sociology</option>
                <option value="General College Studies">General Humanities / Other</option>
              </select>
              <span className="text-[11px] text-stone-500 block mt-1">
                Calibrates terminology, active-recall rigor, and exam question style.
              </span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Verifies every generated flashcard and quiz question directly against your notes.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || (!notesText.trim() && !selectedFile)}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-900 hover:bg-emerald-950 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-100 font-medium text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Notes (~20s)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Generate Study Set & Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
