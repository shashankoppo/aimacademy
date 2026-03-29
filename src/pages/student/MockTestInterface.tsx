import React, { useState, useEffect } from "react";
import { 
  Clock, ChevronLeft, ChevronRight, CheckCircle2, 
  AlertTriangle, Flag, ArrowRight, BookOpen, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const sampleQuestions = [
  {
    id: 1,
    question: "Which Article of the Indian Constitution deals with the Right to Equality?",
    options: ["Article 12", "Article 14", "Article 19", "Article 21"],
    correct: 1,
  },
  {
    id: 2,
    question: "The Preamble to the Indian Constitution was amended by which Constitutional Amendment?",
    options: ["42nd Amendment", "44th Amendment", "52nd Amendment", "73rd Amendment"],
    correct: 0,
  },
  {
    id: 3,
    question: "Who is known as the Father of the Indian Constitution?",
    options: ["Mahatma Gandhi", "Jawaharlal Nehru", "B.R. Ambedkar", "Sardar Patel"],
    correct: 2,
  },
  {
    id: 4,
    question: "The Directive Principles of State Policy are enshrined in which Part of the Constitution?",
    options: ["Part III", "Part IV", "Part IVA", "Part V"],
    correct: 1,
  },
  {
    id: 5,
    question: "Which Schedule of the Indian Constitution deals with the distribution of powers between Union and States?",
    options: ["Fifth Schedule", "Sixth Schedule", "Seventh Schedule", "Eighth Schedule"],
    correct: 2,
  },
  {
    id: 6,
    question: "The concept of 'Judicial Review' in India is adopted from the Constitution of which country?",
    options: ["United Kingdom", "United States of America", "Canada", "Australia"],
    correct: 1,
  },
  {
    id: 7,
    question: "Which body has the power to amend the Fundamental Rights?",
    options: ["Supreme Court", "President", "Parliament", "Election Commission"],
    correct: 2,
  },
  {
    id: 8,
    question: "The first General Elections in India were held in which year?",
    options: ["1947", "1950", "1951-52", "1955"],
    correct: 2,
  },
  {
    id: 9,
    question: "Who appoints the Chief Election Commissioner of India?",
    options: ["Prime Minister", "Chief Justice of India", "President", "Vice President"],
    correct: 2,
  },
  {
    id: 10,
    question: "Under which Article can the President of India declare a National Emergency?",
    options: ["Article 352", "Article 356", "Article 360", "Article 368"],
    correct: 0,
  },
];

const MockTestInterface = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setSubmitted(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

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
    if (next.has(qIndex)) next.delete(qIndex); else next.add(qIndex);
    setFlagged(next);
  };

  const getScore = () => {
    let correct = 0;
    sampleQuestions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    return correct;
  };

  if (submitted) {
    const score = getScore();
    const total = sampleQuestions.length;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <div className={`w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-black ${
              pct >= 70 ? "bg-emerald-50 text-emerald-600" : pct >= 40 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
            }`}>
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
                <div className="text-2xl font-black text-red-600">{Object.keys(answers).length - score}</div>
                <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Wrong</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <div className="text-2xl font-black text-slate-500">{total - Object.keys(answers).length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skipped</div>
              </div>
            </div>
            
            {/* Answer Review */}
            <div className="text-left mb-10">
              <h3 className="heading-display text-lg mb-6">Answer Review</h3>
              <div className="space-y-4">
                {sampleQuestions.map((q, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${answers[i] === q.correct ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${answers[i] === q.correct ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>{i + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-2">{q.question}</p>
                        <p className="text-xs text-slate-500">Your answer: <span className="font-bold">{answers[i] !== undefined ? q.options[answers[i]] : "Not answered"}</span></p>
                        {answers[i] !== q.correct && <p className="text-xs text-emerald-600 font-bold mt-1">Correct: {q.options[q.correct]}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link to="/student/dashboard" className="btn-outline-coursera py-3 px-8">Back to Dashboard</Link>
              <Link to="/student/mock-tests" className="btn-coursera py-3 px-8">More Tests</Link>
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
            <h1 className="heading-display text-lg text-slate-900">Indian Polity — Prelims Mock #12</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">10 Questions · 30 Minutes · Full Mock</p>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-black ${
              timeLeft < 300 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-900"
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => setSubmitted(true)}
              className="btn-coursera py-2.5 px-6"
            >
              Submit Test
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Question Area */}
          <div className="lg:col-span-9 bg-white rounded-xl border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <span className="badge-academic">Question {currentQ + 1} of {sampleQuestions.length}</span>
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

            <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
              {sampleQuestions[currentQ].question}
            </h2>

            <div className="space-y-4 mb-10">
              {sampleQuestions[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQ, i)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                    answers[currentQ] === i
                      ? "border-primary bg-primary/5"
                      : "border-slate-100 hover:border-primary/30 bg-white"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
                    answers[currentQ] === i 
                      ? "border-primary bg-primary text-white" 
                      : "border-slate-200 text-slate-400 group-hover:border-primary/40"
                  }`}>
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
                onClick={() => setCurrentQ(Math.min(sampleQuestions.length - 1, currentQ + 1))}
                disabled={currentQ === sampleQuestions.length - 1}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm disabled:opacity-30 hover:bg-primary/90 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 p-6">
            <h3 className="heading-display text-sm mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {sampleQuestions.map((_, i) => (
                <button
                  key={i}
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
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /> <span className="text-slate-400">Answered ({Object.keys(answers).length})</span></div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /> <span className="text-slate-400">Flagged ({flagged.size})</span></div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded bg-slate-50 border border-slate-100" /> <span className="text-slate-400">Unanswered ({sampleQuestions.length - Object.keys(answers).length})</span></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MockTestInterface;
