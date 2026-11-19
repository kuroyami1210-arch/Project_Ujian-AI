<?php

namespace App\Http\Requests\Siswa;

use Illuminate\Foundation\Http\FormRequest;

class SubmitExamRequest extends FormRequest
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
            'answers' => ['sometimes', 'array'],
            // PG/benar-salah: satu indeks. PG kompleks: daftar indeks. Uraian: teks.
            'answers.*' => ['nullable'],
            'answers.*.*' => ['integer', 'min:0', 'max:10'],
            'doubtful' => ['sometimes', 'array'],
            'doubtful.*' => ['boolean'],
        ];
    }
}
