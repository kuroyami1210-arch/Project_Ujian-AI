<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $hasActiveExam = Exam::where('status', 'active')->exists();

        return Inertia::render('siswa/dashboard', [
            'hasActiveExam' => $hasActiveExam,
            'status' => $request->session()->get('status'),
        ]);
    }
}
