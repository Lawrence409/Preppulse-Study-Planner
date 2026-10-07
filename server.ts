import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '35mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// JSON Schema for Study Set Generation
const studySetSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Clear academic title for this study set' },
    subject: { type: Type.STRING, description: 'Subject or course category (e.g. Biology, Macroeconomics)' },
    summary: { type: Type.STRING, description: '2-sentence executive summary of the core concepts' },
    keyTopics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '4 to 6 core topic names or concepts covered in the notes',
    },
    flashcards: {
      type: Type.ARRAY,
      description: '8 to 12 high-yield active-recall flashcards',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          topic: { type: Type.STRING },
          question: { type: Type.STRING, description: 'Punchy, test-like question testing understanding' },
          answer: { type: Type.STRING, description: 'Clear, crisp, accurate answer' },
          sourceExcerpt: {
            type: Type.STRING,
            description: 'Exact or near-exact verbatim sentence from the student notes verifying this answer',
          },
          sourceContextNote: {
            type: Type.STRING,
            description: 'Brief 1-sentence context of why this appears on exams',
          },
        },
        required: ['id', 'topic', 'question', 'answer', 'sourceExcerpt'],
      },
    },
    quizQuestions: {
      type: Type.ARRAY,
      description: '6 to 8 exam-style questions mixing multiple choice and short answer',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: {
            type: Type.STRING,
            description: 'Either "multiple_choice" or "short_answer"',
          },
          topic: { type: Type.STRING },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Exactly 4 distinct plausible answer choices (for multiple_choice only)',
          },
          correctAnswerIndex: {
            type: Type.INTEGER,
            description: '0-based index of correct option (0 to 3 for multiple_choice)',
          },
          explanation: {
            type: Type.STRING,
            description: 'Thorough explanation of why the answer is right and why common distractors fail',
          },
          sampleAnswer: {
            type: Type.STRING,
            description: 'Ideal model answer for short_answer questions',
          },
          rubricKeyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 bullet points grading criteria for short answers',
          },
          sourceExcerpt: {
            type: Type.STRING,
            description: 'Exact or near-exact sentence from notes backing up this question',
          },
        },
        required: ['id', 'type', 'topic', 'question', 'explanation', 'sourceExcerpt'],
      },
    },
    studyPlan: {
      type: Type.ARRAY,
      description: 'Day-by-day study schedule counting down to exam',
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          dateLabel: { type: Type.STRING, description: 'e.g. Day 1 (Oct 8) or Day 1: Foundation' },
          focusTopic: { type: Type.STRING },
          targetOutcome: { type: Type.STRING, description: 'Measurable goal for this day' },
          allocatedMinutes: { type: Type.INTEGER, description: 'Suggested study minutes (e.g. 35 to 60)' },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                done: { type: Type.BOOLEAN },
              },
              required: ['id', 'text', 'done'],
            },
          },
        },
        required: ['dayNumber', 'dateLabel', 'focusTopic', 'targetOutcome', 'allocatedMinutes', 'tasks'],
      },
    },
  },
  required: ['title', 'subject', 'summary', 'keyTopics', 'flashcards', 'quizQuestions', 'studyPlan'],
};

