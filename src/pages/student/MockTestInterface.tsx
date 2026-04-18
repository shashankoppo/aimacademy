import React, { useEffect, useMemo, useState } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Flag,
  ArrowRight,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { apiRequest } from "@/lib/admin-api";

type Question = { id: string; question: string; options: string[]; correct: number };

const MockTestInterface = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(1800);
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [testTitle, setTestTitle] = useState("AIM Mock Test");
  const [testId, setTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(1800);
  const [submitInFlight, setSubmitInFlight] = useState(false);
  const [serverScore, setServerScore] = useState<{ score: number; total: number; pct: number } | null>(null);

  const location = useLocation();
  const requestedTestId = useMemo(() => {
    const q = new URLSearchParams(location.search);
    const id = q.get("testId");
    return id && id.trim() ? id.trim() : null;
  }, [location.search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const load = async () => {
      const data = requestedTestId
        ? await apiRequest<{ success: true; test: { id: string; title: string; durationSeconds: number; questions: Question[] } }>(
            `/student/mock-test/${encodeURIComponent(requestedTestId)}`,
          )
        : await apiRequest<{ success: true; test: { id: string; title: string; durationSeconds: number; questions: Question[] } }>(
            "/student/mock-test/current",
          );

      if (!active) return;
      setTestId(data.test.id);
      setTestTitle(data.test.title);
      setQuestions(data.test.questions);
      setDurationSeconds(data.test.durationSeconds);
      setTimeLeft(data.test.durationSeconds);
      setCurrentQ(0);
      setAnswers({});
      setFlagged(new Set());
      setSubmitted(false);
      setServerScore(null);
    };

    void load()
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load mock test"))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [requestedTestId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (qIndex: number, optIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  const toggleFlag = (qIndex: number) => {
    const next = new Set(flagged);
    if (next.has(qIndex)) next.delete(qIndex);
    else next.add(qIndex);
    setFlagged(next);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    return correct;
  };

  const doSubmit = async () => {
    if (!testId) return;
    if (submitInFlight) return;
    setSubmitInFlight(true);
    try {
      const payload: Record<string, number> = {};
      for (const [k, v] of Object.entries(answers)) payload[String(k)] = v;
      const resp = await apiRequest<{ success: true; result: { score: number; total: number; pct: number } }>(
        `/student/mock-test/${encodeURIComponent(testId)}/submit`,
        { method: "POST", body: JSON.stringify({ answers: payload }) },
      );
      setServerScore(resp.result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit test");
    } finally {
      setSubmitInFlight(false);
    }
  };

  useEffect(() => {
    if (submitted || loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          void doSubmit().finally(() => setSubmitted(true));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, loading, testId, answers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-10 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white rounded-xl border border-slate-100 p-8">
            <h1 className="heading-display text-lg text-slate-900">Loading Mock Test…</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-10 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
            <h1 className="heading-display text-lg text-slate-900 mb-2">No Mock Test Available</h1>
            <p className="text-slate-500 text-sm">Please go back to your dashboard.</p>
            <div className="mt-6">
              <Link to="/student/dashboard" className="btn-coursera py-2.5 px-6">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const localScore = getScore();
    const total = questions.length;
    const score = serverScore?.score ?? localScore;
    const pct = serverScore?.pct ?? (total ? Math.round((score / total) * 100) : 0);
    const answeredCount = Object.keys(answers).length;
    const wrong = answeredCount - score;

    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div
              className={`w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-black ${
                pct >= 70 ? "bg-emerald-50 text-emerald-600" : pct >= 40 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
              }`}
            >
              {pct}%
            </div>
            <h1 className="heading-display text-3xl text-slate-900 mb-4">Test Completed!</h1>
            <p className="text-slate-500 text-lg mb-8">
              You scored <span className="font-black text-slate-900">{score}/{total}</span> correct answers.
            </p>
            <div className="grid grid-cols-3 gap-6 mb-10 max-w-md mx-auto">
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <div className="text-2xl font-black text-emerald-600">{score}</div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Correct</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl text-center">
                <div className="text-2xl font-black text-red-600">{wrong}</div>
                <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Wrong</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <div className="text-2xl font-black text-slate-600">{total - answeredCount}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skipped</div>
              </div>
            </div>

            {/* Answer Review */}
            <div className="mt-10 text-left">
              <h3 className="heading-display text-xl mb-6">Answer Review</h3>
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="p-5 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-start gap-3">
                      <span
                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          answers[i] === q.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-2">{q.question}</p>
                        <p className="text-xs text-slate-500">
                          Your answer: <span className="font-bold">{answers[i] !== undefined ? q.options[answers[i]] : "Not answered"}</span>
                        </p>
                        {answers[i] !== q.correct && <p className="text-xs text-emerald-600 font-bold mt-1">Correct: {q.options[q.correct]}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-10">
              <Link to="/student/dashboard" className="btn-outline-coursera py-3 px-8">
                Back to Dashboard
              </Link>
              <Link to="/student/dashboard" className="btn-coursera py-3 px-8">
                More Tests
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-10 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Top Bar */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="heading-display text-lg text-slate-900">{testTitle}</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {questions.length} Questions Â· {Math.max(1, Math.round(durationSeconds / 60))} Minutes Â· Full Mock
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-black ${
                timeLeft < 300 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-900"
              }`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={() => void doSubmit().finally(() => setSubmitted(true))}
              disabled={submitInFlight}
              className="btn-coursera py-2.5 px-6"
            >
              {submitInFlight ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-9 bg-white rounded-xl border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <span className="badge-academic">Question {currentQ + 1} of {questions.length}</span>
              <button
                onClick={() => toggleFlag(currentQ)}
                aria-label="Flag question"
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                  flagged.has(currentQ) ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-500"
                }`}
              >
                <Flag className="w-3 h-3" /> {flagged.has(currentQ) ? "Flagged" : "Flag for Review"}
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">{questions[currentQ].question}</h2>

            <div className="space-y-4 mb-10">
              {questions[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQ, i)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                    answers[currentQ] === i ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/30 bg-white"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
                      answers[currentQ] === i ? "border-primary bg-primary text-white" : "border-slate-200 text-slate-400 group-hover:border-primary/40"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className={`font-medium ${answers[currentQ] === i ? "text-primary" : "text-slate-700"}`}>{opt}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-500 rounded-lg font-bold text-sm disabled:opacity-30 hover:bg-slate-100 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                disabled={currentQ === questions.length - 1}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm disabled:opacity-30 hover:bg-primary/90 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h3 className="heading-display text-sm mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(i)}
                    className={`w-full aspect-square rounded-lg text-xs font-black flex items-center justify-center transition-all ${
                      currentQ === i
                        ? "bg-primary text-white ring-2 ring-primary/30"
                        : answers[i] !== undefined
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : flagged.has(i)
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="space-y-3 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />{" "}
                  <span className="text-slate-400">Answered ({Object.keys(answers).length})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />{" "}
                  <span className="text-slate-400">Flagged ({flagged.size})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-slate-50 border border-slate-100" />{" "}
                  <span className="text-slate-400">Unanswered ({questions.length - Object.keys(answers).length})</span>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h3 className="heading-display text-sm mb-4">Test Summary</h3>
              <div className="space-y-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> {questions.length} Questions
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> {Math.max(1, Math.round(durationSeconds / 60))} Minutes
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" /> Answered {Object.keys(answers).length}
                </div>
                {timeLeft < 300 && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-3.5 h-3.5" /> Less than 5 minutes left
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockTestInterface;

