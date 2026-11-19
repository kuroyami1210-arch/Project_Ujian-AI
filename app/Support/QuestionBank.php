<?php

namespace App\Support;

use App\Enums\QuestionType;

class QuestionBank
{
    /**
     * Kode ruang ujian: 6 angka tanpa nol di depan (100000-999999).
     */
    public static function generateToken(): string
    {
        return (string) random_int(100000, 999999);
    }

    /**
     * Bank soal default (Fisika — Hukum Gerak Newton).
     * Dipakai seeder dan saat guru generate exam baru (simulasi AI).
     *
     * @return array<int, array{question: string, options: array<int, string>, correct_answer: int}>
     */
    public static function physicsNewton(): array
    {
        return [
            [
                'question' => 'Sebuah benda bermassa 5 kg ditarik dengan gaya 25 N di atas permukaan tanpa gesekan. Berapakah percepatan yang dialami oleh benda tersebut?',
                'options' => ['2 m/s²', '5 m/s²', '10 m/s²', '125 m/s²'],
                'correct_answer' => 1,
            ],
            [
                'question' => 'Manakah pernyataan di bawah ini yang merupakan konsekuensi langsung dari Hukum III Newton (Aksi-Reaksi)?',
                'options' => [
                    'Benda diam akan cenderung tetap diam',
                    'Gaya aksi dan reaksi bekerja pada dua benda yang berbeda dengan besar sama dan arah berlawanan',
                    'Besar percepatan berbanding terbalik dengan massa benda',
                    'Energi mekanik selalu bernilai konstan jika tanpa gaya luar',
                ],
                'correct_answer' => 1,
            ],
            [
                'question' => 'Penumpang terdorong ke arah depan saat bus yang melaju kencang direm secara mendadak. Fenomena ini disebabkan oleh...',
                'options' => ['Gaya gravitasi bumi', 'Gaya gesek ban', 'Sifat inersia / kelembaman benda', 'Gaya normal jalan'],
                'correct_answer' => 2,
            ],
            [
                'question' => 'Jika resultan gaya yang bekerja pada suatu benda bernilai nol (∑F = 0), maka benda tersebut...',
                'options' => [
                    'Pasti dalam keadaan diam mutlak',
                    'Pasti bergerak lurus dengan percepatan konstan',
                    'Bisa diam atau bergerak lurus dengan kecepatan konstan (GLB)',
                    'Akan mengalami perlambatan hingga berhenti',
                ],
                'correct_answer' => 2,
            ],
            [
                'question' => 'Satuan standar internasional (SI) untuk besaran gaya adalah...',
                'options' => ['Joule', 'Pascal', 'Newton', 'Watt'],
                'correct_answer' => 2,
            ],
        ];
    }

    /**
     * Susun daftar soal sesuai jumlah per tipe yang dipilih guru (simulasi AI).
     * Contoh: ['Pilihan Ganda' => 5, 'Benar Salah' => 2] → 7 soal.
     *
     * @param  array<string, int>  $quantities
     * @return array<int, array{type: QuestionType, question: string, options: array<int, string>, correct_answer: int, correct_answers: array<int, int>}>
     */
    public static function generate(array $quantities): array
    {
        $bank = self::physicsNewton();
        $result = [];
        $i = 0;

        foreach ($quantities as $type => $count) {
            $questionType = QuestionType::from($type);

            for ($n = 0; $n < $count; $n++) {
                $item = $bank[count($result) % count($bank)];
                $result[] = self::shape($questionType, $item, $i++);
            }
        }

        return $result;
    }

    /**
     * @param  array{question: string, options: array<int, string>, correct_answer: int}  $item
     * @return array{type: QuestionType, question: string, options: array<int, string>, correct_answer: int, correct_answers: array<int, int>}
     */
    private static function shape(QuestionType $type, array $item, int $index): array
    {
        $question = $item['question'];
        $correct = $item['correct_answer'];

        if ($type === QuestionType::BenarSalah) {
            // Dua dari empat pernyataan bank soal memang benar.
            $isTrue = $index % 2 === 0;

            return [
                'type' => $type,
                'question' => $isTrue ? $question : self::negate($question),
                'options' => ['Benar', 'Salah'],
                'correct_answer' => $isTrue ? 0 : 1,
                'correct_answers' => [$isTrue ? 0 : 1],
            ];
        }

        if ($type === QuestionType::PilihanGandaKompleks) {
            // Pernyataan bertanda — dua pernyataan benar, siswa mencentang keduanya.
            $statements = $item['options'];
            $right = [$correct, ($correct + 2) % count($statements)];

            return [
                'type' => $type,
                'question' => $question.' Pilih semua pernyataan yang benar.',
                'options' => $statements,
                'correct_answer' => $correct,
                'correct_answers' => $right,
            ];
        }

        if ($type === QuestionType::Uraian) {
            return [
                'type' => $type,
                'question' => $question.' Jelaskan alasanmu secara singkat.',
                'options' => [],
                'correct_answer' => 0,
                'correct_answers' => [],
            ];
        }

        return [
            'type' => $type,
            'question' => $question,
            'options' => $item['options'],
            'correct_answer' => $correct,
            'correct_answers' => [$correct],
        ];
    }

    /** Ubah pernyataan menjadi negatif — dipakai untuk tipe benar/salah. */
    private static function negate(string $question): string
    {
        return 'Pernyataan berikut SALAH: "'.$question.'"';
    }
}
