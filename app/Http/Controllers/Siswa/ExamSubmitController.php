<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Siswa\SubmitExamRequest;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\RedirectResponse;

class ExamSubmitController extends Controller
{
    public function store(SubmitExamRequest $request): RedirectResponse
    {
        $examId = (int) $request->session()->get('exam_id', 0);

        $exam = $examId
            ? Exam::with('questions')->where('status', 'active')->find($examId)
            : null;

        abort_unless($exam !== null, 403, 'Tidak ada ruang ujian aktif.');

        $validated = $request->validated();
        $answers = $validated['answers'] ?? [];
        $doubtful = $validated['doubtful'] ?? [];

        $correct = 0;
        $scored = 0;
        foreach ($exam->questions as $q) {
            $type = $q->questionType();

            if (! $type->isScored()) {
                continue;
            }

            $scored++;

            $key = (string) $q->order;
            $given = $answers[$key] ?? null;

            if ($type->isMultipleChoice()) {
                $givenIndexes = array_map('intval', is_array($given) ? $given : []);
                sort($givenIndexes);
                $expected = $q->correctIndexes();
                sort($expected);

                if ($givenIndexes === $expected) {
                    $correct++;
                }

                continue;
            }

            if ($given !== null && (int) $given === $q->correct_answer) {
                $correct++;
            }
        }

        $total = $exam->questions->count();
        $wrong = $scored - $correct;
        $accuracy = $scored > 0 ? (int) round(($correct / $scored) * 100) : 0;

        $attempt = ExamAttempt::updateOrCreate(
            ['exam_id' => $exam->id, 'user_id' => $request->user()->id],
            [
                'answers' => $answers,
                'doubtful' => $doubtful,
                'score' => $accuracy,
                'correct_count' => $correct,
                'wrong_count' => $wrong,
                'accuracy' => $accuracy,
                'passed' => $accuracy >= 75,
                'submitted_at' => now(),
            ],
        );

        $request->session()->put('attempt_id', $attempt->id);

        return redirect()->to('/hasil');
    }
}
