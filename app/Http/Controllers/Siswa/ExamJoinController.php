<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Http\Requests\Siswa\JoinExamRequest;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;

class ExamJoinController extends Controller
{
    public function store(JoinExamRequest $request): RedirectResponse
    {
        $token = $request->validated()['token'];

        $exam = Exam::where('token', $token)->where('status', 'active')->first();

        if (! $exam) {
            return back()->withErrors(['token' => 'Token tidak ditemukan atau ruang ujian belum dibuka.']);
        }

        $request->session()->put('exam_id', $exam->id);
        $request->session()->forget('attempt_id');

        return redirect()->to('/ujian');
    }
}
