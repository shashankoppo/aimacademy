import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/admin-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type Question = {
  question: string;
  options: string[];
  correct: number;
};

type MockTest = {
  id: string;
  title: string;
  durationMinutes: number;
  isPublished: boolean;
  scheduledAt: string;
  questions: any[];
  _count: {
    attempts: number;
  };
};

const MockTestManagement = () => {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);
  
  const [form, setForm] = useState({
    title: "",
    durationMinutes: 30,
    isPublished: false,
    scheduledAt: new Date().toISOString().slice(0, 16),
    questions: [] as Question[],
  });

  const loadTests = async () => {
    try {
      const data = await apiRequest<{ success: true; tests: MockTest[] }>("/admin/mock-tests");
      setTests(data.tests);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load mock tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTests();
  }, []);

  const openCreate = () => {
    setEditingTest(null);
    setForm({
      title: "",
      durationMinutes: 30,
      isPublished: false,
      scheduledAt: new Date().toISOString().slice(0, 16),
      questions: [{ question: "", options: ["", "", "", ""], correct: 0 }],
    });
    setIsModalOpen(true);
  };

  const openEdit = (test: MockTest) => {
    setEditingTest(test);
    const formattedQuestions = test.questions.map((q: any) => {
      let parsedOptions = ["", "", "", ""];
      try {
        if (q.optionsJson && q.optionsJson !== "undefined") {
          parsedOptions = JSON.parse(q.optionsJson);
        }
      } catch (e) {
        console.error("Failed to parse optionsJson:", q.optionsJson);
      }
      return {
        question: q.question,
        options: parsedOptions,
        correct: q.correctIndex,
      };
    });
    setForm({
      title: test.title,
      durationMinutes: test.durationMinutes,
      isPublished: test.isPublished,
      scheduledAt: test.scheduledAt ? new Date(test.scheduledAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      questions: formattedQuestions.length ? formattedQuestions : [{ question: "", options: ["", "", "", ""], correct: 0 }],
    });
    setIsModalOpen(true);
  };

  const saveTest = async () => {
    try {
      if (editingTest) {
        await apiRequest(`/admin/mock-tests/${editingTest.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast.success("Mock test updated");
      } else {
        await apiRequest("/admin/mock-tests", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.success("Mock test created");
      }
      setIsModalOpen(false);
      void loadTests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save mock test");
    }
  };

  const deleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await apiRequest(`/admin/mock-tests/${id}`, { method: "DELETE" });
      toast.success("Mock test deleted");
      void loadTests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete test");
    }
  };

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: "", options: ["", "", "", ""], correct: 0 }]
    }));
  };

  const updateQuestion = (qIndex: number, field: string, value: any, optIndex?: number) => {
    setForm(prev => {
      const q = [...prev.questions];
      const updatedQuestion = { ...q[qIndex] };
      if (field === "options" && typeof optIndex === "number") {
        const newOptions = [...updatedQuestion.options];
        newOptions[optIndex] = value;
        updatedQuestion.options = newOptions;
      } else {
        (updatedQuestion as any)[field] = value;
      }
      q[qIndex] = updatedQuestion;
      return { ...prev, questions: q };
    });
  };

  const removeQuestion = (index: number) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const filteredTests = tests.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Mock Tests</h1>
          <p className="text-slate-500 mt-1">Create and manage student mock tests.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Create Test
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Attempts</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading tests...</td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No mock tests found.</td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{test.title}</div>
                      <div className="text-sm text-slate-500">{test.questions.length} questions</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-4 h-4" />
                        {test.durationMinutes} mins
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        test.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {test.isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {test.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {test._count.attempts}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(test)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTest(test.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTest ? "Edit Mock Test" : "Create Mock Test"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Duration (Minutes)</Label>
                <Input type="number" value={form.durationMinutes} onChange={e => setForm(p => ({ ...p, durationMinutes: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Scheduled Date & Time</Label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} />
              <Label htmlFor="published">Published (Visible to students)</Label>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Questions</h3>
                <button onClick={addQuestion} className="text-sm bg-slate-100 text-slate-900 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-200">
                  + Add Question
                </button>
              </div>

              <div className="space-y-6">
                {form.questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-4 border border-slate-200 rounded-xl relative">
                    <button onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 pr-8">
                      <div className="grid gap-2">
                        <Label>Question {qIndex + 1}</Label>
                        <Input value={q.question} onChange={e => updateQuestion(qIndex, "question", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correct === optIndex}
                              onChange={() => updateQuestion(qIndex, "correct", optIndex)}
                              className="w-4 h-4 text-primary"
                            />
                            <Input
                              value={opt}
                              onChange={e => updateQuestion(qIndex, "options", e.target.value, optIndex)}
                              placeholder={`Option ${optIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => void saveTest()} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90">
              Save Test
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MockTestManagement;
