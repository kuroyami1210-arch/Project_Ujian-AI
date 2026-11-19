<?php

namespace App\Http\Controllers\Guru;

use App\Enums\QuestionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreExamRequest;
use App\Models\Exam;
use App\Models\Question;
use App\Support\QuestionBank;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    /**
     * Halaman generate soal — form terpisah dari dashboard.
     */
    public function create(): Response
    {
        return Inertia::render('guru/generate');
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        /** @var array<string, int> $quantities */
        $quantities = array_map('intval', $validated['question_quantities']);
        $total = array_sum($quantities);

        $exam = Exam::create([
            'guru_id' => $request->user()->id,
            'title' => 'Fisika — Hukum Gerak Newton',
            'topic' => $validated['topic'],
            'grade_level' => $validated['grade_level'],
            'jumlah_soal' => $total,
            'question_types' => array_keys($quantities),
            'token' => $this->uniqueToken(),
            'duration_minutes' => $validated['duration_minutes'] ?? 30,
            'status' => 'draft',
        ]);

        foreach (QuestionBank::generate($quantities) as $i => $item) {
            $exam->questions()->create([
                'order' => $i,
                'type' => $item['type']->value,
                'question' => $item['question'],
                'options' => $item['options'],
                'correct_answer' => $item['correct_answer'],
                'correct_answers' => $item['correct_answers'],
            ]);
        }

        return redirect()
            ->route('guru.exams.edit', $exam)
            ->with('status', "{$total} soal berhasil digenerate. Periksa dulu, lalu tandai finish untuk membagikan kodenya.");
    }

    /**
     * Halaman edit soal: pratinjau daftar soal + editor + tombol finish.
     */
    public function edit(Exam $exam): Response
    {
        $this->authorizeExam($exam);

        $exam->load('questions');
        $this->syncSummary($exam);

        return Inertia::render('guru/soal-edit', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'token' => $exam->token,
                'status' => $exam->status,
                'grade_level' => $exam->grade_level,
                'jumlah_soal' => $exam->jumlah_soal,
                'question_types' => $exam->question_types ?? [],
                'duration_minutes' => $exam->duration_minutes,
            ],
            'questions' => $exam->questions->map(fn ($q) => [
                'id' => $q->id,
                'order' => $q->order,
                'type' => $q->questionType()->value,
                'question' => $q->question,
                'options' => $q->options,
                'correct_answers' => $q->correctIndexes(),
            ])->values(),
        ]);
    }

    /**
     * Simpan satu soal hasil editan guru (per kartu).
     */
    public function update(Request $request, Exam $exam, Question $question): RedirectResponse
    {
        $this->authorizeExam($exam);
        abort_unless($question->exam_id === $exam->id, 404);

        $validated = $request->validate([
            'type' => ['required', 'string', Rule::enum(QuestionType::class)],
            'question' => ['required', 'string', 'min:5', 'max:1000'],
            'options' => ['array', 'max:8'],
            'options.*' => ['required', 'string', 'min:1', 'max:300'],
            'correct_answers' => ['sometimes', 'array'],
            'correct_answers.*' => ['integer', 'min:0', 'max:7'],
        ]);

        $type = QuestionType::from($validated['type']);
        $options = $type->isEssay()
            ? []
            : array_values($validated['options'] ?? []);

        if (! $type->isEssay() && count($options) < 2) {
            return back()->withErrors([
                'options' => 'Pilihan jawaban butuh minimal 2 opsi.',
            ]);
        }

        $correct = $this->normalizeCorrect(
            $validated['correct_answers'] ?? [],
            $options,
        );

        if (! $type->isEssay() && $correct === []) {
            return back()->withErrors([
                'correct_answers' => 'Tandai minimal satu jawaban benar.',
            ]);
        }

        $question->update([
            'type' => $type->value,
            'question' => $validated['question'],
            'options' => $options,
            'correct_answer' => $correct[0] ?? 0,
            'correct_answers' => $correct,
        ]);

        $this->syncSummary($exam->fresh('questions'));

        return back()->with('status', 'Soal berhasil disimpan.');
    }

    /**
     * Halaman khusus kode: guru menyalin kode 6 angka ke siswa.
     */
    public function code(Exam $exam): Response
    {
        $this->authorizeExam($exam);

        return Inertia::render('guru/kode', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'token' => $exam->token,
                'status' => $exam->status,
                'grade_level' => $exam->grade_level,
                'jumlah_soal' => $exam->questions()->count(),
                'question_types' => $exam->question_types ?? [],
                'duration_minutes' => $exam->duration_minutes,
                'questions_count' => $exam->questions()->count(),
            ],
        ]);
    }

    public function open(Exam $exam): RedirectResponse
    {
        $this->authorizeExam($exam);

        Exam::where('guru_id', $exam->guru_id)
            ->where('status', 'active')
            ->update(['status' => 'closed']);

        $exam->update(['status' => 'active']);

        return back()->with('status', "Ruang ujian {$exam->token} dibuka.");
    }

    private function uniqueToken(): string
    {
        do {
            $token = QuestionBank::generateToken();
        } while (Exam::where('token', $token)->exists());

        return $token;
    }

    /**
     * Samakan jumlah_soal & tipe soal di ujian dengan daftar soal terkini.
     */
    private function syncSummary(Exam $exam): void
    {
        $exam->update([
            'jumlah_soal' => $exam->questions->count(),
            'question_types' => $exam->questions->pluck('type')
                ->unique()
                ->values()
                ->all(),
        ]);
    }

    /**
     * Rapikan indeks jawaban benar (unik, terurut, dalam batas opsi).
     *
     * @param  array<int, mixed>  $given
     * @param  array<int, string>  $options
     * @return array<int, int>
     */
    private function normalizeCorrect(array $given, array $options): array
    {
        $correct = array_values(array_unique(array_map('intval', $given)));
        $correct = array_filter(
            $correct,
            fn (int $index) => $index >= 0 && $index < count($options),
        );
        sort($correct);

        return $correct;
    }

    private function authorizeExam(Exam $exam): void
    {
        abort_unless($exam->guru_id === request()->user()->id, 403);
    }
}
