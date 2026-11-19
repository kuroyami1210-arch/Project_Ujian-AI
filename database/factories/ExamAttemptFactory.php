<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExamAttempt>
 */
class ExamAttemptFactory extends Factory
{
    protected $model = ExamAttempt::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exam_id' => Exam::factory(),
            'user_id' => User::factory(),
            'answers' => [],
            'doubtful' => [],
            'score' => 0,
            'correct_count' => 0,
            'wrong_count' => 0,
            'accuracy' => 0,
            'passed' => false,
            'submitted_at' => now(),
        ];
    }
}
