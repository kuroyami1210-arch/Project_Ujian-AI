<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Guru\ExamController;
use App\Http\Controllers\Guru\GuruDashboardController;
use App\Http\Controllers\Guru\RecapController;
use App\Http\Controllers\Siswa\ExamJoinController;
use App\Http\Controllers\Siswa\ExamSessionController;
use App\Http\Controllers\Siswa\ExamSubmitController;
use App\Http\Controllers\Siswa\ResultController;
use App\Http\Controllers\Siswa\StudentDashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::middleware(['role:guru'])->prefix('guru')->name('guru.')->group(function () {
        Route::get('/', [GuruDashboardController::class, 'index'])->name('dashboard');
        Route::get('generate', [ExamController::class, 'create'])->name('generate');
        Route::post('soal', [ExamController::class, 'store'])->name('exams.store');
        Route::get('soal/{exam}/edit', [ExamController::class, 'edit'])->name('exams.edit');
        Route::put('soal/{exam}/{question}', [ExamController::class, 'update'])->name('exams.questions.update');
        Route::get('soal/{exam}/kode', [ExamController::class, 'code'])->name('exams.code');
        Route::post('soal/{exam}/buka', [ExamController::class, 'open'])->name('exams.open');

        Route::get('rekap', [RecapController::class, 'index'])->name('rekap');
        Route::get('rekap/export', [RecapController::class, 'export'])->name('rekap.export');
    });

    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('akun', [AccountController::class, 'index'])->name('akun');
        Route::post('akun', [AccountController::class, 'store'])->name('akun.store');
        Route::post('akun/import', [AccountController::class, 'import'])->name('akun.import');
        Route::get('akun/template/{format}', [AccountController::class, 'template'])
            ->where('format', 'csv|xlsx')
            ->name('akun.template');
        Route::post('akun/hapus-massal', [AccountController::class, 'bulkDestroy'])->name('akun.bulkDestroy');
        Route::post('akun/{user}/password', [AccountController::class, 'resetPassword'])->name('akun.password');
        Route::delete('akun/{user}', [AccountController::class, 'destroy'])->name('akun.destroy');
        Route::patch('akun/{user}/pulihkan', [AccountController::class, 'restore'])
            ->withTrashed()
            ->name('akun.restore');
        Route::delete('akun/{user}/permanen', [AccountController::class, 'forceDestroy'])
            ->withTrashed()
            ->name('akun.forceDestroy');
    });

    Route::middleware(['role:siswa'])->group(function () {
        Route::get('siswa', [StudentDashboardController::class, 'index'])->name('siswa.dashboard');
        Route::post('siswa/masuk', [ExamJoinController::class, 'store'])->name('siswa.join');
        Route::get('ujian', [ExamSessionController::class, 'index'])->name('ujian');
        Route::post('ujian/kumpulkan', [ExamSubmitController::class, 'store'])->name('ujian.submit');
        Route::get('hasil', [ResultController::class, 'index'])->name('hasil');
    });
});

require __DIR__.'/settings.php';
