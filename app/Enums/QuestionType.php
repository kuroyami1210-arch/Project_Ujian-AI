<?php

namespace App\Enums;

enum QuestionType: string
{
    case PilihanGanda = 'Pilihan Ganda';
    case PilihanGandaKompleks = 'Pilihan Ganda Kompleks';
    case BenarSalah = 'Benar Salah';
    case Uraian = 'Uraian';

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function label(): string
    {
        return match ($this) {
            self::PilihanGanda => 'Pilihan Ganda',
            self::PilihanGandaKompleks => 'Pilihan Ganda Kompleks',
            self::BenarSalah => 'Benar Salah',
            self::Uraian => 'Uraian',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::PilihanGanda => 'Satu jawaban benar dari 4 opsi.',
            self::PilihanGandaKompleks => 'Centang semua pernyataan yang benar.',
            self::BenarSalah => 'Hanya dua pilihan: benar atau salah.',
            self::Uraian => 'Siswa menulis jawaban bebas.',
        };
    }

    /** Jumlah opsi yang ditampilkan ke siswa. */
    public function optionCount(): int
    {
        return match ($this) {
            self::PilihanGanda, self::PilihanGandaKompleks => 4,
            self::BenarSalah => 2,
            self::Uraian => 0,
        };
    }

    /** More than one correct answer? */
    public function isMultipleChoice(): bool
    {
        return $this === self::PilihanGandaKompleks;
    }

    public function isEssay(): bool
    {
        return $this === self::Uraian;
    }

    /** Uraian belum dinilai otomatis — dihitung belum dijawab. */
    public function isScored(): bool
    {
        return ! $this->isEssay();
    }
}
