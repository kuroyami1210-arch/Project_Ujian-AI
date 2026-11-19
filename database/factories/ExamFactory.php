<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\Exam;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Exam>
 */
class ExamFactory extends Factory
{
    protected $model = Exam::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'guru_id' => User::factory(['role' => UserRole::Guru]),
            'title' => fake()->sentence(4),
            'topic' => fake()->sentence(10),
            'grade_level' => 'Kelas 10 SMA',
            'jumlah_soal' => 5,
            'question_types' => ['Pilihan Ganda'],
            'token' => (string) fake()->unique()->numberBetween(100000, 999999),
            'duration_minutes' => 30,
            'status' => 'active',
        ];
    }
}
