<?php

namespace App\Models;

use Database\Factories\ExamFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $guru_id
 * @property string $title
 * @property string|null $topic
 * @property string $grade_level
 * @property int $jumlah_soal
 * @property array<int, string>|null $question_types
 * @property string $token
 * @property int $duration_minutes
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Exam extends Model
{
    /** @use HasFactory<ExamFactory> */
    use HasFactory;

    protected $fillable = [
        'guru_id',
        'title',
        'topic',
        'grade_level',
        'jumlah_soal',
        'question_types',
        'token',
        'duration_minutes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'question_types' => 'array',
            'jumlah_soal' => 'integer',
            'duration_minutes' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function guru(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    /**
     * @return HasMany<Question, $this>
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    /**
     * @return HasMany<ExamAttempt, $this>
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Kode 6 angka yang dibagikan ke siswa.
     */
    public function getKodeAttribute(): string
    {
        return $this->token;
    }
}
