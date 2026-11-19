<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RecapController extends Controller
{
    public function index(Request $request): Response
    {
        $guruId = $request->user()->id;

        $exams = Exam::where('guru_id', $guruId)
            ->withCount('attempts')
            ->latest()
            ->get(['id', 'title', 'token', 'status', 'created_at']);

        $selectedExam = null;
        $rows = collect();

        if ($exams->isNotEmpty()) {
            $examId = (int) $request->query('exam_id', 0);
            $selectedExam = $exams->firstWhere('id', $examId) ?? $exams->first();

            $rows = ExamAttempt::where('exam_id', $selectedExam->id)
                ->with('user:id,name')
                ->orderByDesc('score')
                ->get()
                ->map(fn (ExamAttempt $a, int $i) => [
                    'no' => $i + 1,
                    'nama' => $a->user->name ?? '-',
                    'kelas' => $selectedExam->grade_level,
                    'benar' => $a->correct_count,
                    'salah' => $a->wrong_count,
                    'nilai' => $a->score,
                    'status' => $a->passed ? 'Lulus' : 'Remedial',
                ]);
        }

        return Inertia::render('guru/rekap', [
            'exams' => $exams,
            'selectedExam' => $selectedExam,
            'rows' => $rows,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $guruId = $request->user()->id;

        $examId = (int) $request->query('exam_id', 0);
        $exam = Exam::where('guru_id', $guruId)->findOrFail($examId ?: Exam::where('guru_id', $guruId)->latest()->firstOrFail()->id);

        $attempts = ExamAttempt::where('exam_id', $exam->id)
            ->with('user:id,name')
            ->orderByDesc('score')
            ->get();

        $filename = "rekap-nilai-{$exam->token}.csv";

        return response()->streamDownload(function () use ($attempts, $exam) {
            $out = fopen('php://output', 'w');

            if ($out === false) {
                return;
            }

            fwrite($out, "\u{FEFF}");
            fputcsv($out, ['No', 'Nama', 'Kelas', 'Benar', 'Salah', 'Nilai', 'Status']);
            foreach ($attempts as $i => $a) {
                fputcsv($out, [
                    $i + 1,
                    $a->user->name ?? '-',
                    $exam->grade_level,
                    $a->correct_count,
                    $a->wrong_count,
                    $a->score,
                    $a->passed ? 'Lulus' : 'Remedial',
                ]);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=utf-8']);
    }
}
