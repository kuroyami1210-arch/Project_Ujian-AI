<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuruDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $guruId = $request->user()->id;

        $activeExam = Exam::where('guru_id', $guruId)
            ->where('status', 'active')
            ->withCount('questions')
            ->latest()
            ->first();

        $recentExams = Exam::where('guru_id', $guruId)
            ->withCount(['questions', 'attempts'])
            ->latest()
            ->take(5)
            ->get();

        $attemptQuery = ExamAttempt::whereHas('exam', fn ($q) => $q->where('guru_id', $guruId));

        return Inertia::render('guru/dashboard', [
            'activeExam' => $activeExam,
            'recentExams' => $recentExams,
            'stats' => [
                'totalExams' => Exam::where('guru_id', $guruId)->count(),
                'totalAttempts' => (clone $attemptQuery)->count(),
                'avgScore' => round((float) (clone $attemptQuery)->avg('score'), 1),
            ],
        ]);
    }
}
