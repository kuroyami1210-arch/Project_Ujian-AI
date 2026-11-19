<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $exam = $this->sessionExam($request);

        $questions = $exam->questions->map(fn ($q) => [
            'id' => $q->id,
            'order' => $q->order,
            'type' => $q->questionType()->value,
            'question' => $q->question,
            'options' => $q->options,
        ])->values();

        return Inertia::render('siswa/ujian', [
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'token' => $exam->token,
                'duration_minutes' => $exam->duration_minutes,
                'total' => $questions->count(),
            ],
            'questions' => $questions,
        ]);
    }

    private function sessionExam(Request $request): Exam
    {
        $examId = (int) $request->session()->get('exam_id', 0);

        $exam = $examId
            ? Exam::with('questions')->where('status', 'active')->find($examId)
            : null;

        abort_unless($exam !== null, 403, 'Tidak ada ruang ujian aktif. Masukkan token terlebih dahulu.');

        return $exam;
    }
}
