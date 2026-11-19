<?php

namespace App\Models;

use App\Enums\QuestionType;
use Database\Factories\QuestionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $exam_id
 * @property int $order
 * @property string $type
 * @property string $question
 * @property array<int, string> $options
 * @property int $correct_answer
 * @property array<int, int>|null $correct_answers
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Question extends Model
{
    /** @use HasFactory<QuestionFactory> */
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'order',
        'type',
        'question',
        'options',
        'correct_answer',
        'correct_answers',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'correct_answers' => 'array',
            'correct_answer' => 'integer',
            'order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Exam, $this>
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Tipe soal sebagai enum; jatuh ke Pilihan Ganda bila data lama belum punya type.
     */
    public function questionType(): QuestionType
    {
        return QuestionType::tryFrom((string) $this->type) ?? QuestionType::PilihanGanda;
    }

    /**
     * Indeks jawaban benar — tunggal untuk PG/benar-salah, banyak untuk PG kompleks.
     *
     * @return array<int, int>
     */
    public function correctIndexes(): array
    {
        if ($this->correct_answers !== null) {
            return $this->correct_answers;
        }

        return [$this->correct_answer];
    }
}