// API Route: Generate Complete Study Set
app.post('/api/generate-study-set', async (req: Request, res: Response) => {
  try {
    const { notes, fileData, examDate, subject } = req.body;

    if (!notes && !fileData) {
      res.status(400).json({ error: 'Please provide note text or an uploaded document/photo.' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const targetExamDate = examDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const promptText = `
You are an elite college exam preparation engine built for university students studying for high-stakes midterms and finals.
Today is ${todayStr}. The student's upcoming exam date is: ${targetExamDate}.
Optional user-specified subject: ${subject || 'Auto-detect from notes'}.

Your task is to transform these lecture notes into a battle-ready study set in ONE pass:
1. Executive Summary & 4-6 Key Topics.
2. 8 to 12 High-Yield Active-Recall Flashcards:
   - Make questions test deep conceptual understanding and application, not just rote definitions.
   - CRITICAL REQUIREMENT FOR AI ACCURACY: For EVERY flashcard, provide 'sourceExcerpt' containing the exact or near-exact sentence from the lecture notes so the student can verify the card against their own notes!
3. 6 to 8 Exam Questions (strictly generate at least 4 multiple_choice questions and at least 2 short_answer questions):
   - Multiple choice must have 4 options, realistic distractors, and a full explanation.
   - Short answer must have a sample model answer and 2-3 rubric points for grading.
   - Every question MUST include 'sourceExcerpt' showing the exact source text from the notes.
4. Day-by-Day Study Plan:
   - Provide a spaced-repetition plan up until the exam date (between 4 and 7 days).
   - Each day must target specific topics, clear outcomes, and actionable tasks with estimated minutes (30-60 mins).
   - Day 1: Foundation & Core terminology.
   - Mid-days: Active recall & deep dive on challenging concepts.
   - Penultimate day: Timed practice quiz & weak-spot drills.
   - Final day / Eve: Light review, summary formula/terms check, rest & confidence check.

Student's notes:
${notes || 'See attached image/document for lecture notes.'}
`;

    const parts: any[] = [];
    if (fileData && fileData.data && fileData.mimeType) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data,
        },
      });
    }
    parts.push({ text: promptText });

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let responseText = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            systemInstruction:
              'You are a rigorous academic study assistant for university courses (STEM, Pre-Med, Economics, Law, Humanities). Always extract ground truth from the student notes and quote the source text in sourceExcerpt. Ensure all JSON fields adhere strictly to the schema.',
            responseMimeType: 'application/json',
            responseSchema: studySetSchema as any,
            temperature: 0.2,
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} failed, trying next candidate:`, err?.message);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error('Unable to generate study set. Please try again.');
    }
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      // Clean possible backticks
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Attach metadata
    const studySet = {
      id: 'set_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      examDate: targetExamDate,
      originalNotes: notes || 'Uploaded file / photo notes',
      ...parsedData,
    };

    res.json(studySet);
  } catch (error: any) {
    console.error('Error generating study set:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate study set. Please try again with shorter notes or clear text.',
    });
  }
});

// API Route: Cram Weak Topics (Rapid targeted drill)
app.post('/api/cram-weak-topics', async (req: Request, res: Response) => {
  try {
    const { weakTopics, originalNotes } = req.body;

    if (!weakTopics || !Array.isArray(weakTopics) || weakTopics.length === 0) {
      res.status(400).json({ error: 'Please provide at least one weak topic.' });
      return;
    }

    const cramSchema = {
      type: Type.OBJECT,
      properties: {
        targetedCards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              sourceExcerpt: { type: Type.STRING },
              sourceContextNote: { type: Type.STRING },
            },
            required: ['id', 'topic', 'question', 'answer', 'sourceExcerpt'],
          },
        },
        targetedQuiz: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              topic: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              sampleAnswer: { type: Type.STRING },
              rubricKeyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              sourceExcerpt: { type: Type.STRING },
            },
            required: ['id', 'type', 'topic', 'question', 'explanation', 'sourceExcerpt'],
          },
        },
        coachAdvice: {
          type: Type.STRING,
          description: 'A 2-sentence tactical tip on how to untangle these specific weak topics before exam day',
        },
      },
      required: ['targetedCards', 'targetedQuiz', 'coachAdvice'],
    };

    const prompt = `
The student scored low or requested extra practice on these specific WEAK TOPICS:
${weakTopics.join(', ')}

Here are their original notes:
${originalNotes ? originalNotes.slice(0, 4000) : 'Use general university-level domain mastery for: ' + weakTopics.join(', ')}

Generate a targeted CRAM DRILL:
1. Exactly 5 sharp flashcards attacking the most common traps and nuances of these weak topics. Include verbatim 'sourceExcerpt' where possible.
2. Exactly 3 diagnostic multiple-choice questions with thorough explanations targeting the exact misconceptions students usually have.
3. 2-sentence tactical coach advice for exam day.
`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let responseText = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: cramSchema as any,
            temperature: 0.3,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error('Failed to generate cram session');
    }
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);

    res.json(result);
  } catch (error: any) {
    console.error('Error generating cram drill:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate cram session' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'PrepPulse API', time: new Date().toISOString() });
});

// Vite Middleware for Dev or Static file serving for Prod
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrepPulse running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
