<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ImportGuruRequest extends FormRequest
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
            'file' => ['required', 'file', 'max:5120', 'extensions:csv,txt,xlsx'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'file' => 'file data guru',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Pilih file data guru (CSV atau XLSX) terlebih dulu.',
            'file.extensions' => 'Format file harus .csv, .txt, atau .xlsx.',
            'file.max' => 'Ukuran file maksimal 5 MB.',
        ];
    }
}
