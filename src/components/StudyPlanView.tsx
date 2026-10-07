import React, { useState } from 'react';
import { StudyPlanDay } from '../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Target,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface StudyPlanViewProps {
  studyPlan: StudyPlanDay[];
  examDate?: string;
  onToggleTask: (dayIndex: number, taskId: string) => void;
  onUpdateExamDate?: (newDate: string) => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  studyPlan,
  examDate,
  onToggleTask,
  onUpdateExamDate,
}) => {
  const [copied, setCopied] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(examDate || '');

  // Calculate days remaining
  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : studyPlan.length;

  const totalTasks = studyPlan.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTasks = studyPlan.reduce(
    (acc, d) => acc + d.tasks.filter((t) => t.done).length,
    0
  );
  const totalMinutes = studyPlan.reduce((acc, d) => acc + d.allocatedMinutes, 0);

  const handleCopySchedule = () => {
    const text = studyPlan
      .map(
        (day) =>
          `📌 ${day.dateLabel} (Focus: ${day.focusTopic} · ~${day.allocatedMinutes}m)\n` +
          `Outcome: ${day.targetOutcome}\n` +
          day.tasks.map((t) => `  [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadICS = () => {
    // Generate simple iCalendar format file
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PrepPulse//AI Study Plan//EN',
      'CALSCALE:GREGORIAN',
    ];

    const now = new Date();
    studyPlan.forEach((day, idx) => {
      const eventDate = new Date();
      eventDate.setDate(now.getDate() + idx);
      const dtStart = eventDate.toISOString().replace(/[-:]/g, '').split('T')[0];

      icsContent.push(
        'BEGIN:VEVENT',
        `SUMMARY:PrepPulse: ${day.focusTopic} Study Session`,
        `DESCRIPTION:${day.targetOutcome}\\nTasks:\\n${day.tasks.map((t) => '- ' + t.text).join('\\n')}`,
        `DTSTART;VALUE=DATE:${dtStart}`,
        `DURATION:PT${day.allocatedMinutes}M`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PrepPulse-Exam-Schedule.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!studyPlan || studyPlan.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-stone-500">
        No study plan available. Generate a study set first.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Countdown Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>EXAM COUNTDOWN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {daysUntilExam === 0
              ? 'Exam Day is Today!'
              : `${daysUntilExam} Days Until Your Exam`}
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
            A day-by-day active recall schedule designed to prevent cramming panic through spaced repetition.
          </p>

          <div className="flex items-center gap-3 text-xs text-stone-400 mt-4 flex-wrap">
            <span>{studyPlan.length} scheduled days</span>
            <span aria-hidden="true">·</span>
            <span>~{totalMinutes} total minutes</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">
              {completedTasks}/{totalTasks} tasks done ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Calendar Export & Date Tweak */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <button
            onClick={handleDownloadICS}
            className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-stone-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export to Google/Apple Cal</span>
          </button>

          <button
            onClick={handleCopySchedule}
            className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-stone-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Notion / Notes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Day by Day Timeline */}
      <div className="space-y-4">
        {studyPlan.map((day, dayIdx) => {
          const dayTasksComplete = day.tasks.filter((t) => t.done).length;
          const isAllDayDone = day.tasks.length > 0 && dayTasksComplete === day.tasks.length;

          return (
            <div
              key={day.dayNumber}
              className={`bg-white rounded-xl border transition-all p-5 sm:p-6 shadow-2xs ${
                isAllDayDone ? 'border-emerald-300 bg-emerald-50/10' : 'border-stone-200'
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isAllDayDone
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    D{day.dayNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 font-serif">
                      {day.dateLabel}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span>Focus:</span>
                      <span className="font-semibold text-stone-800">{day.focusTopic}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{day.allocatedMinutes} mins</span>
                  <span aria-hidden="true">·</span>
                  <span className={isAllDayDone ? 'text-emerald-700 font-semibold' : ''}>
                    {dayTasksComplete}/{day.tasks.length} done
                  </span>
                </div>
              </div>

              {/* Target Outcome */}
              <div className="my-3 text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-200/70 text-stone-700 flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900">Day Target: </span>
                  <span>{day.targetOutcome}</span>
                </div>
              </div>

              {/* Actionable Tasks Checklist */}
              <div className="space-y-2 mt-3">
                {day.tasks.map((task) => (
                  <label
                    key={task.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                      task.done
                        ? 'border-emerald-200 bg-emerald-50/40 text-stone-500 line-through'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => onToggleTask(dayIdx, task.id)}
                      className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-700 border-stone-300"
                    />
                    <span className="leading-relaxed flex-1">{task.text}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
