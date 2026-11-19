<?php

namespace App\Http\Requests\Guru;

use App\Enums\QuestionType;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'topic' => ['required', 'string', 'min:10', 'max:2000'],
            'grade_level' => ['required', 'string', 'in:Kelas 10 SMA,Kelas 11 SMA,Kelas 12 SMA'],
            'question_quantities' => [
                'required',
                'array',
                'min:1',
                'max:4',
                // Kunci array wajib salah satu tipe soal yang dikenali.
                function (string $attribute, mixed $value, Closure $fail): void {
                    foreach (array_keys(is_array($value) ? $value : []) as $key) {
                        if (! is_string($key) || QuestionType::tryFrom($key) === null) {
                            $fail('Ada tipe soal yang tidak dikenali.');

                            return;
                        }
                    }
                },
            ],
            'question_quantities.*' => ['integer', 'min:1', 'max:50'],
            'duration_minutes' => ['sometimes', 'integer', 'min:5', 'max:180'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'topic' => 'topik',
            'grade_level' => 'tingkat kelas',
            'question_quantities' => 'tipe soal',
            'question_quantities.*' => 'jumlah soal',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'topic.min' => 'Isi topik minimal 10 karakter agar soal yang digenerate relevan.',
            'question_quantities.required' => 'Pilih minimal satu tipe soal.',
            'question_quantities.min' => 'Pilih minimal satu tipe soal.',
            'question_quantities.max' => 'Maksimal 4 tipe soal.',
            'question_quantities.*.min' => 'Jumlah soal minimal 1.',
            'question_quantities.*.max' => 'Jumlah soal maksimal 50 per tipe.',
            'duration_minutes.integer' => 'Isi durasi dalam angka menit.',
            'duration_minutes.min' => 'Durasi minimal 5 menit.',
            'duration_minutes.max' => 'Durasi maksimal 180 menit (3 jam).',
        ];
    }
}
