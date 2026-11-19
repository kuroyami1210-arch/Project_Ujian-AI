<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResultController extends Controller
{
    public function index(Request $request): Response
    {
        $attemptId = (int) $request->session()->get('attempt_id', 0);

        $attempt = $attemptId
            ? ExamAttempt::with(['exam.questions', 'user:id,name'])
                ->where('user_id', $request->user()->id)
                ->find($attemptId)
            : ExamAttempt::with(['exam.questions', 'user:id,name'])
                ->where('user_id', $request->user()->id)
                ->latest('submitted_at')
                ->first();

        abort_unless($attempt && $attempt->submitted_at, 403, 'Belum ada hasil ujian.');

        $answers = $attempt->answers ?? [];

        $review = $attempt->exam->questions->map(function ($q) use ($answers) {
            $key = (string) $q->order;
            $type = $q->questionType();
            $userAnswer = $answers[$key] ?? null;
            $expected = $type->isMultipleChoice()
                ? $q->correctIndexes()
                : [$q->correct_answer];

            $isCorrect = $type->isEssay()
                ? null // dinilai guru, belum ada jawaban baku otomatis
                : $this->matches($userAnswer, $expected, $type->isMultipleChoice());

            return [
                'order' => $q->order,
                'type' => $type->value,
                'question' => $q->question,
                'options' => $q->options,
                'correct_answers' => $expected,
                'user_answer' => $userAnswer,
                'is_correct' => $isCorrect,
            ];
        })->values();

        return Inertia::render('siswa/hasil', [
            'exam' => [
                'title' => $attempt->exam->title,
                'token' => $attempt->exam->token,
            ],
            'result' => [
                'score' => $attempt->score,
                'correct' => $attempt->correct_count,
                'wrong' => $attempt->wrong_count,
                'accuracy' => $attempt->accuracy,
                'passed' => $attempt->passed,
                'total' => $review->count(),
                'feedback' => $this->feedback($attempt->correct_count, $attempt->correct_count + $attempt->wrong_count, $attempt->accuracy),
            ],
            'review' => $review,
        ]);
    }

    /**
     * @param  array<int, int>  $expected
     */
    private function matches(mixed $given, array $expected, bool $multiple): bool
    {
        if ($given === null || $given === '') {
            return false;
        }

        if ($multiple) {
            $givenIndexes = array_map('intval', is_array($given) ? $given : []);
            sort($givenIndexes);
            $sorted = $expected;
            sort($sorted);

            return $givenIndexes === $sorted;
        }

        return (int) $given === (int) $expected[0];
    }

    private function feedback(int $correct, int $total, int $accuracy): string
    {
        if ($total > 0 && $correct === $total) {
            return 'Siswa memahami seluruh konsep dengan sangat baik. Pertahankan dan lanjutkan ke materi lanjutan.';
        }

        if ($accuracy >= 70) {
            return 'Siswa memahami konsep dasar dengan baik. Perlu penguatan minor pada soal yang masih salah.';
        }

        return 'Siswa perlu pengulangan konsep dasar. Disarankan remedial dan latihan tambahan soal konseptual.';
    }
}
