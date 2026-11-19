<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    protected $model = Question::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exam_id' => Exam::factory(),
            'order' => 0,
            'type' => 'Pilihan Ganda',
            'question' => fake()->sentence(12),
            'options' => [
                'Pernyataan A',
                'Pernyataan B',
                'Pernyataan C',
                'Pernyataan D',
            ],
            'correct_answer' => 0,
            'correct_answers' => [0],
        ];
    }
}
