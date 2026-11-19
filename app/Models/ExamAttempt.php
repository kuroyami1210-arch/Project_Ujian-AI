<?php

namespace App\Models;

use Database\Factories\ExamAttemptFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $exam_id
 * @property int $user_id
 * @property array<int|string, int|array<int, int>|string>|null $answers
 * @property array<string, bool>|null $doubtful
 * @property int $score
 * @property int $correct_count
 * @property int $wrong_count
 * @property int $accuracy
 * @property bool $passed
 * @property Carbon|null $submitted_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ExamAttempt extends Model
{
    /** @use HasFactory<ExamAttemptFactory> */
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'user_id',
        'answers',
        'doubtful',
        'score',
        'correct_count',
        'wrong_count',
        'accuracy',
        'passed',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'doubtful' => 'array',
            'score' => 'integer',
            'correct_count' => 'integer',
            'wrong_count' => 'integer',
            'accuracy' => 'integer',
            'passed' => 'boolean',
            'submitted_at' => 'datetime',
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
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
