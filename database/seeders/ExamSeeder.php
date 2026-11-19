<?php

namespace Database\Seeders;

use App\Enums\QuestionType;
use App\Enums\UserRole;
use App\Models\Exam;
use App\Models\User;
use App\Support\QuestionBank;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $guru = User::where('role', UserRole::Guru)->first() ?? User::create([
            'name' => 'Guru Demo',
            'email' => 'guru@example.com',
            'password' => 'password',
            'role' => UserRole::Guru,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $exam = Exam::firstOrCreate(
            ['token' => '483921'],
            [
                'guru_id' => $guru->id,
                'title' => 'Fisika — Hukum Gerak Newton',
                'topic' => 'Penerapan Hukum Termodinamika I dan II dalam siklus Carnot...',
                'grade_level' => 'Kelas 10 SMA',
                'jumlah_soal' => 5,
                'question_types' => [QuestionType::PilihanGanda->value],
                'duration_minutes' => 30,
                'status' => 'active',
            ],
        );

        if ($exam->questions()->count() === 0) {
            foreach (QuestionBank::physicsNewton() as $i => $item) {
                $exam->questions()->create([
                    'order' => $i,
                    'type' => QuestionType::PilihanGanda->value,
                    'question' => $item['question'],
                    'options' => $item['options'],
                    'correct_answer' => $item['correct_answer'],
                    'correct_answers' => [$item['correct_answer']],
                ]);
            }
        }
    }
}
